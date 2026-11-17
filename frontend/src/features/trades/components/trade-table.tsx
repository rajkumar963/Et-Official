'use client';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { Pencil, Trash2, Eye, ArrowUpRight, ArrowDownRight, Share2, Plus } from 'lucide-react';
import type { TradeDto } from '@et-trader/shared';
import { useJournal } from '@/features/journal/journal-provider';
import { tradeService } from '@/features/trades/trades.api';
import { signedMoney, shortDate } from '@/lib/format';
import { Modal } from '@/components/ui/modal';
import { badgeClass } from '@/components/ui/badge';
import { buttonClass, iconButtonClass } from '@/components/ui/button';
import { errorBox, formFooter } from '@/components/ui/form';
import { mono, tone } from '@/components/ui/styles';
import { cn } from '@/lib/cn';
const symbolHue = (symbol: string) =>
  [...symbol].reduce((hash, c) => (hash * 31 + c.charCodeAt(0)) % 360, 7);

const th =
  'border-b border-line px-3 py-3 text-left font-mono text-[9.5px] leading-[normal] font-semibold tracking-[0.08em] text-[#8f8ca5] uppercase';
const td = 'border-b border-[#ffffff07] px-3 py-[14px] text-[#d8d4e5]';
const cellSmall = 'mt-0.5 block text-[10px] text-[#77748c]';
const rowAction = iconButtonClass({ className: 'size-[30px]' });
/** Footer for dialogs: wraps on phones (previously .modal .form-footer). */
const dialogFooter = cn(formFooter, 'max-[700px]:flex-wrap');

