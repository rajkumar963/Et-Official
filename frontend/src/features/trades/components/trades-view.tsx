'use client';
import { useState } from 'react';
import { Search, Plus, Download, SlidersHorizontal } from 'lucide-react';
import { useJournal } from '@/features/journal/journal-provider';
import { PageHeading } from '@/components/ui/page-heading';
import { TradeTable } from './trade-table';
import { exportTrades } from '@/features/trades/export-csv';
import { signedMoney } from '@/lib/format';
import { headingActions } from '@/components/ui/page-heading';
import { buttonClass, textLinkClass } from '@/components/ui/button';
import { input, label } from '@/components/ui/form';
import { surface, tone } from '@/components/ui/styles';
import { cn } from '@/lib/cn';

const toolbar = 'mb-[18px] flex items-center gap-2.5 max-[1200px]:flex-wrap';
const filterSelect = cn(input, 'w-[160px] px-3 py-2.5 text-[12px] max-[700px]:w-[calc(50%-5px)]');
const dateLabel = cn(label, 'w-[190px] max-[700px]:w-[calc(50%-5px)]');
const pagerButton = buttonClass({ variant: 'secondary', size: 'sm' });
export function TradesView() {
  const { trades, openTrade } = useJournal();
  const [query, setQuery] = useState('');
  const [side, setSide] = useState('all');
  const [outcome, setOutcome] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [advanced, setAdvanced] = useState(false);
  const [page, setPage] = useState(1);
  const filtered = trades.filter(
    (t) =>
      `${t.symbol} ${t.strategy} ${t.notes}`.toLowerCase().includes(query.toLowerCase()) &&
      (side === 'all' || t.side === side) &&
      (outcome === 'all' ||
        (outcome === 'win' ? t.pnl > 0 : outcome === 'loss' ? t.pnl < 0 : t.pnl === 0)) &&
      (!from || t.date >= from) &&
      (!to || t.date <= to),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / 12));
  const current = Math.min(page, totalPages);
  return (
    <>
      <PageHeading
        eyebrow="THE DETAILS MAKE THE DIFFERENCE"
        title="Trades Log"
        description="Your decisions, documented. Your process, made visible."
        actions={
          <div className={headingActions}>
            <button
              className={buttonClass({ variant: 'secondary' })}
              onClick={() => exportTrades(filtered)}
            >
              <Download size={16} />
              Export CSV
            </button>
            <button className={buttonClass()} onClick={() => openTrade()}>
              <Plus size={17} />
              Log trade
            </button>
          </div>
        }
      />
      {/* Not <Panel>: its descendant h2 rules would restyle the trade dialogs rendered inside. */}
      <section
        className={cn(
          surface,
          'rise p-[22px] max-[1200px]:p-[19px] max-[700px]:rounded-2xl max-[700px]:p-4',
        )}
      >
        <div className={toolbar}>
          <div className="relative flex-1 max-[1200px]:min-w-[220px] max-[700px]:basis-full">
            <Search
              size={17}
              className="pointer-events-none absolute top-1/2 left-[13px] -translate-y-1/2 text-[#8b819f]"
            />
            <input
              className={cn(input, 'pl-10 text-[13px]')}
              aria-label="Search trades"
              placeholder="Search symbol, strategy, notes…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <select
            className={filterSelect}
            aria-label="Filter direction"
            value={side}
            onChange={(e) => {
              setSide(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All directions</option>
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
          <select
            className={filterSelect}
            aria-label="Filter outcome"
            value={outcome}
            onChange={(e) => {
              setOutcome(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All outcomes</option>
            <option value="win">Wins</option>
            <option value="loss">Losses</option>
            <option value="neutral">Breakeven</option>
          </select>
          <button
            className={buttonClass({ variant: 'secondary' })}
            onClick={() => setAdvanced(!advanced)}
            aria-expanded={advanced}
          >
            <SlidersHorizontal size={16} />
            Date range
          </button>
        </div>
        {advanced && (
          <div
            className={cn(
              toolbar,
              'animate-[rise_0.4s_var(--ease-smooth)_both] items-end rounded-[14px] border border-dashed border-line-strong bg-[#00000030] p-3.5',
            )}
          >
            <label className={dateLabel}>
              From
              <input
                className={cn(input, 'font-mono')}
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(1);
                }}
              />
            </label>
            <label className={dateLabel}>
              To
              <input
                className={cn(input, 'font-mono')}
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(1);
                }}
              />
            </label>
            <button
              className={textLinkClass}
              onClick={() => {
                setFrom('');
                setTo('');
                setQuery('');
                setSide('all');
                setOutcome('all');
              }}
            >
              Clear filters
            </button>
          </div>
        )}
        <div className="mb-2 flex items-center justify-between rounded-xl border border-[#ffffff08] bg-[#00000030] px-3.5 py-3 text-[12px] text-[#93899f]">
          <span>
            <strong className="font-mono text-[#ded5eb]">{filtered.length}</strong> executions
          </span>
          <span>
            Net P&amp;L{' '}
            <strong
              className={cn(
                'font-mono',
                filtered.reduce((a, t) => a + t.pnl, 0) >= 0 ? tone.green : tone.red,
              )}
            >
              {signedMoney(filtered.reduce((a, t) => a + t.pnl, 0))}
            </strong>
          </span>
        </div>
        <TradeTable trades={filtered.slice((current - 1) * 12, current * 12)} />
        <div className="flex items-center justify-between gap-3 py-4 text-[11px] text-[#8c849e]">
          <span>
            Page {current} of {totalPages}
          </span>
          <div className={headingActions}>
            <button
              className={pagerButton}
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              Previous
            </button>
            <button
              className={pagerButton}
              disabled={current === totalPages}
              onClick={() => setPage(current + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
