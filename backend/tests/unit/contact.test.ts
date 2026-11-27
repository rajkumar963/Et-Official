import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { JWT } from 'google-auth-library';
import type { ContactMessage } from '../../src/modules/contact/contact.schema';

process.env.JWT_ACCESS_SECRET = 'test-only-secret-at-least-thirty-two-characters';
process.env.NODE_ENV = 'test';
process.env.RESEND_API_KEY = '';
process.env.FRONTEND_ORIGINS = 'http://localhost:3000';
process.env.GOOGLE_SHEETS_SPREADSHEET_ID = 'contact-test-sheet';
process.env.GOOGLE_APPLICATION_CREDENTIALS = '';
process.env.GOOGLE_SHEETS_WEB_APP_URL = '';
process.env.GOOGLE_SHEETS_WEB_APP_SECRET = '';

const valid: ContactMessage = {
  name: 'Test Visitor',
  email: 'visitor@example.com',
  topic: 'Journal support',
  message: 'Please help me with my trading journal.',
};

async function testApp(save: (message: ContactMessage) => Promise<void>) {
  const { createContactRouter } = await import('../../src/modules/contact/contact.routes');
  const { checkOrigin } = await import('../../src/middleware/check-origin');
  const { errorHandler } = await import('../../src/middleware/error-handler');
  const app = express();
  app.use(express.json(), checkOrigin);
  app.use('/contact', createContactRouter(save));
  app.use(errorHandler);
  return app;
}

test('contact accepts guests, validates input and origin, and waits for storage', async () => {
  const saved: ContactMessage[] = [];
  const app = await testApp(async (message) => {
    saved.push(message);
  });
  const response = await request(app)
    .post('/contact')
    .set('Origin', 'http://localhost:3000')
    .send({ ...valid, name: '  Test Visitor  ' });
  assert.equal(response.status, 201);
  assert.match(response.body.data.message, /sent/);
  assert.equal(saved.length, 1);
  assert.equal(saved[0].name, 'Test Visitor');

  for (const invalid of [
    { ...valid, email: 'invalid' },
    { ...valid, topic: 'unknown' },
    { ...valid, message: 'short' },
    { ...valid, message: 'x'.repeat(5001) },
  ]) {
    const isolated = await testApp(async () => {
      assert.fail('Invalid form reached storage');
    });
    assert.equal(
      (
        await request(isolated)
          .post('/contact')
          .set('Origin', 'http://localhost:3000')
          .send(invalid)
      ).status,
      422,
    );
  }
  assert.equal(
    (await request(app).post('/contact').set('Origin', 'https://untrusted.example').send(valid))
      .status,
    403,
  );
  assert.equal(saved.length, 1);
});

test('contact ignores an autofilled website field from an older form and saves only contact details', async () => {
  const saved: ContactMessage[] = [];
  const app = await testApp(async (message) => {
    saved.push(message);
  });
  const response = await request(app)
    .post('/contact')
    .set('Origin', 'http://localhost:3000')
    .send({ ...valid, website: 'https://autofilled.example.com' });
  assert.equal(response.status, 201);
  assert.deepEqual(saved, [valid]);
  assert.equal(Object.hasOwn(saved[0], 'website'), false);
});

test('contact does not claim success on a storage failure and limits repeated messages', async (t) => {
  t.mock.method(console, 'error', () => {});
  const { HttpError } = await import('../../src/utils/http-error');
  const failing = await testApp(async () => {
    throw new HttpError(502, 'Delivery failed');
  });
  const failed = await request(failing)
    .post('/contact')
    .set('Origin', 'http://localhost:3000')
    .send(valid);
  assert.equal(failed.status, 502);
  assert.equal(failed.body.data, undefined);

  let count = 0;
  const app = await testApp(async () => {
    count++;
  });
  for (let i = 0; i < 5; i++)
    assert.equal(
      (await request(app).post('/contact').set('Origin', 'http://localhost:3000').send(valid))
        .status,
      201,
    );
  assert.equal(
    (await request(app).post('/contact').set('Origin', 'http://localhost:3000').send(valid)).status,
    429,
  );
  assert.equal(count, 5);
});