function SymbolCell({ symbol, children }: { symbol: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-[11px]">
      <span
        className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-[linear-gradient(135deg,hsl(var(--hue)_70%_50%),hsl(calc(var(--hue)_+_40)_70%_30%))] font-mono text-[12px] leading-[normal] font-bold text-white shadow-[inset_0_1px_0_#ffffff30]"
        aria-hidden="true"
        style={{ '--hue': symbolHue(symbol) } as CSSProperties}
      >
        {symbol.slice(0, 1)}
      </span>
      <div>{children}</div>
    </div>
  );
}

function SideBadge({ side }: { side: TradeDto['side'] }) {
  return (
    <span className={badgeClass(side === 'long' ? 'gain' : 'loss')}>
      {side.toUpperCase()}{' '}
      {side === 'long' ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
    </span>
  );
}
export function TradeTable({ trades, compact = false }: { trades: TradeDto[]; compact?: boolean }) {
  const { openTrade, refresh } = useJournal();
  const [inspecting, setInspecting] = useState<TradeDto | null>(null);
  const [deleting, setDeleting] = useState<TradeDto | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [shared, setShared] = useState(false);
  async function remove() {
    if (!deleting) return;
    setBusy(true);
    try {
      await tradeService.remove(deleting.id);
      await refresh();
      setDeleting(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="w-full overflow-x-auto in-[dialog]:mt-1.5">
        <table className="w-full border-collapse text-left text-[13px] whitespace-nowrap">
          <thead>
            <tr>
              <th className={th}>Date</th>
              <th className={th}>Symbol</th>
              <th className={th}>Side</th>
              <th className={th}>Strategy</th>
              <th className={cn(th, 'text-right')}>Net P&amp;L</th>
              <th className={cn(th, 'text-right')}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t, i) => (
              <tr
                key={t.id}
                className="animate-[rise_0.5s_calc(var(--i,0)*40ms)_var(--ease-smooth)_backwards] transition-[background] duration-200 last:[&>td]:border-b-0 hover:bg-[linear-gradient(90deg,#8b5cf60f,transparent)]"
                style={{ '--i': i } as CSSProperties}
              >
                <td className={cn(td, mono)}>
                  {shortDate(t.date)}
                  <small className={cellSmall}>{t.date.slice(0, 4)}</small>
                </td>
                <td className={td}>
                  <SymbolCell symbol={t.symbol}>
                    <strong className="font-mono font-semibold">{t.symbol}</strong>
                    {!compact && (
                      <small className={cellSmall}>
                        {t.quantity ? `${t.quantity} units` : '—'}
                      </small>
                    )}
                  </SymbolCell>
                </td>
                <td className={td}>
                  <SideBadge side={t.side} />
                </td>
                <td className={cn(td, 'max-w-[160px] min-w-[110px] text-[12px] whitespace-normal')}>
                  {t.strategy || <span className={tone.muted}>No strategy</span>}
                </td>
                <td
                  className={cn(
                    td,
                    mono,
                    'text-right',
                    t.pnl > 0 && cn(tone.green, 'font-semibold'),
                    t.pnl < 0 && cn(tone.red, 'font-semibold'),
                  )}
                >
                  {signedMoney(t.pnl)}
                </td>
                <td className={td}>
                  <div className="flex items-center justify-end gap-0.5">
                    <button
                      className={rowAction}
                      aria-label={`Inspect ${t.symbol}`}
                      onClick={() => {
                        setShared(false);
                        setInspecting(t);
                      }}
                    >
                      <Eye size={16} />
                    </button>
                    {!compact && (
                      <>
                        <button
                          className={rowAction}
                          aria-label={`Edit ${t.symbol}`}
                          onClick={() => openTrade(t)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className={iconButtonClass({ danger: true, className: 'size-[30px]' })}
                          aria-label={`Delete ${t.symbol}`}
                          onClick={() => {
                            setError('');
                            setDeleting(t);
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!trades.length && (
          <div className="px-5 py-14 text-center">
            <span
              className="inline-grid size-16 animate-[float-y_4s_ease-in-out_infinite] place-items-center rounded-[20px] bg-[linear-gradient(135deg,#8b5cf6,#0891b2)] text-white shadow-[0_0_50px_#8b5cf666]"
              aria-hidden="true"
            >
              <ArrowUpRight size={28} />
            </span>
            <h3 className="mt-[22px] mb-2 font-display text-[19px]">
              Your next insight starts with a trade.
            </h3>
            <p className="mt-2 mb-6 text-[13px] text-muted">
              Log your first execution to start discovering your edge.
            </p>
            <button className={buttonClass()} onClick={() => openTrade()}>
              <Plus size={16} />
              Log your first trade
            </button>
          </div>
        )}
      </div>
      {deleting && (
        <Modal title="Delete this trade?" onClose={() => setDeleting(null)}>
          <p className={tone.muted}>
            This will permanently remove your {deleting.symbol} trade from{' '}
            {shortDate(deleting.date)} and update your analytics.
          </p>
          {error && (
            <p className={errorBox} role="alert">
              {error}
            </p>
          )}
          <div className={dialogFooter}>
            <button
              className={buttonClass({ variant: 'secondary' })}
              onClick={() => setDeleting(null)}
            >
              Keep trade
            </button>
            <button
              className={buttonClass({ variant: 'destructive' })}
              disabled={busy}
              onClick={remove}
            >
              {busy ? 'Deleting…' : 'Delete trade'}
            </button>
          </div>
        </Modal>
      )}
      {inspecting && (
        <Modal
          title={`${inspecting.symbol} · Trade inspection`}
          onClose={() => setInspecting(null)}
        >
          <div className="flex flex-col items-start gap-[18px]">
            <div
              className={cn(
                'relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-[18px] border bg-[#00000040] p-[22px]',
                inspecting.pnl >= 0
                  ? 'border-[#4ade8030] shadow-[inset_0_0_60px_#4ade8018]'
                  : 'border-[#ff5c6c30] shadow-[inset_0_0_60px_#ff5c6c18]',
              )}
            >
              <SymbolCell symbol={inspecting.symbol}>
                <strong className={mono}>{inspecting.symbol}</strong>
                <small className={cn('mt-0.5 block text-[10px]', tone.muted)}>
                  {inspecting.date}
                </small>
              </SymbolCell>
              <div className="text-right">
                <SideBadge side={inspecting.side} />
                <strong
                  className={cn(
                    mono,
                    'mt-2.5 block text-[44px] leading-none font-bold tracking-[-0.06em] max-[700px]:text-[34px]',
                    inspecting.pnl >= 0 ? tone.green : tone.red,
                  )}
                >
                  {signedMoney(inspecting.pnl)}
                </strong>
              </div>
            </div>
            <div className="grid w-full grid-cols-3 gap-2.5 max-[1200px]:grid-cols-2">
              {[
                ['Trading date', inspecting.date],
                ['Strategy', inspecting.strategy || '—'],
                ['Quantity', inspecting.quantity ?? '—'],
                ['Entry price', inspecting.entryPrice ?? '—'],
                ['Exit price', inspecting.exitPrice ?? '—'],
                ['Tags', inspecting.tags.join(', ') || '—'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[13px] border border-[#ffffff09] bg-[#ffffff05] p-[13px]"
                >
                  <small className={tone.muted}>{label}</small>
                  <p className="mt-1 font-mono text-[13px] wrap-anywhere">{value}</p>
                </div>
              ))}
            </div>
            <h3>Journal notes</h3>
            <p className="w-full rounded-[13px] border-l-2 border-violet-2 bg-[#8b5cf60d] px-4 py-[14px] text-[13.5px] leading-[1.7] whitespace-pre-wrap text-[#bcb3cf] wrap-anywhere">
              {inspecting.notes || 'No notes added.'}
            </p>
          </div>
          <div className={dialogFooter}>
            <button
              className={buttonClass({ variant: 'secondary' })}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    `${inspecting.symbol} | ${inspecting.side.toUpperCase()} | ${signedMoney(inspecting.pnl)} | ${inspecting.date} — ET Trader`,
                  );
                  setShared(true);
                } catch {
                  setError('Clipboard unavailable in this browser.');
                }
              }}
            >
              <Share2 size={15} />
              {shared ? 'Copied' : 'Copy trade card'}
            </button>
            <button
              className={buttonClass()}
              onClick={() => {
                openTrade(inspecting);
                setInspecting(null);
              }}
            >
              Edit trade
            </button>
          </div>
          {error && (
            <p role="alert" className={errorBox}>
              {error}
            </p>
          )}
        </Modal>
      )}
    </>
  );
}
