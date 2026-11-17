import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { randomBytes } from 'node:crypto';

process.env.JWT_ACCESS_SECRET = 'test-only-secret-at-least-thirty-two-characters';
process.env.NODE_ENV = 'test';
process.env.RESEND_API_KEY = '';

test('email OTP: browser-bound codes, attempt limits, resend cooldown, unverified login and reclaim', async () => {
  const { app } = await import('../../src/app');
  const { User } = await import('../../src/models/User');
  const { Session } = await import('../../src/models/Session');
  const { EmailChallenge } = await import('../../src/models/EmailChallenge');
  const { devOutbox } = await import('../../src/services/mailer');
  await mongoose.connect(
    process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/et-trader_test',
    { serverSelectionTimeoutMS: 5000 },
  );
  const origin = 'http://localhost:3000';
  const email = `otp-${randomBytes(6).toString('hex')}@example.com`;
  const lastCode = () =>
    devOutbox
      .filter((m) => m.to === email)
      .at(-1)!
      .text.match(/(\d{6})/)![1];
  const post = (agent: ReturnType<typeof request.agent>, path: string, body?: object) =>
    agent.post(`/api/v1/auth${path}`).set('Origin', origin).send(body);

  try {
    const browser = request.agent(app);
    const attacker = request.agent(app);

    const signup = await post(browser, '/signup', {
      name: 'Otp Tester',
      email,
      password: 'long-test-password',
    });
    assert.equal(signup.status, 202);
    assert.match(signup.body.data.email, /^ot•+@example\.com$/);
    const code = lastCode();
    assert.equal(devOutbox.at(-1)!.subject, `${code} is your ET Trader verification code`);

    // Status endpoint only works for the browser holding the challenge cookie.
    assert.equal((await browser.get('/api/v1/auth/verification')).status, 200);
    assert.equal((await attacker.get('/api/v1/auth/verification')).status, 404);
    // Knowing the code is not enough without the challenge cookie.
    assert.equal((await post(attacker, '/verify-email', { code })).status, 404);

    // Not signed in yet, and password login only re-sends a code.
    assert.equal((await browser.get('/api/v1/trades')).status, 401);

    // Malformed and wrong codes.
    assert.equal((await post(browser, '/verify-email', { code: '12ab' })).status, 422);
    const wrong = code === '000000' ? '111111' : '000000';
    const miss = await post(browser, '/verify-email', { code: wrong });
    assert.equal(miss.status, 400);
    assert.match(miss.body.error.message, /4 attempts left/);

    // Resend is rate limited to one per minute.
    assert.equal((await post(browser, '/resend-verification')).status, 429);

    // The correct code signs the user in and is single-use.
    const ok = await post(browser, '/verify-email', { code });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.data.user.email, email);
    assert.equal((await browser.get('/api/v1/trades')).status, 200);
    assert.equal((await post(browser, '/verify-email', { code })).status, 404);
    assert.equal((await User.findOne({ email }))!.emailVerified, true);

    // A verified email can no longer be registered again.
    assert.equal(
      (
        await post(attacker, '/signup', {
          name: 'Someone Else',
          email,
          password: 'another-password-1',
        })
      ).status,
      409,
    );

    // Unverified accounts: login sends a code instead of a session; five wrong codes lock the code.
    await User.updateOne({ email }, { $set: { emailVerified: false } });
    await EmailChallenge.deleteMany({});
    const fresh = request.agent(app);
    const login = await post(fresh, '/login', { email, password: 'long-test-password' });
    assert.equal(login.status, 202);
    assert.equal(login.body.data.status, 'verification_required');
    const loginCode = lastCode();
    const bad = loginCode === '000000' ? '111111' : '000000';
    for (let i = 0; i < 5; i++) await post(fresh, '/verify-email', { code: bad });
    assert.equal((await post(fresh, '/verify-email', { code: loginCode })).status, 429);

    // Re-signing up an unverified email reclaims it with the new password.
    await EmailChallenge.deleteMany({});
    const reclaimer = request.agent(app);
    assert.equal(
      (await post(reclaimer, '/signup', { name: 'New Owner', email, password: 'new-password-123' }))
        .status,
      202,
    );
    assert.equal((await post(reclaimer, '/verify-email', { code: lastCode() })).status, 200);
    assert.equal(
      (await post(request.agent(app), '/login', { email, password: 'long-test-password' })).status,
      401,
    );
    const relogin = await post(request.agent(app), '/login', {
      email,
      password: 'new-password-123',
    });
    assert.equal(relogin.status, 200);
    assert.equal(relogin.body.data.user.name, 'New Owner');
  } finally {
    const users = await User.find({ email });
    const ids = users.map((u) => u._id);
    await Session.deleteMany({ userId: { $in: ids } });
    await EmailChallenge.deleteMany({ userId: { $in: ids } });
    await User.deleteMany({ _id: { $in: ids } });
    await mongoose.disconnect();
  }
});
