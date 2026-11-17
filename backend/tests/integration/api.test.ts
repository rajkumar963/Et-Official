import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { randomBytes } from 'node:crypto';
process.env.JWT_ACCESS_SECRET = 'test-only-secret-at-least-thirty-two-characters';
process.env.NODE_ENV = 'test';
process.env.RESEND_API_KEY = ''; // never send real email from tests
test('API core workflow: authentication, ownership, validation, analytics, profile and logout', async () => {
  const { app } = await import('../../src/app');
  const { User } = await import('../../src/models/User');
  const { Trade } = await import('../../src/models/Trade');
  const { Session } = await import('../../src/models/Session');
  const { devOutbox } = await import('../../src/services/mailer');
  const codeFor = (email: string) =>
    devOutbox
      .filter((m) => m.to === email)
      .at(-1)!
      .text.match(/(\d{6})/)![1];
  await mongoose.connect(
    process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/et-trader_test',
    { serverSelectionTimeoutMS: 5000 },
  );
  const suffix = randomBytes(6).toString('hex');
  const emails = [`a-${suffix}@example.com`, `b-${suffix}@example.com`];
  const alice = request.agent(app),
    bob = request.agent(app);
  const origin = 'http://localhost:3000';
  let userIds: mongoose.Types.ObjectId[] = [];
  try {
    assert.equal((await request(app).get('/api/v1/trades')).status, 401);
    // Sign-up emails a code instead of signing in; verifying the code from the same browser signs in.
    for (const [agent, name, email] of [
      [alice, 'Alice', emails[0]],
      [bob, 'Bob', emails[1]],
    ] as const) {
      const signup = await agent
        .post('/api/v1/auth/signup')
        .set('Origin', origin)
        .send({ name, email, password: 'long-test-password' });
      assert.equal(signup.status, 202);
      assert.equal(signup.body.data.status, 'verification_required');
      assert.equal((await agent.get('/api/v1/trades')).status, 401);
      const verified = await agent
        .post('/api/v1/auth/verify-email')
        .set('Origin', origin)
        .send({ code: codeFor(email) });
      assert.equal(verified.status, 200);
      assert.equal(verified.body.data.status, 'authenticated');
    }
    userIds = (await User.find({ email: { $in: emails } })).map((u) => u._id);
    assert.equal(
      (await alice.post('/api/v1/trades').set('Origin', 'https://evil.example').send({})).status,
      403,
    );
    assert.equal(
      (
        await alice
          .post('/api/v1/trades')
          .set('Origin', origin)
          .send({ date: '2026-02-30', symbol: 'NVDA', side: 'long', pnl: 200 })
      ).status,
      422,
    );
    const created = await alice
      .post('/api/v1/trades')
      .set('Origin', origin)
      .send({ date: '2026-10-01', symbol: 'nvda', side: 'long', pnl: 200 });
    assert.equal(created.status, 201);
    const id = created.body.data.id;
    assert.equal(created.body.data.symbol, 'NVDA');
    for (const method of ['get', 'patch', 'delete'] as const) {
      const response = await bob[method](`/api/v1/trades/${id}`)
        .set('Origin', origin)
        .send(method === 'patch' ? { pnl: 999 } : undefined);
      assert.equal(response.status, 404);
    }
    const loser = await alice
      .post('/api/v1/trades')
      .set('Origin', origin)
      .send({ date: '2026-10-01', symbol: 'SPY', side: 'short', pnl: -200, strategy: 'Fade' });
    let summary = (await alice.get('/api/v1/analytics/summary')).body.data;
    assert.equal(summary.dailyPnl[0].pnl, 0);
    assert.equal(summary.dailyPnl[0].count, 2);
    assert.equal((await alice.get('/api/v1/trades?month=9&year=2026')).body.data.length, 2);
    assert.equal((await alice.get('/api/v1/trades?month=8&year=2026')).body.data.length, 0);
    assert.equal(
      (
        await alice
          .patch(`/api/v1/trades/${loser.body.data.id}`)
          .set('Origin', origin)
          .send({ date: '2026-10-02' })
      ).status,
      200,
    );
    // Partial updates must not reset fields that were not supplied.
    assert.equal(
      (await alice.get(`/api/v1/trades/${loser.body.data.id}`)).body.data.strategy,
      'Fade',
    );
    assert.equal((await alice.delete(`/api/v1/trades/${id}`).set('Origin', origin)).status, 200);
    summary = (await alice.get('/api/v1/analytics/summary')).body.data;
    assert.equal(summary.totalPnl, -200);
    const profile = await alice
      .patch('/api/v1/users/me')
      .set('Origin', origin)
      .send({ startingBalance: 20000 });
    assert.equal(profile.status, 200);
    assert.equal(
      (await alice.get('/api/v1/analytics/summary')).body.data.equityCurve.at(-1).balance,
      19800,
    );
    const refresh = await alice.post('/api/v1/auth/refresh').set('Origin', origin);
    assert.equal(refresh.status, 200);
    const cookies = refresh.headers['set-cookie'];
    const access = Array.from(cookies as unknown as string[])
      .find((c) => c.startsWith('tj_access='))!
      .split(';')[0];
    assert.equal((await alice.post('/api/v1/auth/logout').set('Origin', origin)).status, 200);
    assert.equal((await request(app).get('/api/v1/trades').set('Cookie', access)).status, 401);
    assert.equal(
      (
        await alice
          .post('/api/v1/auth/login')
          .set('Origin', origin)
          .send({ email: emails[0], password: 'wrong-password' })
      ).status,
      401,
    );
    assert.equal(
      (
        await alice
          .post('/api/v1/auth/login')
          .set('Origin', origin)
          .send({ email: emails[0], password: 'long-test-password' })
      ).status,
      200,
    );
    assert.equal((await alice.get('/api/v1/auth/me')).body.data.passwordHash, undefined);
  } finally {
    userIds = (await User.find({ email: { $in: emails } })).map((u) => u._id);
    await Trade.deleteMany({ userId: { $in: userIds } });
    await Session.deleteMany({ userId: { $in: userIds } });
    await User.deleteMany({ _id: { $in: userIds } });
    await mongoose.disconnect();
  }
});
