'use client';

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight, Check, ChevronRight, Sparkles, Flame, Zap } from 'lucide-react';
import { DashboardPreview } from './dashboard-preview';
import { MarketCanvas } from '@/components/effects/market-canvas';
import { Magnetic, prefersReducedMotion } from '@/components/effects/motion';
import { cn } from '@/lib/cn';

const rotatingWords = ['edge.', 'discipline.', 'process.', 'patterns.'];

/** Glowing violet call-to-action with a periodic sheen (hero and final CTA). */
export const primaryButton =
  "relative inline-flex items-center gap-[10px] overflow-hidden rounded-[14px] bg-[linear-gradient(135deg,#8b5cf6_0%,#6d28d9_55%,#4c1d95_100%)] px-[26px] py-4 text-[15px] font-semibold text-white shadow-[0_0_0_1px_#c4b5fd55_inset,0_1px_0_#ffffff40_inset,0_14px_40px_#7c3aed66,0_0_80px_#8b5cf633] after:absolute after:inset-0 after:animate-[lp-sheen_4.5s_1.5s_ease-in-out_infinite] after:bg-[linear-gradient(110deg,transparent_30%,#ffffff55_50%,transparent_70%)] after:[transform:translateX(-120%)] after:content-[''] hover:shadow-[0_0_0_1px_#ddd6fe88_inset,0_1px_0_#ffffff50_inset,0_18px_50px_#7c3aed99,0_0_100px_#8b5cf655] [&_svg]:[transition:transform_0.25s] hover:[&_svg]:[transform:translate(2px,-2px)]";

const wordBase =
  'inline-block whitespace-nowrap bg-[linear-gradient(100deg,#e9ddff_0%,#a78bfa_35%,#8b5cf6_60%,#22d3ee_100%)] bg-clip-text pr-[0.04em] text-transparent [transition:transform_0.7s_var(--ease-smooth),opacity_0.7s,filter_0.7s]';
const wordHidden = 'absolute top-0 left-0 opacity-0 blur-[8px]';

