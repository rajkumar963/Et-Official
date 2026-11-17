'use client';
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  ShieldAlert,
  ListOrdered,
  Target,
  Star,
  CloudRain,
} from 'lucide-react';
import { useJournal } from '@/features/journal/journal-provider';
import { PageHeading } from '@/components/ui/page-heading';
import { StatCard } from '@/components/ui/stat-card';
import { Panel, PanelHeader } from '@/components/ui/panel';
import { Badge } from '@/components/ui/badge';
import { note } from '@/components/ui/styles';
import {
  EquityChart,
  DailyChart,
  OutcomeChart,
  BehavioralChart,
} from '@/components/charts/journal-charts';
import { CountUp } from '@/components/effects/motion';
import { money, shortDate } from '@/lib/format';
/** Smaller stat values for the 4-column grid (previously .analytics-stats .stat-value). */
const statValue =
  'text-[22px] min-[1650px]:text-[22px] max-[1200px]:text-[18px] max-[700px]:text-[17px]';
export function AnalyticsView() {
  const { summary: s, user } = useJournal();
  if (!s) return null;
  return (
    <>
      <PageHeading
        eyebrow="TURN REFLECTION INTO PROGRESS"
        title="Analytics Suite"
        description="Go beyond the P&L. Understand what drives your results."
      />
      <div className="grid grid-cols-4 gap-3.5 max-[900px]:grid-cols-2 max-[700px]:gap-2.5">
        <StatCard
          valueClassName={statValue}
          index={0}
          label="Average win"
          icon={TrendingUp}
          tone="green"
          valueTone="green"
          value={<CountUp value={s.avgWin} format={money} />}
        />
        <StatCard
          valueClassName={statValue}
          index={1}
          label="Average loss"
          icon={TrendingDown}
          tone="red"
          valueTone="red"
          value={<CountUp value={s.avgLoss} format={money} />}
        />
        <StatCard
          valueClassName={statValue}
          index={2}
          label="Biggest win"
          icon={Trophy}
          tone="green"
          valueTone="green"
          value={<CountUp value={s.biggestWin} format={money} />}
        />
        <StatCard
          valueClassName={statValue}
          index={3}
          label="Biggest loss"
          icon={ShieldAlert}
          tone="red"
          valueTone="red"
          value={<CountUp value={s.biggestLoss} format={money} />}
        />
        <StatCard
          valueClassName={statValue}
          index={4}
          label="Total trades"
          icon={ListOrdered}
          value={<CountUp value={s.totalTrades} format={(n) => Math.round(n).toString()} />}
        />
        <StatCard
          valueClassName={statValue}
          index={5}
          label="Win rate"
          icon={Target}
          tone="cyan"
          value={<CountUp value={s.winRate} format={(n) => `${n.toFixed(1)}%`} />}
        />
        <StatCard
          valueClassName={statValue}
          index={6}
          label="Most traded"
          icon={Star}
          tone="amber"
          value={s.mostTradedSymbol || '—'}
        />
        <StatCard
          valueClassName={statValue}
          index={7}
          label="Worst day"
          icon={CloudRain}
          tone="red"
          value={s.worstDay ? money(s.worstDay.pnl) : '—'}
          sub={s.worstDay ? shortDate(s.worstDay.date) : undefined}
        />
      </div>
      <Panel index={8}>
        <PanelHeader>
          <div>
            <h2>Portfolio Equity</h2>
            <p>Daily closing balance, including your starting capital</p>
          </div>
          <Badge className="text-[8.5px]">ALL TIME</Badge>
        </PanelHeader>
        <EquityChart data={s.equityCurve} baseline={user?.startingBalance} />
      </Panel>
      <Panel index={9}>
        <PanelHeader>
          <div>
            <h2>Daily Net Performance</h2>
            <p>Your last 30 trading days</p>
          </div>
          <Badge className="text-[8.5px]">30 DAYS</Badge>
        </PanelHeader>
        <DailyChart data={s.dailyPnl} />
      </Panel>
      <div className="grid grid-cols-2 gap-[18px] max-[700px]:grid-cols-1">
        <Panel index={10}>
          <h2>Win / Loss Distribution</h2>
          <OutcomeChart summary={s} />
          <p className={note}>Win rate includes breakeven trades in the denominator.</p>
        </Panel>
        <Panel index={11}>
          <h2>Behavioral Edge</h2>
          <BehavioralChart data={s.behavioralScores} />
          <p className={note}>
            Deterministic journal heuristics. See the README for scoring formulas.
          </p>
        </Panel>
      </div>
    </>
  );
}
