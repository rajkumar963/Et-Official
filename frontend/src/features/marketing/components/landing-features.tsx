import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  CalendarDays,
  ShieldCheck,
  NotebookPen,
  Download,
  SlidersHorizontal,
  FileSpreadsheet,
  Lock,
  BarChart3,
} from 'lucide-react';
import { gradientText, sectionLabel } from '@/features/marketing/marketing-styles';
import { cn } from '@/lib/cn';

const calendarValues = [
  null,
  null,
  null,
  240,
  180,
  -90,
  null,
  null,
  320,
  450,
  -120,
  210,
  null,
  null,
  null,
  -180,
  360,
  520,
  140,
  null,
  null,
  null,
  280,
  -60,
  480,
  190,
  null,
  null,
];
const dailyBars = [42, 68, -30, 55, 80, -48, 36, 92, 60, -22, 74, 100, -38, 58, 86];

/** Original kicker used the `font` shorthand, which also reset line-height to normal. */
const kicker = `${sectionLabel} leading-[normal]`;

/** Large display heading shared by the features, process and final CTA sections. */
export const displayHeading =
  'mt-[18px] font-display text-[length:clamp(36px,5vw,64px)] leading-[1.04] font-bold tracking-[-0.045em]';

/*
 * Bento cards are [data-reveal] targets: the reveal rule owns their transform/transition while
 * revealing, so the hover lift only applies when reveal is inactive (as in the original design).
 */
const card =
  'relative overflow-hidden rounded-[26px] border border-[#ffffff10] p-[30px] [background:radial-gradient(120%_80%_at_0%_0%,#8b5cf60f,transparent_60%),linear-gradient(180deg,#ffffff07,#ffffff02)] hover:border-[#a78bfa33] hover:shadow-[0_30px_80px_#00000066] not-in-[.reveal-ready]:[transition:transform_0.5s_var(--ease-smooth),border-color_0.4s,box-shadow_0.5s] not-in-[.reveal-ready]:hover:[transform:translateY(-4px)] max-[860px]:col-span-6 max-[560px]:p-[22px]';
const cardTitle = 'mt-5 font-display text-[23px] leading-[1.2] tracking-[-0.03em]';
const cardText = 'mt-3 text-[14.5px] leading-[1.7] text-[#9a97ae]';
const inset = 'rounded-[18px] border border-[#ffffff0d] bg-[#07070dcc]';
const dayCell =
  'flex aspect-[1/0.86] flex-col justify-between rounded-[8px] px-[6px] py-[5px] font-mono text-[9px] leading-[normal] [transition:transform_0.25s] hover:z-[1] hover:[transform:scale(1.12)] in-[.is-visible]:animate-[lp-cell-in_0.5s_calc(0.2s_+_var(--i)_*_28ms)_cubic-bezier(0.2,0.9,0.3,1.2)_both]';
const dayTone = {
  none: 'bg-[#ffffff05] text-[#55526a]',
  green:
    'bg-[rgb(74_222_128_/_calc(0.08_+_var(--heat)_*_0.34))] text-[#a7f3c4] shadow-[inset_0_0_0_1px_rgb(74_222_128_/_calc(0.1_+_var(--heat)_*_0.3))]',
  red: 'bg-[rgb(255_92_108_/_calc(0.08_+_var(--heat)_*_0.34))] text-[#ffc2c8] shadow-[inset_0_0_0_1px_rgb(255_92_108_/_calc(0.1_+_var(--heat)_*_0.3))]',
};
const tradeBox = 'flex flex-col gap-[3px] rounded-[11px] bg-[#ffffff06] p-[11px]';
const tradeBoxLabel = 'text-[10.5px] text-[#77748c]';
const bar =
  'h-[var(--h)] flex-1 origin-bottom rounded-[6px_6px_3px_3px] [transition:filter_0.2s] hover:brightness-[1.4] in-[.is-visible]:animate-[lp-grow-y_0.9s_calc(0.2s_+_var(--i)_*_55ms)_cubic-bezier(0.2,0.9,0.3,1.15)_both]';
const ring = 'absolute size-[46px] rounded-full border border-gain';

function FeatureIcon({ children }: { children: ReactNode }) {
  return (
    <span className="grid size-[46px] place-items-center rounded-[14px] border border-[#a78bfa40] bg-[linear-gradient(135deg,#8b5cf640,#8b5cf610)] text-[#d8ccff] shadow-[0_0_24px_#8b5cf62e,inset_0_1px_0_#ffffff20]">
      {children}
    </span>
  );
}