test('Sheets writes text in the correct columns and requires a confirmed row', async (t) => {
  const { env } = await import('../../src/config/env');
  const { appendContactMessage } = await import('../../src/modules/contact/contact.service');
  const { HttpError } = await import('../../src/utils/http-error');
  await assert.rejects(
    appendContactMessage(valid),
    (error: unknown) => error instanceof HttpError && error.status === 503,
  );
  const dir = await mkdtemp(join(tmpdir(), 'et-contact-'));
  const credential = join(dir, 'test-only.json');
  const previousPath = env.GOOGLE_APPLICATION_CREDENTIALS;
  const previousTab = env.GOOGLE_SHEETS_TAB;
  try {
    await writeFile(
      credential,
      JSON.stringify({
        type: 'service_account',
        client_email: 'test@example.iam.gserviceaccount.com',
        private_key:
          '-----BEGIN PRIVATE KEY-----\ntest-only-not-a-real-key\n-----END PRIVATE KEY-----',
      }),
    );
    env.GOOGLE_APPLICATION_CREDENTIALS = credential;
    env.GOOGLE_SHEETS_TAB = '';
    let confirmsRow = true;
    let fails = false;
    const calls: any[] = [];
    t.mock.method(JWT.prototype, 'request', async (options: any) => {
      calls.push(options);
      if (fails) throw new Error('provider error with private details');
      return { data: { updates: { updatedRows: confirmsRow ? 1 : 0 } } };
    });
    const formula = '=HYPERLINK("https://example.com", "test")';
    await appendContactMessage({ ...valid, message: formula });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].params.valueInputOption, 'RAW');
    assert.equal(calls[0].retry, false);
    assert.match(
      calls[0].url,
      /^https:\/\/sheets.googleapis.com\/v4\/spreadsheets\/contact-test-sheet\/values\//,
    );
    assert.deepEqual(calls[0].data.values[0].slice(1), [
      valid.name,
      valid.email,
      valid.topic,
      formula,
    ]);
    assert(!Number.isNaN(Date.parse(calls[0].data.values[0][0])));
    assert(calls[0].url.endsWith(`${encodeURIComponent('A:E')}:append`));
    env.GOOGLE_SHEETS_TAB = "Contact's inbox";
    await appendContactMessage(valid);
    assert(calls[1].url.endsWith(`${encodeURIComponent("'Contact''s inbox'!A:E")}:append`));
    confirmsRow = false;
    await assert.rejects(
      appendContactMessage(valid),
      (error: unknown) => error instanceof HttpError && error.status === 502,
    );
    fails = true;
    await assert.rejects(
      appendContactMessage(valid),
      (error: unknown) =>
        error instanceof HttpError &&
        error.status === 502 &&
        !error.message.includes('private details'),
    );
  } finally {
    env.GOOGLE_APPLICATION_CREDENTIALS = previousPath;
    env.GOOGLE_SHEETS_TAB = previousTab;
    assert(dir.startsWith(join(tmpdir(), 'et-contact-')));
    await rm(dir, { recursive: true, force: true });
  }
});

test('Apps Script supports the supplied help field and simple acknowledgement, and checks optional metadata', async (t) => {
  const { env } = await import('../../src/config/env');
  const { appendContactMessage } = await import('../../src/modules/contact/contact.service');
  const { HttpError } = await import('../../src/utils/http-error');
  const previousUrl = env.GOOGLE_SHEETS_WEB_APP_URL;
  const previousSecret = env.GOOGLE_SHEETS_WEB_APP_SECRET;
  try {
    env.GOOGLE_SHEETS_WEB_APP_URL = 'https://script.google.com/macros/s/test-deployment/exec';
    env.GOOGLE_SHEETS_WEB_APP_SECRET = '';
    let response = new Response(JSON.stringify({ ok: true }));
    const calls: { url: unknown; options?: RequestInit }[] = [];
    t.mock.method(globalThis, 'fetch', async (url: unknown, options?: RequestInit) => {
      calls.push({ url, options });
      return response;
    });
    await appendContactMessage(valid);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, env.GOOGLE_SHEETS_WEB_APP_URL);
    assert.equal(calls[0].options?.redirect, 'follow');
    const sent = JSON.parse(String(calls[0].options?.body));
    assert.equal(sent.secret, undefined);
    assert.equal(sent.message, valid.message);
    assert.equal(sent.help, valid.topic);
    assert.equal(sent.topic, valid.topic);
    env.GOOGLE_SHEETS_WEB_APP_SECRET = 'test-only-shared-secret-at-least-32-characters';
    response = new Response(
      JSON.stringify({ ok: true, spreadsheetId: 'contact-test-sheet', row: 2 }),
    );
    await appendContactMessage(valid);
    assert.equal(
      JSON.parse(String(calls[1].options?.body)).secret,
      env.GOOGLE_SHEETS_WEB_APP_SECRET,
    );
    for (const invalid of [
      { ok: false, error: 'Unauthorized.' },
      { ok: true, spreadsheetId: 'wrong-sheet', row: 2 },
      { ok: true, spreadsheetId: 'contact-test-sheet', row: 0 },
    ]) {
      response = new Response(JSON.stringify(invalid));
      await assert.rejects(
        appendContactMessage(valid),
        (error: unknown) => error instanceof HttpError && error.status === 502,
      );
    }
    response = new Response('<html>Sign in to Google</html>');
    await assert.rejects(
      appendContactMessage(valid),
      (error: unknown) => error instanceof HttpError && error.status === 502,
    );
    response = new Response('Unavailable', { status: 503 });
    await assert.rejects(
      appendContactMessage(valid),
      (error: unknown) => error instanceof HttpError && error.status === 502,
    );
    assert.equal(calls.length, 7);
  } finally {
    env.GOOGLE_SHEETS_WEB_APP_URL = previousUrl;
    env.GOOGLE_SHEETS_WEB_APP_SECRET = previousSecret;
  }
});
