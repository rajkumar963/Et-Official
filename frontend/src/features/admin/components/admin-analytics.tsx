'use client';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Filter,
  MousePointerClick,
  PlayCircle,
  TriangleAlert,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageHeading } from '@/components/ui/page-heading';
import { Panel } from '@/components/ui/panel';
import { StatIcon } from '@/components/ui/stat-card';
import { buttonClass } from '@/components/ui/button';
import { note } from '@/components/ui/styles';
import { cn } from '@/lib/cn';

/** Where your PostHog project lives. Override per region/project via env. */
const uiHost = (process.env.NEXT_PUBLIC_POSTHOG_UI_HOST ?? 'https://eu.posthog.com').replace(
  /\/+$/,
  '',
);
const projectUrl = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_URL?.replace(/\/+$/, '') || uiHost;
const configured = Boolean(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN);

const sections: { name: string; desc: string; path: string; icon: LucideIcon }[] = [
  {
    name: 'Web analytics',
    desc: 'Visitors, sessions, top pages, referrers and devices.',
    path: '/web',
    icon: BarChart3,
  },
  {
    name: 'Session replay',
    desc: 'Watch real recordings of how people use the site.',
    path: '/replay',
    icon: PlayCircle,
  },
  {
    name: 'Funnels & insights',
    desc: 'Build conversion funnels, e.g. visit → signup → purchase.',
    path: '/insights',
    icon: Filter,
  },
  {
    name: 'Events',
    desc: 'Live feed of every pageview, click and custom event.',
    path: '/activity/explore',
    icon: MousePointerClick,
  },
  {
    name: 'People',
    desc: 'Individual users, matched to their account email.',
    path: '/persons',
    icon: Users,
  },
  {
    name: 'Dashboards',
    desc: 'Saved reports and scheduled summaries.',
    path: '/dashboard',
    icon: Activity,
  },
];

export function AdminAnalytics() {
  return (
    <>
      <PageHeading
        eyebrow="ANALYTICS"
        title="Traffic & behaviour"
        description="Every visit, click and session on the site is tracked in PostHog. Open it to explore traffic, funnels, replays and reports."
        actions={
          <a
            href={projectUrl}
            target="_blank"
            rel="noreferrer"
            className={buttonClass({ className: 'max-[700px]:w-full max-[700px]:justify-center' })}
          >
            Open PostHog dashboard <ArrowUpRight size={16} />
          </a>
        }
      />

      {!configured && (
        <Panel className="flex items-start gap-3 border-[#fbbf2433] bg-[#fbbf240a]">
          <StatIcon tone="amber" className="shrink-0">
            <TriangleAlert size={16} />
          </StatIcon>
          <div className="min-w-0 text-[13px] leading-[1.7] text-[#f3dfa8]">
            <strong className="block text-white">Tracking is not switched on yet</strong>
            Add <code className="font-mono text-[12px]">NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN</code> to
            your hosting environment and redeploy. Until then no data is sent and the links below
            will show an empty project.
          </div>
        </Panel>
      )}

      <div className="grid grid-cols-3 gap-3.5 max-[1000px]:grid-cols-2 max-[700px]:grid-cols-1">
        {sections.map((s, i) => (
          <a
            key={s.name}
            href={`${projectUrl}${s.path}`}
            target="_blank"
            rel="noreferrer"
            className="group block"
          >
            <Panel
              index={i}
              className="h-full transition-[translate,border-color] duration-300 group-hover:-translate-y-[3px] group-hover:border-line-strong"
            >
              <div className="flex items-start gap-3">
                <StatIcon tone={i % 2 ? 'cyan' : 'purple'}>
                  <s.icon size={16} />
                </StatIcon>
                <div className="min-w-0">
                  <h2 className="flex items-center gap-1.5">
                    {s.name}
                    <ArrowUpRight
                      size={14}
                      className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-violet-3"
                    />
                  </h2>
                  <p className="mt-1 text-[12.5px] leading-[1.6] text-muted">{s.desc}</p>
                </div>
              </div>
            </Panel>
          </a>
        ))}
      </div>

      <p className={cn(note, 'mt-0')}>
        Signed-in users are identified by their account, so you can follow a real person from first
        visit through signup to purchase. Session replay must also be switched on inside PostHog
        (Project settings → Session replay) before recordings appear.
      </p>
    </>
  );
}
