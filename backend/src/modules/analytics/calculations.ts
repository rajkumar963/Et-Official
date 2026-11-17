import type { TradeDto, AnalyticsSummary, DayPnl } from '@et-trader/shared';
const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
const score = (n: number) => Math.round(Math.max(0, Math.min(100, n)));
export function computeAnalytics(trades: TradeDto[], startingBalance: number): AnalyticsSummary {
  const positive = trades.filter((t) => t.pnl > 0),
    negative = trades.filter((t) => t.pnl < 0);
  const grossWin = sum(positive.map((t) => t.pnl)),
    grossLoss = -sum(negative.map((t) => t.pnl));
  const totalPnl = grossWin - grossLoss;
  const wins = positive.length,
    losses = negative.length,
    totalTrades = trades.length,
    winRate = totalTrades ? (wins / totalTrades) * 100 : 0;
  const avgWin = wins ? grossWin / wins : 0,
    avgLoss = losses ? -grossLoss / losses : 0;
  const map = new Map<string, DayPnl>();
  const symbols = new Map<string, number>();
  for (const t of trades) {
    const day = map.get(t.date) || { date: t.date, pnl: 0, count: 0 };
    day.pnl += t.pnl;
    day.count++;
    map.set(t.date, day);
    symbols.set(t.symbol, (symbols.get(t.symbol) || 0) + 1);
  }
  const dailyPnl = [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
  let balance = startingBalance;
  const equityCurve = [
    { date: 'Baseline', balance },
    ...dailyPnl.map((d) => ({ date: d.date, balance: (balance += d.pnl) })),
  ];
  const ranked = [...dailyPnl].sort((a, b) => b.pnl - a.pnl);
  const last = dailyPnl.at(-1);
  const type = last ? (last.pnl > 0 ? 'win' : last.pnl < 0 ? 'loss' : 'neutral') : 'neutral';
  let count = 0;
  if (type !== 'neutral') {
    for (const day of [...dailyPnl].reverse()) {
      if ((day.pnl > 0 ? 'win' : day.pnl < 0 ? 'loss' : 'neutral') !== type) break;
      count++;
    }
  }
  const profitFactor = grossLoss ? grossWin / grossLoss : null;
  const noteRatio = totalTrades ? trades.filter((t) => t.notes.trim()).length / totalTrades : 0;
  const strategyRatio = totalTrades
    ? trades.filter((t) => t.strategy.trim()).length / totalTrades
    : 0;
  const mean = dailyPnl.length ? sum(dailyPnl.map((d) => Math.abs(d.pnl))) / dailyPnl.length : 0;
  const variability = mean
    ? Math.sqrt(sum(dailyPnl.map((d) => (Math.abs(d.pnl) - mean) ** 2)) / dailyPnl.length) / mean
    : 0;
  return {
    totalPnl,
    totalTrades,
    wins,
    losses,
    breakeven: totalTrades - wins - losses,
    winRate,
    profitFactor,
    avgWin,
    avgLoss,
    biggestWin: Math.max(0, ...positive.map((t) => t.pnl)),
    biggestLoss: Math.min(0, ...negative.map((t) => t.pnl)),
    grossWin,
    grossLoss,
    bestDay: ranked[0] || null,
    worstDay: ranked.at(-1) || null,
    currentStreak: { type, count },
    mostTradedSymbol:
      [...symbols].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] || null,
    dailyPnl,
    equityCurve,
    behavioralScores: [
      { name: 'Discipline', score: score(noteRatio * 100) },
      {
        name: 'Risk Management',
        score: score(
          totalTrades ? (avgLoss ? (avgWin / Math.abs(avgLoss)) * 40 : wins ? 100 : 0) : 0,
        ),
      },
      { name: 'Timing', score: score(winRate) },
      { name: 'Consistency', score: score(totalTrades ? 100 / (1 + variability) : 0) },
      { name: 'Strategy', score: score(strategyRatio * 100) },
      {
        name: 'Psychology',
        score: score(
          totalTrades
            ? 50 + noteRatio * 30 + (type === 'win' ? count * 4 : type === 'loss' ? -count * 4 : 0)
            : 0,
        ),
      },
    ],
  };
}