export function FeaturesSection() {
  return (
    <section
      className="mx-auto max-w-[1240px] scroll-mt-[100px] px-6 py-[130px] max-[860px]:px-[18px] max-[860px]:py-[90px]"
      id="courses"
    >
      <div
        className="mb-[60px] grid grid-cols-[1.2fr_1fr] items-end gap-10 max-[860px]:mb-10 max-[860px]:grid-cols-[1fr] max-[860px]:gap-5"
        data-reveal
      >
        <div>
          <span className={kicker}>
            <span />
            THE TOOLS BEHIND YOUR NEXT BREAKTHROUGH
          </span>
          <h2 className={displayHeading}>
            Less guesswork.
            <br />
            <span className={gradientText}>More perspective.</span>
          </h2>
        </div>
        <p className="max-w-[460px] justify-self-end text-[17px] leading-[1.75] text-[#a09db4] max-[860px]:justify-self-start">
          Bring your trades, numbers, and decisions together. Everything you need to improve your
          process, in a workspace that keeps you focused.
        </p>
      </div>
      <div className="grid grid-cols-6 gap-[18px]">
        <article
          className={cn(
            card,
            'spotlight col-span-4 grid grid-cols-[0.9fr_1.1fr] items-center gap-[30px] max-[1100px]:col-span-6 max-[860px]:grid-cols-[1fr]',
          )}
          data-reveal
        >
          <div>
            <FeatureIcon>
              <CalendarDays size={20} />
            </FeatureIcon>
            <h3 className={cardTitle}>
              See the bigger picture.
              <br />
              One day at a time.
            </h3>
            <p className={cardText}>
              Your trading calendar makes the patterns visible. Review the green days, learn from
              the red ones.
            </p>
            <Link
              href="/signup"
              className="mt-[22px] inline-flex items-center gap-[6px] text-[14px] font-semibold text-violet-3 hover:text-white"
            >
              Find your rhythm <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className={cn(inset, 'p-[18px] max-[560px]:p-3')}>
            <div className="mb-[14px] flex items-center justify-between text-[13px]">
              <strong>October performance</strong>
              <span className="font-mono text-[10px] leading-[normal] text-[#6e6b84]">
                Sample month
              </span>
            </div>
            <div className="grid grid-cols-7 gap-[5px]">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <span
                  key={i}
                  className="pb-[6px] text-center font-mono text-[10px] leading-[normal] font-semibold text-[#66637a]"
                >
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-[5px]">
              {calendarValues.map((v, i) => (
                <div
                  key={i}
                  style={
                    {
                      '--i': i,
                      '--heat': v === null ? 0 : Math.min(1, Math.abs(v) / 520),
                    } as CSSProperties
                  }
                  className={cn(
                    dayCell,
                    v === null ? dayTone.none : v >= 0 ? dayTone.green : dayTone.red,
                  )}
                >
                  <span className="opacity-60">{i + 1}</span>
                  {v !== null && (
                    <strong className="self-end text-[10px] max-[560px]:text-[8px]">
                      {v > 0 ? '+' : ''}
                      {v}
                    </strong>
                  )}
                </div>
              ))}
            </div>
          </div>
        </article>
        <article
          className={cn(
            card,
            'spotlight col-span-2 flex flex-col gap-6 max-[1100px]:col-span-6 max-[1100px]:grid max-[1100px]:grid-cols-[1fr_1fr] max-[1100px]:items-center max-[860px]:grid-cols-[1fr]',
          )}
          data-reveal
        >
          <div>
            <FeatureIcon>
              <NotebookPen size={20} />
            </FeatureIcon>
            <h3 className={cardTitle}>
              Capture the trade.
              <br />
              Remember the thinking.
            </h3>
            <p className={cardText}>
              Keep your setup, strategy, and lessons alongside every execution.
            </p>
          </div>
          <div className={cn(inset, 'mt-auto flex flex-col gap-[14px] p-[18px]')}>
            <div className="flex items-center gap-[11px]">
              <span className="grid size-9 place-items-center rounded-[11px] bg-[linear-gradient(135deg,#76b900,#3f6d00)] font-extrabold text-white">
                N
              </span>
              <div>
                <strong className="font-mono">EURUSD</strong>
                <small className="block text-[11px] text-[#77748c]">Morning breakout</small>
              </div>
              <span className="ml-auto rounded-full border border-[#4ade8035] bg-[#4ade8018] px-[9px] py-1 font-mono text-[10px] leading-[normal] font-semibold text-gain">
                LONG ↗
              </span>
            </div>
            <div className="grid grid-cols-[1fr_1fr] gap-[10px]">
              <div className={tradeBox}>
                <span className={tradeBoxLabel}>Net P&L</span>
                <strong className="font-mono text-[17px] leading-[normal] font-bold text-gain">
                  +$480.00
                </strong>
              </div>
              <div className={tradeBox}>
                <span className={tradeBoxLabel}>Strategy</span>
                <b className="text-[14px] font-semibold">Breakout</b>
              </div>
            </div>
            <div className="flex gap-[10px] rounded-[11px] border border-dashed border-[#a78bfa38] bg-[#8b5cf612] p-3 text-[12.5px] text-[#d0c8ea]">
              <NotebookPen size={14} className="mt-[2px] shrink-0 text-violet-2" />
              <p>
                Waited for the retest. Followed my plan.
                <span className="ml-[3px] inline-block h-[1em] w-[2px] animate-[lp-blink_1s_steps(1)_infinite] bg-violet-3 align-[-2px]" />
              </p>
            </div>
            <span className="text-center font-mono text-[9px] leading-[normal] font-semibold tracking-[0.12em] text-[#5d5a72]">
              ILLUSTRATIVE JOURNAL ENTRY
            </span>
          </div>
        </article>
        <article className={cn(card, 'spotlight col-span-3 flex flex-col gap-7')} data-reveal>
          <div>
            <FeatureIcon>
              <BarChart3 size={20} />
            </FeatureIcon>
            <h3 className={cardTitle}>Analytics that answer back.</h3>
            <p className={cardText}>
              Daily P&amp;L, best and worst days, biggest wins and your most traded symbols.
            </p>
          </div>
          <div
            className="mt-auto flex h-[160px] items-end gap-[7px] rounded-[18px] border border-[#ffffff0d] p-4 [background:repeating-linear-gradient(to_top,#ffffff08_0_1px,transparent_1px_40px),#07070dcc]"
            aria-hidden="true"
          >
            {dailyBars.map((v, i) => (
              <i
                key={i}
                className={cn(
                  bar,
                  v < 0
                    ? 'bg-[linear-gradient(180deg,#ff5c6c,#ff5c6c30)] shadow-[0_0_14px_#ff5c6c30]'
                    : 'bg-[linear-gradient(180deg,#4ade80,#4ade8030)] shadow-[0_0_14px_#4ade8030]',
                )}
                style={{ '--h': `${Math.abs(v)}%`, '--i': i } as CSSProperties}
              />
            ))}
          </div>
        </article>
        <article className={cn(card, 'spotlight col-span-3 flex flex-col gap-7')} data-reveal>
          <div>
            <FeatureIcon>
              <SlidersHorizontal size={20} />
            </FeatureIcon>
            <h3 className={cardTitle}>Find what works for you.</h3>
            <p className={cardText}>
              Filter by symbol, strategy, direction, outcome or date range.
            </p>
          </div>
          <div
            className={cn(inset, 'mt-auto flex flex-wrap gap-[10px] p-[18px]')}
            aria-hidden="true"
          >
            {['Long', 'Breakout', 'Wins only', 'EURUSD', 'This month', 'A+ setups'].map((chip, i) => (
              <span
                key={chip}
                className="animate-[lp-chip-cycle_7.2s_calc(var(--i)_*_1.2s)_infinite] rounded-full border border-[#ffffff14] bg-[#ffffff06] px-[15px] py-[9px] text-[13px] text-[#b9b6cb]"
                style={{ '--i': i } as CSSProperties}
              >
                {chip}
              </span>
            ))}
          </div>
        </article>
        <article className={cn(card, 'spotlight col-span-3')} data-reveal>
          <FeatureIcon>
            <Download size={20} />
          </FeatureIcon>
          <h3 className={cardTitle}>Your journal. Your control.</h3>
          <p className={cardText}>
            Export your trades to CSV and take your records with you, whenever you need.
          </p>
          <div
            className="relative mt-[26px] flex items-center gap-[11px] overflow-hidden rounded-[14px] border border-[#ffffff0d] bg-[#07070dcc] px-4 py-[14px] font-mono text-[13px] leading-[normal] font-medium"
            aria-hidden="true"
          >
            <FileSpreadsheet size={18} className="text-gain" />
            <span>trades.csv</span>
            <i className="absolute bottom-0 left-0 h-[2px] w-full origin-left animate-[lp-download_2.8s_ease-in-out_infinite] bg-[linear-gradient(90deg,#4ade80,#22d3ee)]" />
          </div>
        </article>
        <article className={cn(card, 'spotlight col-span-3')} data-reveal>
          <FeatureIcon>
            <ShieldCheck size={20} />
          </FeatureIcon>
          <h3 className={cardTitle}>Personal by design.</h3>
          <p className={cardText}>
            An account-owned journal with secure, HttpOnly sessions. A space just for you.
          </p>
          <div
            className="relative mt-[26px] grid h-[70px] place-items-center text-gain"
            aria-hidden="true"
          >
            <i className={cn(ring, 'animate-[lp-ring_2.8s_ease-out_infinite]')} />
            <i className={cn(ring, 'animate-[lp-ring_2.8s_ease-out_1.4s_infinite]')} />
            <Lock
              size={18}
              className="relative size-[46px] rounded-full border border-[#4ade8044] bg-[#4ade8018] p-3"
            />
          </div>
        </article>
      </div>
    </section>
  );
}
