'use client';
import Link from 'next/link';
import {
  Wallet,
  TrendingUp,
  Target,
  Scale,
  Trophy,
  Flame,
  ArrowUpRight,
  Download,
  Plus,
} from 'lucide-react';
import { useJournal } from '@/features/journal/journal-provider';
import {
  EquityChart,
  OutcomeChart,
  BehavioralChart,
  Sparkline,
} from '@/components/charts/journal-charts';
import { CountUp } from '@/components/effects/motion';
import { PageHeading, headingActions } from '@/components/ui/page-heading';
import { StatCard, StatIcon } from '@/components/ui/stat-card';
import { Panel, PanelHeader } from '@/components/ui/panel';
import { Badge, StatusDot } from '@/components/ui/badge';
import { MarketSessions } from '@/components/ui/market-sessions';
import { buttonClass, textLinkClass } from '@/components/ui/button';
import { eyebrow, mono, note, tone } from '@/components/ui/styles';
import { cn } from '@/lib/cn';
import { TradeTable } from '@/features/trades/components/trade-table';
import { WithdrawalsPanel } from '@/features/withdrawals/components/withdrawals-panel';
import { money, signedMoney, shortDate } from '@/lib/format';
import { exportTrades } from '@/features/trades/export-csv';
const pct = (n: number) => `${n.toFixed(1)}%`;
/** Thin gradient progress bar (previously .progress). */
function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-[5px] overflow-hidden rounded-[10px] bg-[#ffffff0d]', className)}>
      <i
        className="block h-full origin-left animate-[grow-bar_1.4s_0.3s_var(--ease-smooth)_both] rounded-[10px] bg-[linear-gradient(90deg,#8b5cf6,#c4b5fd,#22d3ee)] shadow-[0_0_12px_#8b5cf6aa] transition-[width] duration-800 ease-smooth"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
/** Small dark tile used by the equity summary and outcome stats. */
const tile = 'flex flex-col rounded-[13px] border border-[#ffffff08] bg-[#00000033]';
export function Overview() {
  const { summary: s, user, trades, openTrade, totalWithdrawn } = useJournal();
  if (!s || !user) return null;
  const pnlTone = s.totalPnl >= 0 ? 'green' : 'red';
  // Withdrawn cash leaves the account, so it lowers the balance without touching P&L.
  const cashBalance = user.startingBalance + s.totalPnl - totalWithdrawn;
  const streakUnit =
    s.currentStreak.type === 'neutral'
      ? 'days'
      : s.currentStreak.type === 'win'
        ? s.currentStreak.count === 1
          ? 'win'
          : 'wins'
        : s.currentStreak.count === 1
          ? 'loss'
          : 'losses';
  const summaryEyebrow = cn(eyebrow, 'text-[9px] text-[#8f8ca5] max-[700px]:text-[7.5px]');
  const summaryValue = cn(
    mono,
    'text-[17px] tracking-[-0.04em] tabular-nums max-[1200px]:text-[14px] max-[700px]:text-[12px]',
  );
  return (
    <>
      <PageHeading
        eyebrow="YOUR PERFORMANCE, IN FOCUS"
        title="Dashboard Overview"
        description="A clear view of your progress. An honest look at your edge."
        actions={
          <div className={headingActions}>
            <Link href="/dashboard/settings" className={buttonClass({ variant: 'secondary' })}>
              <Wallet size={16} />
              Add balance
            </Link>
            <button
              className={buttonClass({ variant: 'secondary' })}
              onClick={() => exportTrades(trades)}
            >
              <Download size={16} />
              Export ledger
            </button>
            <button className={buttonClass()} onClick={() => openTrade()}>
              <Plus size={17} />
              Log trade
            </button>
          </div>
        }
      />
      <MarketSessions className="rounded-[16px] border border-line" />
      <div className="grid grid-cols-3 gap-3.5 min-[1650px]:grid-cols-6 max-[700px]:grid-cols-2 max-[700px]:gap-2.5">
        <StatCard
          index={0}
          label="Current balance"
          icon={Wallet}
          value={<CountUp value={cashBalance} format={money} />}
          sub={
            totalWithdrawn > 0
              ? `Capital ${money(user.startingBalance)} · withdrawn ${money(totalWithdrawn)}`
              : `Base capital ${money(user.startingBalance)}`
          }
        >
          <Sparkline className="-mt-1 h-[34px]" values={s.equityCurve.map((p) => p.balance)} />
        </StatCard>
        <StatCard
          index={1}
          label="Total net P&L"
          icon={TrendingUp}
          tone={pnlTone}
          valueTone={pnlTone}
          value={<CountUp value={s.totalPnl} format={signedMoney} />}
          sub={`${s.totalTrades} closed trades`}
        />
        <StatCard
          index={2}
          label="Win rate"
          icon={Target}
          tone="cyan"
          value={<CountUp value={s.winRate} format={pct} />}
          sub={`${s.wins} wins · ${s.losses} losses · ${s.breakeven} neutral`}
        >
          <Progress value={s.winRate} />
        </StatCard>
        <StatCard
          index={3}
          label="Profit factor"
          icon={Scale}
          value={
            s.profitFactor === null ? (
              s.wins ? (
                '∞'
              ) : (
                '—'
              )
            ) : (
              <CountUp value={s.profitFactor} format={(n) => n.toFixed(2)} />
            )
          }
          sub={s.profitFactor === null ? 'No losing trades yet' : 'Gross profit / gross loss'}
        />
        <StatCard
          index={4}
          label="Best trading day"
          icon={Trophy}
          tone="green"
          value={s.bestDay ? <CountUp value={s.bestDay.pnl} format={signedMoney} /> : '—'}
          sub={s.bestDay ? shortDate(s.bestDay.date) : 'Your best day is ahead'}
        />
        <StatCard
          index={5}
          label="Current streak"
          icon={Flame}
          tone="amber"
          value={`${s.currentStreak.count} ${streakUnit}`}
          sub="Consecutive trading days"
        />
      </div>
      <div className="grid grid-cols-[minmax(0,1.9fr)_minmax(280px,1fr)] gap-[18px] max-[1200px]:grid-cols-[minmax(0,1.6fr)_minmax(250px,1fr)] max-[900px]:grid-cols-1">
        <Panel index={6}>
          <PanelHeader>
            <div>
              <h2>
                Cumulative Equity Curve <Badge className="text-[8.5px]">ALL TIME</Badge>
              </h2>
              <p>Every trade. Every lesson. Your journey in numbers.</p>
            </div>
            <Badge tone="gain" className="text-[8.5px]">
              <StatusDot /> LIVE EQUITY
            </Badge>
          </PanelHeader>
          <div className="mb-1.5 grid grid-cols-3 gap-2.5 max-[700px]:gap-1.5">
            <div className={cn(tile, 'gap-1.5 px-3.5 py-3 max-[700px]:p-2.5')}>
              <span className={summaryEyebrow}>CURRENT EQUITY</span>
              <strong className={summaryValue}>{money(cashBalance)}</strong>
            </div>
            <div className={cn(tile, 'gap-1.5 px-3.5 py-3 max-[700px]:p-2.5')}>
              <span className={summaryEyebrow}>NET RETURN</span>
              <strong className={cn(summaryValue, tone[pnlTone])}>
                {user.startingBalance
                  ? `${((s.totalPnl / user.startingBalance) * 100).toFixed(2)}%`
                  : '—'}
              </strong>
            </div>
            <div className={cn(tile, 'gap-1.5 px-3.5 py-3 max-[700px]:p-2.5')}>
              <span className={summaryEyebrow}>STARTING BALANCE</span>
              <strong className={cn(summaryValue, tone.muted)}>
                {money(user.startingBalance)}
              </strong>
            </div>
          </div>
          <EquityChart data={s.equityCurve} baseline={user.startingBalance} />
        </Panel>
        <Panel
          index={7}
          className="max-[900px]:grid max-[900px]:grid-cols-2 max-[900px]:items-center max-[700px]:block"
        >
          <PanelHeader className="max-[900px]:col-span-full max-[900px]:mb-0">
            <div>
              <h2>Outcome Expectancy</h2>
              <p>Your closed trade distribution</p>
            </div>
            <StatIcon tone="purple">
              <Target size={16} />
            </StatIcon>
          </PanelHeader>
          <OutcomeChart summary={s} />
          <div className="grid grid-cols-2 gap-2.5 max-[900px]:flex max-[900px]:flex-col max-[900px]:justify-center max-[700px]:grid max-[700px]:grid-cols-2">
            <div className={cn(tile, 'gap-1 p-[13px]')}>
              <span className={cn(eyebrow, 'text-[9.5px]', tone.green)}>● {s.wins} WINS</span>
              <strong className={cn(mono, 'text-[15px]', tone.green)}>{money(s.grossWin)}</strong>
              <small className="text-[10.5px] text-[#9892ac]">Avg: {money(s.avgWin)}</small>
            </div>
            <div className={cn(tile, 'gap-1 p-[13px]')}>
              <span className={cn(eyebrow, 'text-[9.5px]', tone.red)}>● {s.losses} LOSSES</span>
              <strong className={cn(mono, 'text-[15px]', tone.red)}>{money(-s.grossLoss)}</strong>
              <small className="text-[10.5px] text-[#9892ac]">Avg: {money(s.avgLoss)}</small>
            </div>
          </div>
        </Panel>
      </div>
      <div className="grid grid-cols-[minmax(0,1.8fr)_minmax(290px,1fr)] gap-[18px] max-[1200px]:grid-cols-1">
        <Panel index={8} className="self-start pb-0">
          <PanelHeader>
            <div>
              <h2>
                Recent Executions <Badge className="text-[8.5px]">LAST 6</Badge>
              </h2>
              <p>A closer look at your latest decisions</p>
            </div>
            <Link className={textLinkClass} href="/dashboard/trades">
              View ledger <ArrowUpRight size={15} />
            </Link>
          </PanelHeader>
          <TradeTable trades={trades.slice(0, 6)} compact />
          <div className="flex items-center justify-between gap-3 py-4 text-[11px] text-[#8c849e]">
            <span>
              Showing {Math.min(6, trades.length)} of {trades.length} trades
            </span>
            <Link href="/dashboard/trades" className={textLinkClass}>
              All executions <ArrowUpRight size={15} />
            </Link>
          </div>
        </Panel>
        <Panel
          index={9}
          className="max-[1200px]:grid max-[1200px]:grid-cols-2 max-[1200px]:gap-[15px] max-[700px]:block"
        >
          <PanelHeader className="max-[1200px]:col-span-full max-[1200px]:mb-0">
            <div>
              <h2>Behavioral Edge Index</h2>
              <p>Learn from the patterns in your process</p>
            </div>
          </PanelHeader>
          <BehavioralChart className="max-[1200px]:h-[240px]" data={s.behavioralScores} />
          <div className="grid gap-[11px] max-[1200px]:self-center max-[700px]:gap-3">
            {s.behavioralScores.map((v) => (
              <div
                key={v.name}
                className="grid grid-cols-[1fr_auto] items-center gap-1.5 text-[11.5px] text-[#c4bdd6]"
              >
                <span>{v.name}</span>
                <strong className={cn(mono, 'text-[11px]', tone.purple)}>
                  {v.score}
                  <small className="text-[9px] text-[#7d758e]">/100</small>
                </strong>
                <Progress value={v.score} className="col-span-full h-1" />
              </div>
            ))}
          </div>
          <p className={cn(note, 'max-[1200px]:col-span-full max-[1200px]:m-0')}>
            Heuristic scores based on your journal data. These are reflection tools, not validated
            performance assessments.
          </p>
        </Panel>
        <WithdrawalsPanel index={8} />
      </div>
    </>
  );
}
