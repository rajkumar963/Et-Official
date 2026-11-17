import type { TradeDto } from '@et-trader/shared';
export function exportTrades(trades: TradeDto[]) {
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [
    ['date', 'symbol', 'side', 'strategy', 'pnl', 'notes'],
    ...trades.map((t) => [t.date, t.symbol, t.side, t.strategy, t.pnl, t.notes]),
  ]
    .map((row) =>
      row.map((v) => escape(typeof v === 'string' && /^[=+@-]/.test(v) ? `'${v}` : v)).join(','),
    )
    .join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'et-trader-trades.csv';
  link.click();
  URL.revokeObjectURL(url);
}