function RotatingWord() {
  const [index, setIndex] = useState(0);
  const [width, setWidth] = useState<number>();
  const words = useRef<(HTMLSpanElement | null)[]>([]);
  useLayoutEffect(() => {
    const measure = () => setWidth(words.current[index]?.offsetWidth);
    measure();
    void document.fonts?.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [index]);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % rotatingWords.length), 2600);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span
      className="relative -mb-[0.12em] inline-block overflow-hidden pb-[0.12em] text-left align-bottom [transition:width_0.6s_cubic-bezier(0.65,0,0.35,1)]"
      style={{ width }}
      aria-hidden="true"
    >
      {rotatingWords.map((word, i) => (
        <span
          key={word}
          ref={(el) => {
            words.current[i] = el;
          }}
          className={cn(
            wordBase,
            i === index
              ? 'relative'
              : i === (index - 1 + rotatingWords.length) % rotatingWords.length
                ? `${wordHidden} [transform:translateY(-90%)]`
                : `${wordHidden} [transform:translateY(90%)]`,
          )}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

function useHeroStage() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      el.style.setProperty('--lift', Math.min(1, window.scrollY / 560).toFixed(3));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onMove = (event: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--px', ((event.clientX - r.left) / r.width - 0.5).toFixed(3));
      el.style.setProperty('--py', ((event.clientY - r.top) / r.height - 0.5).toFixed(3));
    };
    const onLeave = () => {
      el.style.setProperty('--px', '0');
      el.style.setProperty('--py', '0');
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, []);
  return ref;
}

const aurora = 'absolute rounded-full opacity-[0.55] blur-[90px]';
const floatCard =
  'absolute flex items-center gap-3 rounded-[16px] border border-[#ffffff1c] bg-[rgba(20,18,34,0.72)] py-3 pr-4 pl-3 shadow-[0_20px_50px_#00000080,inset_0_1px_0_#ffffff14] backdrop-blur-[16px] backdrop-saturate-150 [transform:translateZ(90px)] max-[860px]:hidden';
const floatSmall = 'block text-[11px] text-[#9a97ae]';
const floatStrong =
  'block font-display text-[15px] leading-[normal] font-bold tracking-[-0.02em] text-white';
const floatIcon =
  'grid size-9 place-items-center rounded-[11px] border border-[#4ade8033] bg-[#4ade8018] text-gain shadow-[0_0_20px_#4ade8033]';
const heroNote = 'inline-flex items-center gap-[7px]';

export function LandingHero() {
  const stage = useHeroStage();
  return (
    <section className="spotlight spotlight-bare relative isolate px-6 pt-[168px] pb-10 text-center max-[860px]:pt-[136px]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 bottom-[-10%] z-[-1] overflow-hidden [mask-image:linear-gradient(to_bottom,#000_70%,transparent)]"
        aria-hidden="true"
      >
        <MarketCanvas className="absolute top-[70px] left-0 h-[640px] w-full opacity-50 [mask-image:radial-gradient(ellipse_60%_55%_at_50%_42%,transparent_20%,#000_75%)]" />
        <div className="absolute inset-0 bg-[size:64px_64px] [background-image:linear-gradient(#ffffff08_1px,transparent_1px),linear-gradient(90deg,#ffffff08_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_30%,#000_10%,transparent_70%)]" />
        <i
          className={cn(
            aurora,
            'top-[-160px] left-[calc(50%_-_560px)] h-[480px] w-[720px] animate-[lp-drift-a_18s_ease-in-out_infinite_alternate] bg-[radial-gradient(circle,#7c3aed_0%,transparent_65%)]',
          )}
        />
        <i
          className={cn(
            aurora,
            'top-[-80px] right-[calc(50%_-_600px)] h-[460px] w-[620px] animate-[lp-drift-b_22s_ease-in-out_infinite_alternate] bg-[radial-gradient(circle,#0891b2_0%,transparent_65%)] opacity-40',
          )}
        />
        <i
          className={cn(
            aurora,
            'top-[560px] left-[calc(50%_-_450px)] h-[520px] w-[900px] animate-[lp-drift-a_26s_ease-in-out_infinite_alternate-reverse] bg-[radial-gradient(circle,#6d28d9_0%,transparent_62%)] opacity-[0.45]',
          )}
        />
        <div className="absolute inset-0 bg-[radial-gradient(560px_circle_at_var(--mx,50%)_var(--my,30%),rgba(139,92,246,0.16),transparent_60%)] [transition:opacity_0.4s]" />
      </div>
      <div className="relative mx-auto max-w-[1180px] before:absolute before:inset-[-60px_-80px] before:z-[-1] before:bg-[radial-gradient(ellipse_at_center,#06060bd9_30%,transparent_70%)] before:content-['']">
        <Link
          href="/signup"
          className="inline-flex animate-[lp-rise-in_0.9s_var(--ease-smooth)_both] items-center gap-[10px] rounded-full border border-[#a78bfa38] bg-[linear-gradient(180deg,#a78bfa1c,#a78bfa08)] py-[5px] pr-3 pl-[5px] text-[13px] font-medium text-[#d9ccff] shadow-[0_0_30px_#8b5cf622] hover:border-[#a78bfa80] hover:[transform:translateY(-1px)] max-[860px]:text-[12px] [&_svg:last-child]:[transition:transform_0.25s] hover:[&_svg:last-child]:[transform:translateX(3px)]"
        >
          <span className="inline-flex items-center gap-1 rounded-full bg-[linear-gradient(90deg,#8b5cf6,#22d3ee)] px-[9px] py-1 font-mono text-[10px] leading-none font-bold tracking-[0.08em] text-white">
            <Sparkles size={12} />
            NEW
          </span>
          Your edge starts with your journal
          <ChevronRight size={14} />
        </Link>
        <h1 className="mt-[30px] font-display text-[length:clamp(42px,6.5vw,92px)] leading-[1.02] font-bold tracking-[-0.05em] text-[#fbfaff] max-[560px]:text-[length:clamp(38px,11.5vw,56px)]">
          <span className="block animate-[lp-line-in_1.1s_0.08s_var(--ease-smooth)_both]">
            Journal every trade.
          </span>
          <span className="block animate-[lp-line-in_1.1s_0.22s_var(--ease-smooth)_both]">
            Master your <span className="sr-only">edge.</span>
            <RotatingWord />
          </span>
        </h1>
        <p
          className={cn(
            'mx-auto mt-7 max-w-[640px] text-[18px] leading-[1.7] text-[#a9a6bd] max-[860px]:text-[16px]',
            'animate-[lp-rise-in_1s_0.4s_var(--ease-smooth)_both]',
          )}
        >
          Good traders track results. Great traders understand them. ET Trader turns every execution
          into a living picture of your edge — calendar, analytics and behavior, in one beautiful
          workspace.
        </p>
        <div
          className={cn(
            'mt-10 flex items-center justify-center gap-[14px] max-[560px]:flex-col max-[560px]:items-stretch max-[560px]:[&_.magnetic]:w-full max-[560px]:[&_.magnetic]:justify-center',
            'animate-[lp-rise-in_1s_0.55s_var(--ease-smooth)_both]',
          )}
        >
          <Magnetic>
            <Link
              href="/signup"
              className={cn(primaryButton, 'max-[560px]:w-full max-[560px]:justify-center')}
            >
              <span>Start your trading journal</span>
              <ArrowUpRight size={18} />
            </Link>
          </Magnetic>
          <a
            href="#preview"
            className="inline-flex items-center gap-[9px] rounded-[14px] border border-[#ffffff17] bg-[#ffffff08] px-[22px] py-4 text-[15px] font-medium text-[#e4e1f0] backdrop-blur-[10px] hover:border-[#ffffff30] hover:bg-[#ffffff10] max-[560px]:w-full max-[560px]:justify-center [&_svg]:[transition:transform_0.25s] hover:[&_svg]:[transform:translateX(3px)]"
          >
            Explore the dashboard <ArrowRight size={17} />
          </a>
        </div>
        <div
          className={cn(
            'mt-[26px] flex flex-wrap justify-center gap-x-[26px] gap-y-[10px] text-[13px] text-[#8e8ba3]',
            'animate-[lp-rise-in_1s_0.7s_var(--ease-smooth)_both]',
          )}
        >
          <span className={heroNote}>
            <Check size={13} className="text-gain" />
            Free to start
          </span>
          <span className={heroNote}>
            <Check size={13} className="text-gain" />
            Built around your process
          </span>
          <span className={heroNote}>
            <Check size={13} className="text-gain" />
            Your data stays yours
          </span>
        </div>
      </div>
      <div
        className="relative mx-auto mt-[84px] max-w-[1180px] animate-[lp-stage-in_1.4s_0.75s_var(--ease-smooth)_both] text-left [--lift:1] [perspective:2200px] max-[860px]:mt-[60px]"
        ref={stage}
      >
        <div
          className="absolute inset-[8%_6%_-6%] animate-[lp-breathe_6s_ease-in-out_infinite] rounded-full bg-[radial-gradient(ellipse,#7c3aedaa,#0891b255_45%,transparent_70%)] opacity-70 blur-[70px]"
          aria-hidden="true"
        />
        <div className="relative origin-[50%_0] [transform:rotateX(calc((1_-_var(--lift))_*_20deg_+_var(--py,0)_*_-5deg))_rotateY(calc(var(--px,0)_*_7deg))_scale(calc(0.9_+_var(--lift)_*_0.1))] [transition:transform_0.4s_var(--ease-smooth)] [transform-style:preserve-3d]">
          <DashboardPreview />
          <div
            className={cn(
              floatCard,
              'top-[30%] left-[-48px] [animation:lp-pop-in_0.8s_cubic-bezier(0.2,0.9,0.3,1.3)_2s_both,lp-float_6s_ease-in-out_2.8s_infinite] max-[1240px]:left-[-16px]',
            )}
            aria-hidden="true"
          >
            <span className={floatIcon}>
              <Zap size={15} />
            </span>
            <div>
              <small className={floatSmall}>Trade logged · NVDA</small>
              <strong className={cn(floatStrong, 'text-gain')}>+$480.00</strong>
            </div>
          </div>
          <div
            className={cn(
              floatCard,
              'top-[-30px] right-[-44px] [animation:lp-pop-in_0.8s_cubic-bezier(0.2,0.9,0.3,1.3)_2.3s_both,lp-float_6s_ease-in-out_3.1s_infinite] max-[1240px]:right-[-14px]',
            )}
            aria-hidden="true"
          >
            <span
              className={cn(
                floatIcon,
                'border-[#fbbf2433] bg-[#fbbf2418] text-amber shadow-[0_0_20px_#fbbf2433]',
              )}
            >
              <Flame size={15} />
            </span>
            <div>
              <small className={floatSmall}>Current streak</small>
              <strong className={floatStrong}>6 green days</strong>
            </div>
          </div>
          <div
            className={cn(
              floatCard,
              'right-[7%] bottom-[-30px] [animation:lp-pop-in_0.8s_cubic-bezier(0.2,0.9,0.3,1.3)_2.6s_both,lp-float_6s_ease-in-out_3.4s_infinite] max-[1240px]:right-[-14px]',
            )}
            aria-hidden="true"
          >
            <div
              className="relative grid size-[38px] place-items-center rounded-full bg-[conic-gradient(#a78bfa_var(--v),#ffffff14_0)] before:absolute before:inset-1 before:rounded-full before:bg-[#15132a] before:content-['']"
              style={{ '--v': '92%' } as CSSProperties}
            >
              <span className="relative font-mono text-[11px] leading-[normal] font-bold text-[#e9ddff]">
                92
              </span>
            </div>
            <div>
              <small className={floatSmall}>Discipline score</small>
              <strong className={floatStrong}>Plan followed</strong>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-[30px] flex flex-wrap items-center justify-center gap-2 px-5 text-[12.5px] text-[#77748c]">
        <span className="size-[7px] animate-[lp-live_2s_infinite] rounded-full bg-gain shadow-[0_0_0_0_#4ade8080]" />{' '}
        Sample dashboard · pick a time range
      </p>
    </section>
  );
}
