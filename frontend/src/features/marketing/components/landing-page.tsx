'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  Check,
  ChartNoAxesCombined,
  TrendingUp,
  ShieldCheck,
  NotebookPen,
  Crosshair,
  Sparkles,
} from 'lucide-react';
import { SiteNavbar } from './site-navbar';
import { SiteFooter } from './site-footer';
import { ContactSection } from './contact-section';
import { CoursesSection, EbooksSection, LearningSectionLinks } from './learning-sections';
import { LandingHero, primaryButton } from './landing-hero';
import { FeaturesSection, displayHeading } from './landing-features';
import { CountUp, Magnetic, useReveal, useSpotlight } from '@/components/effects/motion';
import { gradientText, home, sectionLabel } from '@/features/marketing/marketing-styles';
import { cn } from '@/lib/cn';
import type { AnalyticsSummary } from '@et-trader/shared';
import { API_URL } from '@/config/env';
import { getSessionUser } from '@/features/auth/auth.api';

const marketsTop = [
  'Stocks',
  'ETFs',
  'Futures',
  'Options',
  'Crypto',
  'Forex',
  'Indices',
  'Commodities',
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
              Trading Courses <span className={gradientText}>from basic to pro</span>
            </h2>
            <p className={learningText}>
              Two courses take you from trading foundations to advanced chart tools. Pay in USDT and
              get lifetime access on Google Drive, delivered to your Gmail.
            </p>
          </div>
          <CoursesSection />
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
              Practical guides to price action, candlestick patterns, and gold trading strategy.
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
          <div className="relative grid grid-cols-3 gap-5 max-[860px]:grid-cols-[1fr]" data-reveal>
            <div
              className="absolute top-[58px] right-[16%] left-[16%] h-[2px] overflow-hidden rounded-[2px] bg-[#ffffff0f] max-[860px]:hidden"
              aria-hidden="true"
            >
              <i className="block h-full origin-left bg-[linear-gradient(90deg,#8b5cf6,#22d3ee)] shadow-[0_0_16px_#8b5cf6] [transform:scaleX(0)] in-[.is-visible]:animate-[lp-grow-x_1.6s_0.3s_cubic-bezier(0.65,0,0.35,1)_forwards]" />
            </div>
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
                className="spotlight relative rounded-[24px] border border-[#ffffff10] bg-[linear-gradient(180deg,#ffffff07,#ffffff02)] p-[30px] [transition:transform_0.4s,border-color_0.4s] hover:border-[#a78bfa33] hover:[transform:translateY(-4px)] max-[560px]:p-[22px]"
                style={{ '--i': i } as CSSProperties}
              >
                <div className="flex items-center justify-between">
                  <span className="relative z-[1] grid size-14 place-items-center rounded-[17px] border border-[#a78bfa44] bg-[#0b0b14] text-[#d8ccff] in-[.is-visible]:animate-[lp-light-up_0.6s_calc(0.4s_+_var(--i)_*_0.55s)_forwards]">
                    <Icon size={22} />
                  </span>
                </div>
                <b className="mt-[26px] block font-mono text-[10.5px] leading-[normal] font-semibold tracking-[0.16em] text-violet">
                  STEP {number}
                </b>
                <h3 className="mt-2 font-display text-[24px] tracking-[-0.03em]">{title}</h3>
                <p className="mt-[10px] text-[14.5px] leading-[1.7] text-[#9a97ae]">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <ContactSection />

        <section className="mx-auto max-w-[1240px] px-6 pt-10 pb-[120px]" data-reveal>
          <div className="relative isolate flex animate-[rotate-angle_7s_linear_infinite] flex-col items-center overflow-hidden rounded-[34px] border border-transparent px-6 py-[100px] text-center [background:linear-gradient(#0a0a13,#0a0a13)_padding-box,conic-gradient(from_var(--angle),#ffffff10_0%,#ffffff10_55%,#8b5cf6_70%,#22d3ee_78%,#ffffff10_90%)_border-box] max-[860px]:px-5 max-[860px]:py-[70px]">
            <div
              className="absolute bottom-[-460px] left-[calc(50%_-_350px)] z-[-1] size-[700px] animate-[lp-breathe_5s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle,#8b5cf6_0%,#6d28d9_30%,transparent_68%)] opacity-75 blur-[40px]"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 z-[-1] bg-[size:44px_44px] [background-image:linear-gradient(#ffffff07_1px,transparent_1px),linear-gradient(90deg,#ffffff07_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_50%_100%,#000,transparent_70%)]"
              aria-hidden="true"
            />
            <span className="mb-[26px] grid size-16 animate-[lp-float_5s_ease-in-out_infinite] place-items-center rounded-[20px] bg-[linear-gradient(135deg,#8b5cf6,#22d3ee)] text-white shadow-[0_0_60px_#8b5cf6aa]">
              <TrendingUp size={26} />
            </span>
            <span className={kicker}>YOUR NEXT CHAPTER STARTS HERE</span>
            <h2 className={cn(displayHeading, 'text-[length:clamp(38px,6vw,76px)]')}>
              Every trade is a lesson.
              <br />
              <span className={gradientText}>Make yours count.</span>
            </h2>
            <p className="mt-5 mb-10 text-[18px] text-[#b4b1c6]">
              Build a journal. Understand your process. Find your edge.
            </p>
            <Magnetic>
              <Link href="/signup" className={primaryButton}>
                <span>Create your trading journal</span>
                <ArrowUpRight size={18} />
              </Link>
            </Magnetic>
            <small className="mt-6 inline-flex items-center gap-[7px] text-[12.5px] text-[#8f8ca5]">
              <ShieldCheck size={13} />
              Your trades. Your insights. Your space.
            </small>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
