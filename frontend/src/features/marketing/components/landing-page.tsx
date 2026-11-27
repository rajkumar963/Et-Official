'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Check,
  ChartNoAxesCombined,
  TrendingUp,
  NotebookPen,
  Crosshair,
  Sparkles,
} from 'lucide-react';
import { SiteNavbar } from './site-navbar';
import { SiteFooter } from './site-footer';
import { ContactSection } from './contact-section';
import { CommunitySection } from './community-section';
import { CoursesSection, EbooksSection, LearningSectionLinks } from './learning-sections';
import { ForexCoursesSection } from './forex-courses-section';
import { LandingHero, primaryButton } from './landing-hero';
import { MarketSessions } from '@/components/ui/market-sessions';
import { FeaturesSection, displayHeading } from './landing-features';
import { CountUp, useReveal, useSpotlight } from '@/components/effects/motion';
import { gradientText, home, sectionLabel } from '@/features/marketing/marketing-styles';
import { cn } from '@/lib/cn';
import type { AnalyticsSummary } from '@et-trader/shared';
import { API_URL } from '@/config/env';
import { getSessionUser } from '@/features/auth/auth.api';

const marketsTop = [
  'EURUSD',
  'EURJPY',
  'EURGBP',
  'USDJPY',
  'Gold',
  'Silver',
  'Bitcoin',
];
const marketsBottom = [
  'Breakouts',
  'VWAP bounces',
  'Opening range',
  'Swing trades',
  'Scalps',
  'Mean reversion',
  'Earnings plays',
  'Trend follows',
];
const radarPoints = [
  [180, 42],
  [272, 85],
  [255, 180],
  [180, 240],
  [96, 185],
  [105, 91],
];

