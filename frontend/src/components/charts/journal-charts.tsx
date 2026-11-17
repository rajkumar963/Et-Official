'use client';
import { useId } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  BarChart,
  Bar,
  ReferenceLine,
} from 'recharts';
import type { AnalyticsSummary } from '@et-trader/shared';
import { money, shortDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import { eyebrow } from '@/components/ui/styles';
const tooltipStyle = {
  background: 'rgba(18, 16, 30, 0.92)',
  border: '1px solid rgba(167, 139, 250, 0.3)',
  borderRadius: 12,
  color: '#f4f3f8',
  boxShadow: '0 16px 40px rgba(0,0,0,.5)',
  backdropFilter: 'blur(12px)',
  padding: '8px 12px',
};
const tooltipLabel = { color: '#9a98ad', fontSize: 11, marginBottom: 2 };
const tooltipItem = { color: '#f4f3f8', fontFamily: 'var(--font-mono)', fontSize: 13 };
const axisTick = { fill: '#8f8ca5', fontSize: 11 };
// SVG url(#…) references break on the punctuation React puts in generated ids.
const useSafeId = () => `g${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
/** Chart box (previously .chart / .equity-chart). */
const chartBox = 'h-[290px] w-full max-[700px]:h-[240px]';
export function Sparkline({
  values,
  color = '#a78bfa',
  className = '',
}: {
  values: number[];
  color?: string;
  className?: string;
}) {
  const id = useSafeId();
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const range = Math.max(...values) - min || 1;
  const points = values.map(
    (v, i) => `${(i / (values.length - 1)) * 100},${30 - ((v - min) / range) * 26 - 2}`,
  );
  const line = `M${points.join(' L')}`;
  return (
    <svg
      className={cn(
        'block w-full overflow-visible [&_path]:[vector-effect:non-scaling-stroke]',
        className,
      )}
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        className="animate-[fade-in_1.2s_0.8s_both]"
        d={`${line} L100,30 L0,30 Z`}
        fill={`url(#${id}-fill)`}
      />
      <path
        className="animate-[spark-draw_1.6s_0.3s_var(--ease-smooth)_forwards] [stroke-dasharray:1] [stroke-dashoffset:1]"
        d={line}
        pathLength={1}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function EquityChart({
  data,
  baseline,
}: {
  data: AnalyticsSummary['equityCurve'];
  baseline?: number;
}) {
  const id = useSafeId();
  return (
    <div className={chartBox}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 12, top: 20, bottom: 0 }}>
          <defs>
            <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.45} />
              <stop offset="60%" stopColor="#8b5cf6" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id={`${id}-stroke`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="65%" stopColor="#c4b5fd" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 6" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(v) => (v === 'Baseline' ? 'Baseline' : shortDate(v))}
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis
            domain={['auto', 'auto']}
            tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(1)}k`}
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            width={58}
          />
          {baseline !== undefined && (
            <ReferenceLine y={baseline} stroke="rgba(255,255,255,0.18)" strokeDasharray="4 4" />
          )}
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabel}
            itemStyle={tooltipItem}
            cursor={{ stroke: 'rgba(196,181,253,0.4)', strokeDasharray: '3 3' }}
            formatter={(v) => [money(Number(v)), 'Balance']}
          />
          <Area
            animationDuration={1500}
            animationEasing="ease-out"
            type="monotone"
            dataKey="balance"
            stroke={`url(#${id}-stroke)`}
            strokeWidth={3}
            fill={`url(#${id}-fill)`}
            activeDot={{ r: 6, fill: '#22d3ee', stroke: '#0b0b14', strokeWidth: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export function OutcomeChart({ summary: s }: { summary: AnalyticsSummary }) {
  const data = [
    { name: 'Wins', value: s.wins },
    { name: 'Losses', value: s.losses },
    { name: 'Breakeven', value: s.breakeven },
  ];
  return (
    <div className="relative mt-[-6px] mb-1.5">
      <ResponsiveContainer width="100%" height={230}>
        <PieChart>
          <Pie
            animationDuration={1300}
            animationBegin={150}
            data={s.totalTrades ? data : [{ name: 'No trades', value: 1 }]}
            dataKey="value"
            innerRadius={78}
            outerRadius={96}
            startAngle={90}
            endAngle={-270}
            stroke="none"
            cornerRadius={s.totalTrades ? 6 : 0}
            paddingAngle={s.totalTrades ? 3 : 0}
          >
            {(s.totalTrades ? data : [{ value: 1 }]).map((_, i) => (
              <Cell
                key={i}
                fill={
                  s.totalTrades ? ['#4ade80', '#ff5c6c', '#6b6980'][i] : 'rgba(255,255,255,0.07)'
                }
              />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItem} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <strong className="font-mono text-[34px] leading-normal font-bold tracking-[-0.06em]">
          {s.winRate.toFixed(1)}%
        </strong>
        <span className={cn(eyebrow, 'my-0.5 text-[9px] text-[#a29ab5]')}>WIN RATE</span>
        <small className="font-mono text-[10.5px] leading-normal text-gain">
          {s.wins}W · {s.losses}L · {s.breakeven}BE
        </small>
      </div>
    </div>
  );
}
export function BehavioralChart({
  data,
  className,
}: {
  data: AnalyticsSummary['behavioralScores'];
  className?: string;
}) {
  const id = useSafeId();
  return (
    <div className={cn(chartBox, '-mt-2.5 h-[220px]', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="66%">
          <defs>
            <linearGradient id={`${id}-radar`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <PolarGrid stroke="rgba(255,255,255,0.09)" />
          <PolarAngleAxis dataKey="name" tick={{ fill: '#a8a3b9', fontSize: 10.5 }} />
          <Radar
            animationDuration={1400}
            dataKey="score"
            stroke="#c4b5fd"
            strokeWidth={2}
            fill={`url(#${id}-radar)`}
            fillOpacity={1}
            dot={{ r: 3, fill: '#e9ddff', strokeWidth: 0 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
export function DailyChart({ data }: { data: AnalyticsSummary['dailyPnl'] }) {
  const id = useSafeId();
  const recent = data.slice(-30);
  return (
    <div className={chartBox}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={recent} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id={`${id}-up`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#4ade80" stopOpacity={0.25} />
            </linearGradient>
            <linearGradient id={`${id}-down`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#ff5c6c" />
              <stop offset="100%" stopColor="#ff5c6c" stopOpacity={0.25} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 6" />
          <XAxis
            dataKey="date"
            tickFormatter={shortDate}
            tick={{ ...axisTick, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis tick={{ ...axisTick, fontSize: 10 }} axisLine={false} tickLine={false} />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabel}
            itemStyle={tooltipItem}
            cursor={{ fill: 'rgba(167,139,250,0.08)' }}
            labelFormatter={(v) => shortDate(String(v))}
            formatter={(v) => [money(Number(v)), 'Net P&L']}
          />
          <Bar animationDuration={1100} dataKey="pnl" radius={[6, 6, 6, 6]} maxBarSize={28}>
            {recent.map((d) => (
              <Cell key={d.date} fill={d.pnl >= 0 ? `url(#${id}-up)` : `url(#${id}-down)`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
