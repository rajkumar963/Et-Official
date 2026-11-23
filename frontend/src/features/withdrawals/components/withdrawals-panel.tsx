'use client';
import { useState, type FormEvent } from 'react';
import { Banknote, Plus, Trash2, X } from 'lucide-react';
import { withdrawalCreateSchema } from '@et-trader/shared';
import { useJournal } from '@/features/journal/journal-provider';
import { withdrawalService } from '@/features/withdrawals/withdrawals.api';
import { Panel, PanelHeader } from '@/components/ui/panel';
import { StatIcon } from '@/components/ui/stat-card';
import { buttonClass, iconButtonClass } from '@/components/ui/button';
import { errorBox, input, label, labelHint } from '@/components/ui/form';
import { mono, tone } from '@/components/ui/styles';
import { localDay, money, shortDate } from '@/lib/format';
import { cn } from '@/lib/cn';

export function WithdrawalsPanel({ index = 0 }: { index?: number }) {
  const { withdrawals, totalWithdrawn, refresh } = useJournal();
  const [adding, setAdding] = useState(false);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(localDay());
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);

  function reset() {
    setAdding(false);
    setAmount('');
    setNote('');
    setDate(localDay());
    setError('');
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = withdrawalCreateSchema.safeParse({
      amount: Math.abs(Number(amount) || 0),
      date,
      note: note.trim(),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Check the amount and try again.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await withdrawalService.create(parsed.data);
      await refresh();
      reset();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, amountLabel: string) {
    if (!window.confirm(`Remove this ${amountLabel} withdrawal? Your balance goes back up.`)) return;
    setRemovingId(id);
    setError('');
    try {
      await withdrawalService.remove(id);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <Panel index={index} className="flex flex-col gap-4">
      <PanelHeader>
        <div className="flex min-w-0 items-start gap-3">
          <StatIcon tone="amber">
            <Banknote size={16} />
          </StatIcon>
          <div className="min-w-0">
            <h2>Withdrawals</h2>
            <p className="mt-1 text-[12.5px] text-muted">
              Cash taken out. Subtracted from your balance, never from your P&amp;L.
            </p>
          </div>
        </div>
        {!adding && (
          <button className={buttonClass({ size: 'sm' })} onClick={() => setAdding(true)}>
            <Plus size={14} /> Withdraw
          </button>
        )}
      </PanelHeader>

      <div className="flex items-baseline justify-between gap-3 rounded-[14px] border border-[#fbbf2426] bg-[#fbbf240a] px-4 py-3">
        <span className="text-[12px] text-muted">Total withdrawn</span>
        <strong className={cn(mono, 'text-[20px] font-bold tabular-nums text-amber')}>
          {totalWithdrawn > 0 ? `-${money(totalWithdrawn)}` : money(0)}
        </strong>
      </div>

      {adding && (
        <form
          className="grid gap-3 rounded-[14px] border border-[#ffffff14] bg-[#ffffff05] p-4"
          onSubmit={submit}
        >
          <div className="grid grid-cols-2 gap-3 max-[700px]:grid-cols-1">
            <label className={label}>
              Amount (USD)
              <input
                className={cn(input, 'font-mono')}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                required
                autoFocus
                placeholder="e.g. 250.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
            <label className={label}>
              Date
              <input
                className={cn(input, 'font-mono')}
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
          </div>
          <label className={label}>
            <span>
              Note <span className={labelHint}>(optional)</span>
            </span>
            <input
              className={input}
              maxLength={200}
              placeholder="e.g. Monthly payout"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          {error && (
            <p className={errorBox} role="alert">
              {error}
            </p>
          )}
          <div className="flex items-center gap-2">
            <button className={buttonClass({ size: 'sm' })} disabled={busy}>
              {busy ? 'Saving…' : 'Record withdrawal'}
            </button>
            <button
              type="button"
              className={buttonClass({ variant: 'secondary', size: 'sm' })}
              onClick={reset}
            >
              <X size={14} /> Cancel
            </button>
          </div>
        </form>
      )}

      {!adding && error && (
        <p className={errorBox} role="alert">
          {error}
        </p>
      )}

      {withdrawals.length === 0 ? (
        <p className="py-4 text-center text-[13px] text-muted">
          No withdrawals yet. Record one when you take cash out.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {withdrawals.slice(0, 6).map((w) => (
            <li
              key={w.id}
              className="flex items-center gap-3 rounded-[12px] border border-[#ffffff0a] bg-[#00000030] px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <strong className={cn(mono, 'block text-[13px] tabular-nums text-amber')}>
                  -{money(w.amount)}
                </strong>
                <small className="mt-0.5 block truncate text-[11px] text-[#77748c]">
                  {shortDate(w.date)}
                  {w.note ? ` · ${w.note}` : ''}
                </small>
              </div>
              <button
                className={iconButtonClass({ danger: true, className: 'size-[28px] shrink-0' })}
                aria-label={`Remove ${money(w.amount)} withdrawal`}
                disabled={removingId === w.id}
                onClick={() => remove(w.id, money(w.amount))}
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {withdrawals.length > 6 && (
        <p className={cn(tone.muted, 'text-center text-[11.5px]')}>
          Showing the 6 most recent of {withdrawals.length}.
        </p>
      )}
    </Panel>
  );
}
