'use client';

import { useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { Brand } from '@/components/ui/brand';
import {
  Plus,
  LayoutDashboard,
  CalendarDays,
  ListOrdered,
  ChartNoAxesCombined,
  TrendingUp,
  ShieldCheck,
  Wallet,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/cn';

/** Illustrative dashboard mockup used on the landing page (static sample data, not user data). */
const periods = {
  '1W': {
    balance: '$12,340.00',
    pnl: '+$2,340.00',
    rate: '64.3',
    factor: '2.08',
    trades: '14',
    points:
      '0,154 35,142 70,149 105,117 140,125 175,90 210,102 245,71 280,80 315,51 350,62 385,30 420,40 455,16 490,24 525,8',
  },
  '1M': {
    balance: '$14,820.50',
    pnl: '+$4,820.50',
    rate: '68.4',
    factor: '2.41',
    trades: '142',
    points:
      '0,165 25,162 50,146 75,150 100,129 125,137 150,109 175,96 200,104 225,78 250,87 275,66 300,76 325,45 350,53 375,32 400,46 425,24 450,31 475,12 500,21 525,9',
  },
  '3M': {
    balance: '$18,650.00',
    pnl: '+$8,650.00',
    rate: '65.8',
    factor: '2.63',
    trades: '386',
    points:
      '0,170 25,160 50,167 75,147 100,153 125,130 150,142 175,119 200,126 225,92 250,104 275,81 300,92 325,61 350,72 375,44 400,51 425,21 450,33 475,12 500,19 525,4',
  },
};
const previewNavigation = [
  { icon: LayoutDashboard, name: 'Overview', path: '' },
  { icon: CalendarDays, name: 'Calendar', path: '/calendar' },
  { icon: ListOrdered, name: 'Trades', path: '/trades' },
  { icon: ChartNoAxesCombined, name: 'Analytics', path: '/analytics' },
];
const microLabel =
  'mx-[10px] mt-[18px] mb-2 block font-mono text-[9px] leading-[normal] font-semibold tracking-[0.12em] text-[#6e6b84]';
const previewNav =
  'flex items-center gap-[10px] rounded-[9px] px-[11px] py-[9px] text-[12.5px] text-[#9e9ab3]';
const chartCard = 'min-w-0 rounded-[14px] border border-[#ffffff0b] bg-[#ffffff05] p-4';
const chartTitle = 'text-[13.5px] font-semibold';
const legendItem = 'inline-flex items-center gap-[6px]';
const recentRow =
  'grid grid-cols-[60px_60px_1fr_auto] items-center gap-3 rounded-[10px] border border-[#ffffff08] bg-[#ffffff05] px-3 py-[10px] max-[560px]:grid-cols-[52px_1fr_auto]';
const recentTag =
  'justify-self-start rounded-full border border-[#4ade8030] bg-[#4ade8018] px-[7px] py-[3px] font-mono text-[9.5px] leading-[normal] font-semibold text-gain not-italic';
const recentSetup = 'text-[#8f8ca5] max-[560px]:hidden';

export function DashboardPreview() {
  const [period, setPeriod] = useState<keyof typeof periods>('1M');
  const data = periods[period];
  const last = data.points.split(' ').at(-1)!.split(',');
  return (
    <div
      className="relative overflow-hidden rounded-[20px] border border-[#ffffff1c] bg-[linear-gradient(180deg,#11111d,#0a0a13)] shadow-[0_0_0_1px_#00000080,0_40px_120px_#000000b3,0_0_0_8px_#ffffff05,inset_0_1px_0_#ffffff12] after:pointer-events-none after:absolute after:inset-0 after:bg-[linear-gradient(115deg,transparent_40%,#ffffff0c_calc(50%_+_var(--px,0)_*_40%),transparent_60%)] after:content-['']"
      id="preview"
    >
      <div className="flex items-center gap-[14px] border-b border-[#ffffff0d] bg-[#0d0d17] px-4 py-3 text-[11px] text-[#77748c]">
        <div className="flex gap-[6px]">
          <i className="size-[10px] rounded-full bg-[#ff5f57]" />
          <i className="size-[10px] rounded-full bg-[#febc2e]" />
          <i className="size-[10px] rounded-full bg-[#28c840]" />
        </div>
        <span className="mx-auto inline-flex items-center gap-[6px] rounded-[7px] bg-[#ffffff08] px-[14px] py-1 font-mono max-[560px]:hidden">
          <ShieldCheck size={12} /> app.ettrader / overview
        </span>
        <span className="rounded-[5px] bg-[#8b5cf61f] px-[7px] py-[3px] font-mono text-[9px] leading-[normal] font-semibold tracking-[0.1em] text-violet-3 max-[560px]:ml-auto">
          ILLUSTRATIVE DATA
        </span>
      </div>
      <div className="grid min-h-[520px] grid-cols-[196px_minmax(0,1fr)] max-[860px]:min-h-0 max-[860px]:grid-cols-[1fr]">
        <aside
          className="flex flex-col gap-1 border-r border-[#ffffff0a] bg-[#0c0c15] px-[14px] py-[22px] max-[860px]:hidden"
          aria-label="Dashboard preview navigation"
        >
          <Brand className="mx-[6px] mt-0 mb-[6px]" />
          <span className={microLabel}>WORKSPACE</span>
          {previewNavigation.map(({ icon: Icon, name, path }, i) => (
            <Link
              key={name}
              href={`/dashboard${path}`}
              className={cn(
                previewNav,
                i === 0
                  ? 'bg-[linear-gradient(90deg,#8b5cf633,#8b5cf60a)] text-[#f0eaff] shadow-[inset_2px_0_0_#a78bfa]'
                  : 'hover:bg-[#ffffff08] hover:text-white',
              )}
            >
              <Icon size={15} />
              {name}
            </Link>
          ))}
          <div className="mt-auto flex items-center gap-[10px] rounded-[11px] border border-[#ffffff0a] bg-[#ffffff06] p-[10px] text-[12px] text-[#e4e1ef]">
            <span className="grid size-[30px] place-items-center rounded-full bg-[linear-gradient(135deg,#8b5cf6,#22d3ee)] text-[10px] font-bold text-white">
              JD
            </span>
            <div>
              Jordan Davis
              <small className="block text-[10px] text-[#77748c]">Personal journal</small>
            </div>
          </div>
        </aside>
        <div className="flex min-w-0 flex-col gap-4 px-6 py-[22px] max-[560px]:p-4">
          <div className="flex items-end justify-between">
            <div>
              <span className={cn(microLabel, 'mx-0 mt-0 mb-[6px]')}>
                YOUR PERFORMANCE, IN FOCUS
              </span>
              <h3 className="font-display text-[22px] tracking-[-0.03em] max-[560px]:text-[18px]">
                Dashboard Overview
              </h3>
            </div>
            <Link
              href="/signup"
              className="inline-flex items-center gap-[6px] rounded-[9px] bg-[linear-gradient(135deg,#8b5cf6,#6d28d9)] px-3 py-2 text-[12px] font-semibold text-white shadow-[0_6px_20px_#7c3aed55]"
            >
              <Plus size={13} />
              Log trade
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 max-[560px]:grid-cols-2" aria-live="polite">
            {[
              {
                label: 'Account balance',
                value: data.balance,
                note: `${data.pnl} net`,
                icon: Wallet,
              },
              {
                label: 'Win rate',
                value: `${data.rate}%`,
                note: `${data.trades} trades`,
                icon: Target,
              },
              {
                label: 'Profit factor',
                value: data.factor,
                note: 'Gross win / loss',
                icon: TrendingUp,
              },
            ].map(({ label, value, note, icon: Icon }, i) => (
              <div
                key={label}
                className={cn(
                  'flex min-w-0 flex-col gap-[6px] rounded-[13px] border border-[#ffffff0b] bg-[linear-gradient(180deg,#ffffff08,#ffffff03)] p-[14px]',
                  i === 2 && 'max-[560px]:hidden',
                )}
              >
                <div className="flex justify-between text-[11px] text-[#8f8ca5]">
                  <span>{label}</span>
                  <Icon size={13} className="text-violet-2" />
                </div>
                <strong
                  key={`${period}-${label}`}
                  className="animate-[lp-number-pop_0.6s_var(--ease-smooth)_both] font-mono text-[22px] leading-[normal] font-bold tracking-[-0.04em] max-[560px]:text-[17px]"
                >
                  {value}
                </strong>
                <small className="text-[10.5px] text-gain">{note}</small>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_210px] gap-3 max-[860px]:grid-cols-[1fr]">
            <div className={chartCard}>
              <div className="flex items-start justify-between gap-[10px]">
                <div>
                  <h4 className={chartTitle}>Equity curve</h4>
                  <span className="text-[11px] text-[#77748c]">
                    Your progress, one trade at a time
                  </span>
                </div>
                <div
                  className="flex rounded-[9px] border border-[#ffffff0b] bg-[#00000040] p-[3px]"
                  aria-label="Sample chart time range"
                >
                  {(Object.keys(periods) as (keyof typeof periods)[]).map((p) => (
                    <button
                      key={p}
                      aria-pressed={period === p}
                      onClick={() => setPeriod(p)}
                      className="rounded-[6px] border-0 bg-transparent px-[10px] py-1 font-mono text-[10.5px] leading-[normal] font-semibold text-[#8f8ca5] aria-pressed:bg-violet aria-pressed:text-white aria-pressed:shadow-[0_2px_12px_#8b5cf688]"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative mt-3 h-[180px] max-[560px]:h-[140px]">
                <svg
                  viewBox="0 0 525 190"
                  role="img"
                  aria-label={`Illustrative ${period} equity curve, balance ${data.balance}`}
                  preserveAspectRatio="none"
                  className="block h-full w-full overflow-visible"
                >
                  <defs>
                    <linearGradient id="home-equity-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity=".42" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="home-equity-line" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="70%" stopColor="#c4b5fd" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                  {[25, 95, 165].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      x2="525"
                      y1={y}
                      y2={y}
                      stroke="#ffffff10"
                      strokeDasharray="3 6"
                    />
                  ))}
                  <g
                    key={period}
                    className="animate-[lp-wipe_1.8s_0.2s_cubic-bezier(0.65,0,0.35,1)_both]"
                  >
                    <polygon
                      points={`0,190 ${data.points} 525,190`}
                      fill="url(#home-equity-fill)"
                    />
                    <polyline
                      points={data.points}
                      fill="none"
                      stroke="url(#home-equity-line)"
                      strokeWidth="2.8"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                </svg>
                <span
                  className="absolute m-[-5px_0_0_-5px] size-[10px] animate-[lp-rise-in_0.4s_1.9s_both] rounded-full bg-cyan shadow-[0_0_14px_#22d3ee] after:absolute after:inset-[-6px] after:animate-[lp-ping_1.8s_2s_ease-out_infinite] after:rounded-full after:border-2 after:border-cyan after:content-['']"
                  style={
                    {
                      left: `${(Number(last[0]) / 525) * 100}%`,
                      top: `${(Number(last[1]) / 190) * 100}%`,
                    } as CSSProperties
                  }
                />
              </div>
              <div className="mt-2 flex justify-between font-mono text-[10px] leading-[normal] text-[#66637a]">
                <span>Session 01</span>
                <span>
                  {period === '1W' ? 'This week' : period === '1M' ? 'This month' : 'Last 3 months'}
                </span>
                <span>Today</span>
              </div>
            </div>
            <div
              className={cn(chartCard, 'flex flex-col items-center gap-[14px] max-[860px]:hidden')}
            >
              <h4 className={cn(chartTitle, 'self-start')}>Trade outcomes</h4>
              <div
                className="relative grid size-[132px] place-items-center [transition:--win-rate_0.9s_var(--ease-smooth)] before:absolute before:inset-0 before:animate-[lp-spin-in_1.3s_0.4s_var(--ease-smooth)_both] before:rounded-full before:bg-[conic-gradient(#4ade80_var(--win-rate),#ff5c6c_0)] before:drop-shadow-[0_0_10px_#4ade8055] before:content-[''] before:[mask:radial-gradient(circle,transparent_57%,#000_58%)]"
                style={{ '--win-rate': `${data.rate}%` } as CSSProperties}
              >
                <div className="flex flex-col items-center">
                  <strong className="font-mono text-[22px] leading-[normal] font-bold tracking-[-0.04em]">
                    {data.rate}%
                  </strong>
                  <span className="font-mono text-[8.5px] leading-[normal] font-semibold tracking-[0.12em] text-[#8f8ca5]">
                    WIN RATE
                  </span>
                </div>
              </div>
              <div className="flex gap-[14px] text-[11px] text-[#8f8ca5]">
                <span className={legendItem}>
                  <i className="size-[7px] rounded-[2px] bg-gain" /> Wins
                </span>
                <span className={legendItem}>
                  <i className="size-[7px] rounded-[2px] bg-loss" /> Losses
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-[6px] text-[12px]">
            <span className="font-mono text-[9px] leading-[normal] font-semibold tracking-[0.12em] text-[#8f8ca5] uppercase">
              Recent executions
            </span>
            <div
              className={cn(recentRow, 'animate-[lp-rise-in_0.6s_1.6s_var(--ease-smooth)_both]')}
            >
              <strong className="font-mono">NVDA</strong>
              <em className={recentTag}>LONG</em>
              <span className={recentSetup}>Morning breakout</span>
              <b className="font-mono text-gain">+$480.00</b>
            </div>
            <div
              className={cn(recentRow, 'animate-[lp-rise-in_0.6s_1.75s_var(--ease-smooth)_both]')}
            >
              <strong className="font-mono">SPY</strong>
              <em className={recentTag}>LONG</em>
              <span className={recentSetup}>VWAP bounce</span>
              <b className="font-mono text-gain">+$350.00</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
