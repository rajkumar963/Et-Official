import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tradeCreateSchema, tradePatchSchema } from '@et-trader/shared';

test('trade patch only contains the fields that were supplied', () => {
  // Regression: Zod 4 applies .default() inside .partial(), which used to inject
  // strategy: '', notes: '', tags: [] and wipe existing values on partial updates.
  assert.deepEqual(tradePatchSchema.parse({ pnl: 999 }), { pnl: 999 });
  assert.deepEqual(tradePatchSchema.parse({ symbol: 'spy' }), { symbol: 'SPY' });
});

test('trade patch rejects empty and unknown payloads', () => {
  assert(!tradePatchSchema.safeParse({}).success);
  assert(!tradePatchSchema.safeParse({ userId: '000000000000000000000001' }).success);
});

test('trade create still applies defaults for optional text fields', () => {
  const trade = tradeCreateSchema.parse({
    date: '2026-10-01',
    symbol: 'nvda',
    side: 'long',
    pnl: 1,
  });
  assert.equal(trade.strategy, '');
  assert.equal(trade.notes, '');
  assert.deepEqual(trade.tags, []);
});