const fmtMoney = (n: number) =>
  `${n > 0 ? '+' : n < 0 ? '−' : ''}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Original kicker used the `font` shorthand, which also reset line-height to normal. */
const kicker = `${sectionLabel} leading-[normal]`;

const learningIntro = 'mx-auto mb-[42px] max-w-[760px] text-center';
const learningHeading =
  'mt-[18px] font-display text-[length:clamp(34px,5vw,56px)] leading-[1.08] tracking-[-0.045em]';
const learningText = 'mx-auto mt-[18px] max-w-[590px] text-[16px] leading-[1.7] text-[#a09db4]';
const marqueeMask =
  'group overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]';
const metricValue =
  'block bg-clip-text font-mono text-[length:clamp(28px,3.2vw,44px)] leading-[1.12] font-bold tracking-[-0.05em] text-transparent';

const sampleMetrics = [
  { label: 'Net P&L', value: 4820.5, format: fmtMoney, green: true },
  { label: 'Win rate', value: 68.4, format: (n: number) => `${n.toFixed(1)}%`, green: false },
  { label: 'Profit factor', value: 2.41, format: (n: number) => n.toFixed(2), green: false },
  { label: 'Trades journaled', value: 142, format: (n: number) => Math.round(n).toString(), green: false },
];

function PerformanceSnapshot() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [checked, setChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timer: number | undefined;

    const refresh = async () => {
      const user = await getSessionUser();
      if (!user) {
        if (mounted) {
          setSignedIn(false);
          setChecked(true);
        }
        return false;
      }
      if (mounted) setSignedIn(true);
      try {
        const response = await fetch(`${API_URL}/analytics/summary`, {
          credentials: 'include',
          cache: 'no-store',
        });
        if (!response.ok) return true;
        const result = (await response.json()) as { data: AnalyticsSummary };
        if (mounted) {
          setSummary(result.data);
          setChecked(true);
        }
      } catch {
        if (mounted) setChecked(true);
      }
      return true;
    };

    void refresh().then((signedIn) => {
      if (signedIn && mounted) timer = window.setInterval(() => void refresh(), 30_000);
    });
    return () => {
      mounted = false;
      if (timer !== undefined) window.clearInterval(timer);
    };
  }, []);

  const metrics = summary
    ? [
        { label: 'Net P&L', value: summary.totalPnl, format: fmtMoney, green: summary.totalPnl >= 0 },
        { label: 'Win rate', value: summary.winRate, format: (n: number) => `${n.toFixed(1)}%`, green: false },
        {
          label: 'Profit factor',
          value: summary.profitFactor ?? 0,
          format: (n: number) => summary.profitFactor === null ? '—' : n.toFixed(2),
          green: false,
        },
        { label: 'Trades journaled', value: summary.totalTrades, format: (n: number) => Math.round(n).toString(), green: false },
      ]
    : sampleMetrics;

  return (
    <section className="mx-auto max-w-[1240px] px-6 pt-5 pb-10 text-center max-[760px]:px-[18px]" aria-label="Trading performance snapshot">
      <div className="overflow-hidden rounded-[24px] border border-[#ffffff12] bg-[radial-gradient(70%_150%_at_50%_0%,#8b5cf61c,transparent_72%),linear-gradient(180deg,#11111bcc,#090910e8)] shadow-[0_20px_65px_#00000040,inset_0_1px_0_#ffffff0b]" data-reveal>
        <div className="flex items-center justify-between gap-4 border-b border-[#ffffff0c] px-7 py-4 text-left max-[560px]:px-4">
          <span className="font-mono text-[10px] font-semibold tracking-[0.16em] text-[#9d99b3] uppercase">Performance snapshot</span>
          {summary ? (
            <span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.12em] text-[#86efac] uppercase">
              <span className="size-1.5 animate-pulse rounded-full bg-[#4ade80]" /> Live journal
            </span>
          ) : (
            <span className="font-mono text-[10px] tracking-[0.1em] text-[#77748c] uppercase">
              {checked ? (signedIn ? 'Journal unavailable' : 'Sample preview') : 'Loading your journal…'}
            </span>
          )}
        </div>
        <div className="grid grid-cols-4 max-[760px]:grid-cols-2">
          {metrics.map((m, i) => (
            <div
              key={m.label}
              className={cn(
                'flex min-w-0 flex-col items-center justify-center gap-2 px-4 py-8 max-[560px]:px-2 max-[560px]:py-6',
                i > 0 && 'border-l border-[#ffffff0c]',
                i === 2 && 'max-[760px]:border-l-0',
                i >= 2 && 'max-[760px]:border-t border-[#ffffff0c]',
              )}
            >
              <CountUp
                value={m.value}
                format={m.format}
                duration={1800}
                className={cn(
                  metricValue,
                  m.green
                    ? 'bg-[linear-gradient(180deg,#86efac,#22c55e)]'
                    : 'bg-[linear-gradient(180deg,#fff,#b8b0d8)]',
                  summary && m.label === 'Net P&L' && summary.totalPnl < 0 && 'bg-[linear-gradient(180deg,#fda4af,#fb7185)]',
                )}
              />
              <span className="text-[12px] font-medium text-[#9692aa]">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
      <small className="mt-3 block font-mono text-[10px] leading-normal tracking-[0.08em] text-[#6e6b84]">
        {summary
          ? 'Your personal journal · lifetime totals · refreshes automatically'
          : signedIn
            ? 'Example data shown · reconnect to load your live journal stats'
            : 'Illustrative sample month · sign in to see your live journal stats'}
      </small>
    </section>
  );
}

export function LandingPage() {
  const page = useReveal<HTMLDivElement>();
  useSpotlight();
  return (
    <div className={home} ref={page}>
      <div
        className="fixed inset-x-0 top-0 z-[70] h-[2px] origin-[0_50%] bg-[linear-gradient(90deg,var(--color-violet),var(--color-violet-3),var(--color-cyan))] shadow-[0_0_12px_#8b5cf6aa] [transform:scaleX(0)] supports-[animation-timeline:scroll()]:[animation-fill-mode:both] supports-[animation-timeline:scroll()]:[animation-name:lp-grow-x] supports-[animation-timeline:scroll()]:[animation-timeline:scroll(root)] supports-[animation-timeline:scroll()]:[animation-timing-function:linear]"
        aria-hidden="true"
      />
      <SiteNavbar />
      <main>
        <LandingHero />
        <MarketSessions className="border-y border-[#ffffff0f]" />

        <section
          className="flex flex-col gap-[22px] pt-[90px] pb-10"
          aria-label="Supported markets and setups"
        >
          <p className="mb-[10px] text-center font-mono text-[11px] leading-[normal] font-semibold tracking-[0.18em] text-[#6e6b84]">
            ONE JOURNAL. <strong className="text-violet-3">EVERY MARKET. EVERY SETUP.</strong>
          </p>
          <div className={marqueeMask}>
            <div className="flex w-max animate-[lp-marquee_38s_linear_infinite] gap-[14px] group-hover:[animation-play-state:paused]">
              {[...marketsTop, ...marketsTop].map((m, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-[10px] rounded-full border border-[#ffffff12] bg-[#ffffff05] px-6 py-[14px] text-[18px] font-medium whitespace-nowrap text-[#d9d6e8] max-[560px]:px-[18px] max-[560px]:py-[11px] max-[560px]:text-[15px]"
                  aria-hidden={i >= marketsTop.length}
                >
                  <TrendingUp size={18} className="text-violet-2" />
                  {m}
                </span>
              ))}
            </div>
          </div>
          <div className={marqueeMask} aria-hidden="true">
            <div className="flex w-max animate-[lp-marquee_55s_linear_infinite_reverse] gap-10 group-hover:[animation-play-state:paused]">
              {[...marketsBottom, ...marketsBottom].map((m, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-10 font-display text-[length:clamp(36px,5vw,64px)] font-bold tracking-[-0.04em] whitespace-nowrap text-transparent [-webkit-text-stroke:1px_#ffffff2e] [transition:color_0.3s] hover:text-violet-3 hover:[-webkit-text-stroke-color:transparent]"
                >
                  {m}
                  <i className="text-[0.5em] text-violet not-italic [-webkit-text-stroke:0]">✦</i>
                </span>
              ))}
            </div>
          </div>
        </section>

        <FeaturesSection />

        <section
          className="mx-auto max-w-[1240px] scroll-mt-[100px] px-6 py-[100px] max-[760px]:px-[18px] max-[760px]:py-[78px]"
          id="courses"
        >
          <div className={learningIntro}>
            <span className={kicker}>TRADING VIDEO COURSES</span>
            <h2 className={learningHeading}>
              Trading courses for <span className={gradientText}>binary and forex.</span>
            </h2>
            <p className={learningText}>
              Learn Binary ET Strategies or build your skills from Basic to Advanced.
              Our dedicated Forex Gold Masterclass is coming soon.
            </p>
          </div>
          <CoursesSection />
          <ForexCoursesSection className="mt-14" />
          <LearningSectionLinks />
        </section>

        <PerformanceSnapshot />

        <section
          className="mx-auto grid max-w-[1240px] scroll-mt-[100px] grid-cols-[1fr_1fr] items-center gap-20 px-6 py-[130px] max-[1100px]:grid-cols-[1fr] max-[1100px]:gap-[50px] max-[860px]:px-[18px] max-[860px]:py-[90px]"
          id="updates"
        >
          <div
            className="spotlight rounded-[28px] border border-[#ffffff10] p-[26px] [background:radial-gradient(80%_60%_at_50%_40%,#8b5cf61f,transparent_70%),linear-gradient(180deg,#ffffff07,#ffffff02)] max-[1100px]:mx-auto max-[1100px]:w-full max-[1100px]:max-w-[620px]"
            data-reveal
          >
            <div className="flex justify-between font-mono text-[10.5px] leading-[normal] font-semibold tracking-[0.12em] text-[#6e6b84]">
              <span className="inline-flex items-center gap-[7px] text-violet-3">
                <Sparkles size={15} />
                BEHAVIORAL EDGE
              </span>
              <span>Sample insights</span>
            </div>
            <div className="px-[10px] pt-6 pb-[10px]">
              <svg
                viewBox="0 0 360 280"
                role="img"
                aria-label="Illustrative radar chart of six journal-based behavioral indicators"
                className="inline h-auto w-full overflow-visible"
              >
                <defs>
                  <linearGradient id="radar-fill" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity=".55" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity=".25" />
                  </linearGradient>
                </defs>
                {[1, 0.75, 0.5, 0.25].map((scale) => (
                  <polygon
                    key={scale}
                    points="180,45 284,105 284,225 180,285 76,225 76,105"
                    transform={`translate(${180 * (1 - scale)} ${165 * (1 - scale) - 28}) scale(${scale})`}
                    fill="none"
                    stroke="#afa2cc24"
                  />
                ))}
                <path d="M180 17V257 M76 77L284 197 M76 197L284 77" stroke="#afa2cc18" />
                <g className="origin-[50%_53.5%] drop-shadow-[0_0_18px_#8b5cf688] [transform-box:view-box] in-[.is-visible]:animate-[lp-radar-in_1.4s_0.2s_cubic-bezier(0.2,0.9,0.3,1.1)_both]">
                  <polygon
                    points={radarPoints.map((p) => p.join(',')).join(' ')}
                    fill="url(#radar-fill)"
                    stroke="#c4b5fd"
                    strokeWidth="2"
                  />
                  {radarPoints.map(([cx, cy], i) => (
                    <circle
                      key={i}
                      cx={cx}
                      cy={cy}
                      r="4"
                      fill="#e9ddff"
                      className="in-[.is-visible]:origin-center in-[.is-visible]:animate-[lp-dot-in_0.5s_calc(1.1s_+_var(--i)_*_0.08s)_cubic-bezier(0.2,0.9,0.3,1.6)_both] in-[.is-visible]:[transform-box:fill-box]"
                      style={{ '--i': i } as CSSProperties}
                    />
                  ))}
                </g>
                <g fill="#a9a3b8" fontSize="10.5" fontFamily="inherit" textAnchor="middle">
                  <text x="180" y="11">
                    Discipline
                  </text>
                  <text x="320" y="72">
                    Risk
                  </text>
                  <text x="322" y="215">
                    Timing
                  </text>
                  <text x="180" y="278">
                    Consistency
                  </text>
                  <text x="37" y="215">
                    Strategy
                  </text>
                  <text x="37" y="72">
                    Reflection
                  </text>
                </g>
              </svg>
            </div>
            <div className="flex items-center gap-[14px] rounded-[16px] border border-[#ffffff0b] bg-[#ffffff06] p-4">
              <span className="grid size-[42px] place-items-center rounded-[12px] border border-[#22d3ee33] bg-[#22d3ee14] text-cyan">
                <Crosshair size={20} />
              </span>
              <div>
                <strong>Your habits leave a pattern.</strong>
                <p className="text-[13px] text-[#8f8ca5]">Give yourself the space to see it.</p>
              </div>
              <ArrowUpRight size={19} className="ml-auto text-violet-2" />
            </div>
          </div>
          <div data-reveal>
            <span className={kicker}>
              <span />
              THE TRADER BEHIND THE TRADES
            </span>
            <h2 className="mt-[18px] font-display text-[length:clamp(32px,3.8vw,50px)] leading-[1.08] font-bold tracking-[-0.04em]">
              Your numbers tell part of the story.{' '}
              <span className={gradientText}>Your habits tell the rest.</span>
            </h2>
            <p className="mt-[22px] text-[17px] leading-[1.75] text-[#a09db4]">
              A winning day feels good. Understanding how you got there is more useful. Reflect on
              the discipline, consistency, and decisions behind your results.
            </p>
            <ul className="my-7 grid list-none gap-[14px] p-0">
              {[
                'Spot the habits that support your strategy',
                'Keep your decisions grounded in your own data',
                'Bring a clearer intention to your next session',
              ].map((item, i) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-[15.5px] text-[#dedbec] in-[.is-visible]:animate-[lp-slide-in_0.7s_calc(0.3s_+_var(--i)_*_0.12s)_var(--ease-smooth)_both]"
                  style={{ '--i': i } as CSSProperties}
                >
                  <span className="grid size-[26px] shrink-0 place-items-center rounded-[8px] border border-[#4ade8033] bg-[#4ade8016] text-gain">
                    <Check size={14} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className="inline-flex items-center gap-[7px] border-b border-[#a78bfa55] pb-[3px] font-semibold text-violet-3 hover:border-white hover:text-white"
            >
              Get to know your trading <ArrowUpRight size={17} />
            </Link>
            <small className="mt-[26px] block text-[11.5px] text-[#5d5a72]">
              Journal-based heuristic indicators for reflection, not validated performance
              assessments.
            </small>
          </div>
        </section>

        <section
          className="scroll-mt-[100px] bg-[linear-gradient(180deg,transparent,#0d0b181c,transparent)] px-[max(24px,calc((100vw_-_1192px)/2))] py-[100px]"
          id="ebooks"
        >
          <div className={learningIntro}>
            <span className={kicker}>THE ET TRADER READING ROOM</span>
            <h2 className={learningHeading}>
              Trading e-books for <span className={gradientText}>your next setup.</span>
            </h2>
            <p className={learningText}>
              Coming soon: practical guides to price action, candlestick patterns, and gold trading
              strategy.
            </p>
          </div>
          <EbooksSection />
        </section>

        <section
          className="mx-auto max-w-[1240px] scroll-mt-[100px] px-6 py-[130px] max-[860px]:px-[18px] max-[860px]:py-[90px]"
          id="process"
        >
          <div className="mx-auto mb-[70px] max-w-[720px] text-center" data-reveal>
            <span className={kicker}>A SMALL HABIT. A MEANINGFUL DIFFERENCE.</span>
            <h2 className={displayHeading}>
              Make progress part of <span className={gradientText}>your process.</span>
            </h2>
            <p className="mt-[18px] text-[17px] text-[#a09db4]">
              Three simple steps. A little more clarity every day.
            </p>
          </div>
          <div className="relative isolate grid grid-cols-3 items-stretch gap-6 max-[860px]:auto-rows-fr max-[860px]:grid-cols-1" data-reveal>
            <div
              className="pointer-events-none absolute top-[57px] right-[calc(33.333%_-_56px)] left-[56px] z-[1] h-[2px] rounded-full bg-[linear-gradient(90deg,#8b5cf6,#a78bfa_55%,#22d3ee)] shadow-[0_0_12px_#8b5cf630] max-[860px]:top-[56px] max-[860px]:bottom-[calc((100%_-_48px)/3_-_56px)] max-[860px]:left-[56px] max-[860px]:h-auto max-[860px]:w-[2px] max-[860px]:bg-[linear-gradient(180deg,#8b5cf6,#a78bfa_55%,#22d3ee)]"
              aria-hidden="true"
            />
            {[
              {
                icon: NotebookPen,
                number: '01',
                title: 'Log it.',
                text: 'Capture your execution, your setup, and what was going through your mind.',
              },
              {
                icon: ChartNoAxesCombined,
                number: '02',
                title: 'Learn from it.',
                text: 'Step back. Review your results and find the patterns worth paying attention to.',
              },
              {
                icon: TrendingUp,
                number: '03',
                title: 'Build on it.',
                text: 'Take what you learned into your next session. Reflect, refine, and repeat.',
              },
            ].map(({ icon: Icon, number, title, text }, i) => (
              <div
                key={number}
                className="spotlight relative flex flex-col rounded-[20px] border border-[#ffffff12] bg-[linear-gradient(150deg,#14121e,#0c0d14_75%)] p-7 transition-colors duration-300 hover:border-[#a78bfa55] max-[860px]:grid max-[860px]:grid-cols-[56px_minmax(0,1fr)] max-[860px]:gap-x-5 max-[860px]:grid-rows-[auto_auto_1fr]"
                style={{ '--i': i } as CSSProperties}
              >
                <div className="max-[860px]:row-span-3">
                  <span className="relative z-[2] grid size-14 place-items-center rounded-[15px] border border-[#c4b5fd66] bg-[linear-gradient(145deg,#a374f4,#7c3aed_55%,#512497)] text-white shadow-[0_0_26px_#8b5cf640,inset_0_1px_0_#ffffff33]">
                    <Icon size={22} />
                  </span>
                </div>
                <b className="mt-6 block font-mono text-[12px] leading-[1.4] font-semibold tracking-[0.16em] text-[#b9a0ef] max-[860px]:mt-0">
                  STEP {number}
                </b>
                <h3 className="mt-2 font-display text-[24px] leading-[1.25] font-semibold tracking-[-0.03em] text-[#f4f3f8]">{title}</h3>
                <p className="mt-3 max-w-[32ch] text-[16px] leading-[1.65] text-[#a6a2b7]">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <ContactSection />

        <CommunitySection />
      </main>
      <SiteFooter />
    </div>
  );
}
