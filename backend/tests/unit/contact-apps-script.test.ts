import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createContext, runInContext } from 'node:vm';

const scriptPath = [
  resolve('google-apps-script/Code.gs'),
  resolve('backend/google-apps-script/Code.gs'),
].find(existsSync)!;
const script = readFileSync(scriptPath, 'utf8');
const sheetId = '16U9lTOd0e5iEWExcQ3qIJQSjmQakE-OQ-oYjURhpXpU';
const valid = {
  secret: 'test-only-shared-secret',
  name: 'Test Visitor',
  email: 'visitor@example.com',
  topic: 'E-books',
  message: 'Please tell me when the books launch.',
};

function harness(existingRows: string[][] = []) {
  const state = {
    rows: existingRows.map((row) => [...row]),
    properties: new Map<string, string>(),
    writes: 0,
    frozen: 0,
    flushes: 0,
    releases: 0,
    opened: 0,
    lockAvailable: true,
    failFlush: false,
  };
  const sheet = {
    getSheetId: () => 0,
    getLastRow: () => state.rows.length,
    getMaxRows: () => 1000,
    insertRowsAfter: () => {},
    setFrozenRows: (n: number) => {
      state.frozen = n;
    },
    getRange: (row: number) => {
      const range = {
        setNumberFormat: () => range,
        setFontWeight: () => range,
        setValues: (values: string[][]) => {
          state.rows[row - 1] = Array.from(values[0]);
          state.writes++;
          return range;
        },
      };
      return range;
    },
  };
  const context = createContext({
    console: { log: () => {} },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key: string) => state.properties.get(key),
        setProperty: (key: string, value: string) => state.properties.set(key, value),
      }),
    },
    Utilities: { getUuid: () => 'test-uuid-with-enough-random-characters' },
    LockService: {
      getScriptLock: () => ({
        waitLock: () => {},
        tryLock: () => state.lockAvailable,
        releaseLock: () => {
          state.releases++;
        },
      }),
    },
    SpreadsheetApp: {
      openById: (id: string) => {
        assert.equal(id, sheetId);
        state.opened++;
        return { getSheets: () => [sheet] };
      },
      flush: () => {
        if (state.failFlush) throw new Error('provider error');
        state.flushes++;
      },
    },
    ContentService: {
      MimeType: { JSON: 'application/json' },
      createTextOutput: (text: string) => ({ setMimeType: () => JSON.parse(text) }),
    },
  });
  runInContext(script, context);
  return {
    state,
    setup: () => context.setupContactSheet(),
    get: () => context.doGet(),
    post: (input: unknown) =>
      context.doPost({
        postData: { contents: typeof input === 'string' ? input : JSON.stringify(input) },
      }),
  };
}

test('Apps Script setup preserves existing rows and generates a reusable secret', () => {
  const app = harness([['Existing header'], ['Existing message']]);
  app.setup();
  const secret = app.state.properties.get('CONTACT_SHARED_SECRET');
  assert(secret && secret.length >= 32);
  assert.deepEqual(app.state.rows, [['Existing header'], ['Existing message']]);
  app.setup();
  assert.equal(app.state.properties.get('CONTACT_SHARED_SECRET'), secret);
  assert.equal(app.state.releases, 2);
  assert.equal(app.get().ready, true);
  assert(!JSON.stringify(app.get()).includes(secret));
});

test('Apps Script rejects invalid or unauthorized writes before opening the sheet', () => {
  const app = harness();
  app.state.properties.set('CONTACT_SHARED_SECRET', valid.secret);
  for (const input of [
    'not json',
    null,
    { ...valid, secret: 'wrong' },
    { ...valid, message: 'short' },
    { ...valid, topic: 'invalid' },
    { ...valid, website: 'spam' },
  ])
    assert.equal(app.post(input).ok, false);
  assert.equal(app.state.opened, 0);
  assert.equal(app.state.writes, 0);
});

test('Apps Script appends one row, escapes formulas and only acknowledges flushed writes', () => {
  const app = harness();
  app.state.properties.set('CONTACT_SHARED_SECRET', valid.secret);
  const response = app.post({ ...valid, name: '=1+1' });
  assert.equal(response.ok, true);
  assert.equal(response.spreadsheetId, sheetId);
  assert.equal(response.row, 2);
  assert.equal(app.state.rows.length, 2);
  assert.deepEqual(app.state.rows[0], ['Timestamp (UTC)', 'Name', 'Email', 'Topic', 'Message']);
  assert.equal(app.state.rows[1][1], "'=1+1");
  assert.deepEqual(app.state.rows[1].slice(2), [valid.email, valid.topic, valid.message]);
  assert.equal(app.state.flushes, 1);
  assert.equal(app.state.releases, 1);
  app.state.failFlush = true;
  assert.equal(app.post(valid).ok, false);
  assert.equal(app.state.releases, 2);
  const busy = harness();
  busy.state.properties.set('CONTACT_SHARED_SECRET', valid.secret);
  busy.state.lockAvailable = false;
  assert.equal(busy.post(valid).ok, false);
  assert.equal(busy.state.writes, 0);
});
