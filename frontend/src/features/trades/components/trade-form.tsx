'use client';
import { useState, type FormEvent } from 'react';
import { tradeCreateSchema, type TradeDto } from '@et-trader/shared';
import { Modal } from '@/components/ui/modal';
import { tradeService } from '@/features/trades/trades.api';
import { useJournal } from '@/features/journal/journal-provider';
import { localDay } from '@/lib/format';
import { buttonClass } from '@/components/ui/button';
import {
  errorBox,
  form,
  formFooter,
  formGrid,
  input,
  label,
  labelHint,
  textarea,
} from '@/components/ui/form';
import { tone } from '@/components/ui/styles';
import { cn } from '@/lib/cn';

const monoInput = cn(input, 'font-mono');
const sideOption = {
  long: 'has-[input:checked]:bg-[linear-gradient(135deg,#4ade80,#22c55e)] has-[input:checked]:text-[#04140a] has-[input:checked]:shadow-[0_4px_18px_#4ade8055]',
  short:
    'has-[input:checked]:bg-[linear-gradient(135deg,#ff5c6c,#e11d48)] has-[input:checked]:text-white has-[input:checked]:shadow-[0_4px_18px_#ff5c6c55]',
};
export function TradeForm({
  trade,
  date,
  onClose,
}: {
  trade?: TradeDto;
  date?: string;
  onClose: () => void;
}) {
  const { refresh } = useJournal();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const f = new FormData(event.currentTarget);
    const optional = (key: string) => (f.get(key) ? Number(f.get(key)) : undefined);
    const parsed = tradeCreateSchema.safeParse({
      date: f.get('date'),
      symbol: f.get('symbol'),
      side: f.get('side'),
      pnl: Number(f.get('pnl')),
      strategy: f.get('strategy'),
      notes: f.get('notes'),
      entryPrice: optional('entryPrice'),
      exitPrice: optional('exitPrice'),
      quantity: optional('quantity'),
      tags: String(f.get('tags') || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => i.message).join('. '));
      setBusy(false);
      return;
    }
    try {
      await tradeService.save(parsed.data, trade?.id);
      await refresh();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={trade ? 'Edit trade' : 'Log a new trade'} onClose={onClose}>
      <form onSubmit={submit} className={form}>
        <p className={tone.muted}>
          Every execution is a lesson. Capture the details while they’re fresh.
        </p>
        <div className={formGrid}>
          <label className={label}>
            Trading date
            <input
              className={monoInput}
              name="date"
              type="date"
              required
              defaultValue={trade?.date || date || localDay()}
            />
          </label>
          <label className={label}>
            Symbol
            <input
              className={input}
              name="symbol"
              required
              maxLength={20}
              placeholder="e.g. NVDA"
              defaultValue={trade?.symbol}
            />
          </label>
          <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
            <legend className="mb-2 p-0 text-[12.5px] font-medium text-[#cdc6dd]">Direction</legend>
            <div className="grid grid-cols-2 gap-1 rounded-xl border border-line-strong bg-[#0a0a12cc] p-1">
              {(['long', 'short'] as const).map((side) => (
                <label
                  key={side}
                  className={cn(
                    'relative flex cursor-pointer flex-row items-center justify-center gap-2 rounded-lg p-2 font-mono text-[12px] font-semibold text-muted transition-[background,color,box-shadow] duration-[250ms] hover:text-white has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-violet-2',
                    sideOption[side],
                  )}
                >
                  <input
                    className="pointer-events-none absolute opacity-0"
                    type="radio"
                    name="side"
                    value={side}
                    defaultChecked={(trade?.side || 'long') === side}
                  />
                  {side === 'long' ? 'Long ↗' : 'Short ↘'}
                </label>
              ))}
            </div>
          </fieldset>
          <label className={label}>
            Net P&amp;L (USD)
            <input
              className={monoInput}
              name="pnl"
              type="number"
              step="0.01"
              required
              placeholder="e.g. 480.00"
              defaultValue={trade?.pnl}
            />
          </label>
          <label className={label}>
            Entry price
            <input
              className={monoInput}
              name="entryPrice"
              type="number"
              min="0"
              step="any"
              defaultValue={trade?.entryPrice}
            />
          </label>
          <label className={label}>
            Exit price
            <input
              className={monoInput}
              name="exitPrice"
              type="number"
              min="0"
              step="any"
              defaultValue={trade?.exitPrice}
            />
          </label>
          <label className={label}>
            Quantity
            <input
              className={monoInput}
              name="quantity"
              type="number"
              min="0.000001"
              step="any"
              defaultValue={trade?.quantity}
            />
          </label>
          <label className={label}>
            Strategy
            <input
              className={input}
              name="strategy"
              placeholder="Morning breakout"
              defaultValue={trade?.strategy}
            />
          </label>
        </div>
        <label className={label}>
          Tags <span className={labelHint}>(comma separated)</span>
          <input
            className={input}
            name="tags"
            defaultValue={trade?.tags.join(', ')}
            placeholder="breakout, patient, A+"
          />
        </label>
        <label className={label}>
          Trade notes
          <textarea
            className={textarea}
            name="notes"
            rows={3}
            placeholder="What was your thesis? What did you learn?"
            defaultValue={trade?.notes}
          />
        </label>
        {error && (
          <p className={errorBox} role="alert">
            {error}
          </p>
        )}
        <div className={cn(formFooter, 'max-[700px]:flex-wrap')}>
          <button type="button" className={buttonClass({ variant: 'secondary' })} onClick={onClose}>
            Cancel
          </button>
          <button disabled={busy} className={buttonClass()}>
            {busy ? 'Saving…' : trade ? 'Save changes' : 'Save trade'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
