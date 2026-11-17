'use client';
import { useState, type CSSProperties } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  Sun,
  ListOrdered,
} from 'lucide-react';
import { useJournal } from '@/features/journal/journal-provider';
import { PageHeading } from '@/components/ui/page-heading';
import { StatCard, StatIcon } from '@/components/ui/stat-card';
import { Panel, PanelHeader } from '@/components/ui/panel';
import { buttonClass, iconButtonClass } from '@/components/ui/button';
import { formFooter } from '@/components/ui/form';
import { headingActions } from '@/components/ui/page-heading';
import { mono } from '@/components/ui/styles';
import { cn } from '@/lib/cn';
import { TradeTable } from '@/features/trades/components/trade-table';
import { Modal } from '@/components/ui/modal';
import { CountUp } from '@/components/effects/motion';
import { localDay, signedMoney } from '@/lib/format';

type Outcome = 'positive' | 'negative' | 'flat';
/** Day tint by outcome; brightness scales with the inline --heat (0-1). */
const outcomeCell: Record<Outcome, string> = {
  positive:
    'border-[rgb(74_222_128/calc(0.14_+_var(--heat)*0.3))] bg-[linear-gradient(160deg,rgb(74_222_128/calc(0.1_+_var(--heat)*0.28)),rgb(74_222_128/calc(0.03_+_var(--heat)*0.08)))] text-[#6ee7a0]',
  negative:
    'border-[rgb(255_92_108/calc(0.14_+_var(--heat)*0.3))] bg-[linear-gradient(160deg,rgb(255_92_108/calc(0.1_+_var(--heat)*0.28)),rgb(255_92_108/calc(0.03_+_var(--heat)*0.08)))] text-[#ff98a2]',
  flat: 'border-[#ffffff1a] bg-[#ffffff0c] text-[#c3bdd0]',
};
const legendItem = 'flex items-center gap-[7px]';
const legendDot = 'size-2 rounded-[3px]';
export function TradeCalendar() {
  const { summary, trades, openTrade } = useJournal();
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(month.getFullYear(), month.getMonth(), 1 - first.getDay());
  const cells = Array.from(
    { length: 42 },
    (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
  );
  const days = summary?.dailyPnl || [];
  const monthDays = days.filter((d) =>
    d.date.startsWith(`${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`),
  );
  const net = monthDays.reduce((a, d) => a + d.pnl, 0);
  const peak = Math.max(1, ...monthDays.map((d) => Math.abs(d.pnl)));
  const heading = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  function move(delta: number) {
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));
  }
  return (
    <>
      <PageHeading
        eyebrow="ONE DAY AT A TIME"
        title="Trade Calendar"
        description="See the rhythm of your trading. Make every session count."
        actions={
          <button className={buttonClass()} onClick={() => openTrade()}>
            <Plus size={17} />
            Log trade
          </button>
        }
      />
      <div className="grid grid-cols-[repeat(4,1fr)] gap-3.5 max-[900px]:grid-cols-[repeat(2,minmax(0,1fr))] max-[700px]:gap-2.5">
        <StatCard
          index={0}
          label="Monthly net P&L"
          icon={net >= 0 ? TrendingUp : TrendingDown}
          tone={net >= 0 ? 'green' : 'red'}
          valueTone={net >= 0 ? 'green' : 'red'}
          value={<CountUp value={net} format={signedMoney} />}
        />
        <StatCard
          index={1}
          label="Green days"
          icon={Sun}
          tone="green"
          value={monthDays.filter((d) => d.pnl > 0).length}
        />
        <StatCard
          index={2}
          label="Red days"
          icon={TrendingDown}
          tone="red"
          value={monthDays.filter((d) => d.pnl < 0).length}
        />
        <StatCard
          index={3}
          label="Trades logged"
          icon={ListOrdered}
          value={monthDays.reduce((a, d) => a + d.count, 0)}
        />
      </div>
      <Panel
        index={4}
        className="overflow-hidden p-0 pt-[22px] max-[1200px]:p-[19px] max-[700px]:p-0 max-[700px]:pt-4 max-[700px]:[&_h2]:text-[15px]"
      >
        <PanelHeader className="px-[22px] max-[700px]:px-3">
          <h2>
            <StatIcon tone="purple" className="max-[700px]:size-7 max-[700px]:[&_svg]:w-3.5">
              <CalendarDays size={16} />
            </StatIcon>
            {heading}
          </h2>
          <div className={headingActions}>
            <button
              className={buttonClass({ variant: 'secondary', size: 'sm' })}
              onClick={() => setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
            >
              Today
            </button>
            <button
              aria-label="Previous month"
              className={iconButtonClass({ bordered: true })}
              onClick={() => move(-1)}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              aria-label="Next month"
              className={iconButtonClass({ bordered: true })}
              onClick={() => move(1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </PanelHeader>
        <div className="grid grid-cols-[repeat(7,minmax(0,1fr))] border-t border-line py-3 text-center font-mono text-[10px] leading-[normal] font-semibold tracking-[0.08em] text-[#8f8ca5] max-[700px]:text-[8.5px]">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div
          className="grid grid-cols-[repeat(7,minmax(0,1fr))] gap-1.5 px-3.5 pb-1.5 max-[900px]:gap-1 max-[900px]:px-2 max-[700px]:gap-[3px] max-[700px]:px-[5px] max-[700px]:pb-[5px]"
          key={heading}
        >
          {cells.map((date, i) => {
            const key = localDay(date),
              day = days.find((d) => d.date === key);
            const outcome: Outcome | undefined = day
              ? day.pnl > 0
                ? 'positive'
                : day.pnl < 0
                  ? 'negative'
                  : 'flat'
              : undefined;
            const outside = date.getMonth() !== month.getMonth();
            return (
              <button
                key={key}
                data-testid="calendar-cell"
                data-outcome={outcome}
                className={cn(
                  'relative flex min-h-[108px] animate-[cell-pop_0.5s_calc(var(--i,0)*12ms)_var(--ease-smooth)_backwards] flex-col justify-between gap-3 rounded-[14px] border p-2.5 text-left hover:z-[1] hover:-translate-y-[3px] hover:shadow-[0_14px_30px_#00000066,0_0_0_1px_#a78bfa55]',
                  'max-[1200px]:min-h-[92px] max-[1200px]:p-2 max-[900px]:min-h-[82px] max-[900px]:rounded-[10px] max-[700px]:min-h-[66px] max-[700px]:gap-1 max-[700px]:rounded-lg max-[700px]:px-1 max-[700px]:py-[5px]',
                  // Outside-month styling overrides the outcome tint; the hover border only shows on plain days.
                  outside
                    ? 'border-dashed border-[#ffffff06] bg-transparent text-[#ffffff30] [&>div]:opacity-40'
                    : outcome
                      ? outcomeCell[outcome]
                      : 'border-[#ffffff08] bg-[#ffffff04] text-[#a59cb6] hover:border-[#a78bfa88]',
                )}
                style={{ '--i': i, '--heat': day ? Math.abs(day.pnl) / peak : 0 } as CSSProperties}
                onClick={() => setSelected(key)}
                aria-label={`${key}${day ? `, ${day.count} trades, net ${signedMoney(day.pnl)}` : ', no trades'}`}
              >
                <span
                  className={cn(
                    'grid size-[26px] place-items-center rounded-full font-mono text-[12px] leading-[normal] font-semibold max-[700px]:size-[21px] max-[700px]:text-[10px]',
                    key === localDay() &&
                      'animate-[pulse-dot_2s_infinite] bg-[linear-gradient(135deg,#8b5cf6,#6d28d9)] text-white shadow-[0_0_0_0_#8b5cf6aa]',
                  )}
                >
                  {date.getDate()}
                </span>
                {day && (
                  <div>
                    <strong
                      className={cn(
                        mono,
                        'text-[13.5px] tracking-[-0.04em] max-[1200px]:text-[12px] max-[900px]:text-[10.5px] max-[700px]:text-[8.5px] max-[700px]:tracking-[-0.06em]',
                      )}
                    >
                      {signedMoney(day.pnl)}
                    </strong>
                    <small className="mt-0.5 block text-[10px] opacity-70 max-[700px]:hidden">
                      {day.count} trade{day.count > 1 ? 's' : ''}
                    </small>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-[18px] px-[22px] py-4 text-[11px] text-[#9b91ab] max-[700px]:flex-wrap max-[700px]:gap-3 max-[700px]:p-3.5 max-[700px]:text-[9.5px]">
          <span className={legendItem}>
            <i className={cn(legendDot, 'bg-gain shadow-[0_0_8px_var(--color-gain)]')} />
            Profitable
          </span>
          <span className={legendItem}>
            <i className={cn(legendDot, 'bg-loss shadow-[0_0_8px_var(--color-loss)]')} />
            Loss
          </span>
          <span className={legendItem}>
            <i className={cn(legendDot, 'bg-[#858098]')} />
            Breakeven
          </span>
          <small className="ml-auto text-[10.5px] max-[900px]:hidden">
            Brighter days are bigger days · click any day to review or log a trade
          </small>
        </div>
      </Panel>
      {selected && (
        <Modal
          title={new Date(`${selected}T12:00:00`).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
          onClose={() => setSelected(null)}
        >
          <TradeTable trades={trades.filter((t) => t.date === selected)} />
          <div className={cn(formFooter, 'max-[700px]:flex-wrap')}>
            <button
              className={buttonClass()}
              onClick={() => {
                openTrade(undefined, selected);
                setSelected(null);
              }}
            >
              <Plus size={16} />
              Log trade for this day
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
