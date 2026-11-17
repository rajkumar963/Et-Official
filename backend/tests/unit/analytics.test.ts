import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeAnalytics } from '../../src/modules/analytics/calculations';
import { daySchema, tradeQuerySchema } from '@et-trader/shared';
import type { TradeDto } from '@et-trader/shared';
function trade(date: string, pnl: number): TradeDto {
  return {
    id: '000000000000000000000001',
    date,
    pnl,
    symbol: 'NVDA',
    side: 'long',
    strategy: 'Breakout',
    notes: 'Followed plan',
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
test('empty journal has a baseline and finite JSON values', () => {
  const a = computeAnalytics([], 10000);
  assert.equal(a.winRate, 0);
  assert.equal(a.profitFactor, null);
  assert.equal(a.bestDay, null);
  assert.deepEqual(a.equityCurve, [{ date: 'Baseline', balance: 10000 }]);
  assert(!JSON.stringify(a).includes('NaN'));
  assert(a.behavioralScores.every((v) => v.score === 0));
});
test('daily net, best day, breakeven, equity baseline and streak are consistent', () => {
  const trades = [
    trade('2026-10-01', 200),
    trade('2026-10-01', -200),
    trade('2026-10-02', -50),
    trade('2026-10-03', 100),
    trade('2026-10-03', 80),
    trade('2026-10-04', 75),
  ];
  const a = computeAnalytics(trades, 10000);
  assert.deepEqual(a.dailyPnl[0], { date: '2026-10-01', pnl: 0, count: 2 });
  assert.equal(a.bestDay?.pnl, 180);
  assert.equal(a.bestDay?.date, '2026-10-03');
  assert.equal(a.worstDay?.pnl, -50);
  assert.equal(a.currentStreak.type, 'win');
  assert.equal(a.currentStreak.count, 2);
  assert.equal(a.equityCurve.at(-1)?.balance, 10205);
  const b = computeAnalytics(trades, 20000);
  assert.equal(b.totalPnl, a.totalPnl);
  assert.equal(b.equityCurve.at(-1)!.balance - a.equityCurve.at(-1)!.balance, 10000);
});
test('neutral day breaks streak; no-loss and no-win denominators are explicit', () => {
  assert.deepEqual(
    computeAnalytics([trade('2026-10-01', 200), trade('2026-10-02', 0)], 0).currentStreak,
    { type: 'neutral', count: 0 },
  );
  assert.equal(computeAnalytics([trade('2026-10-01', 200)], 0).profitFactor, null);
  assert.equal(computeAnalytics([trade('2026-10-01', -200)], 0).profitFactor, 0);
  assert.equal(computeAnalytics([trade('2026-10-01', 200), trade('2026-10-02', 0)], 0).winRate, 50);
});
test('calendar contracts reject rollover dates and partial month queries', () => {
  assert(!daySchema.safeParse('2026-02-30').success);
  assert(daySchema.safeParse('2024-02-29').success);
  assert(!tradeQuerySchema.safeParse({ month: 12, year: 2026 }).success);
  assert(!tradeQuerySchema.safeParse({ month: 0 }).success);
  assert(tradeQuerySchema.safeParse({ month: '0', year: '2026' }).success);
});
