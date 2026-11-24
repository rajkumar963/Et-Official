'use client';
import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  ListOrdered,
  ChartNoAxesCombined,
  Settings,
  Plus,
  LogOut,
  Menu,
  ArrowUpRight,
  PanelLeftClose,
  GraduationCap,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { Brand } from '@/components/ui/brand';
import { Badge, StatusDot } from '@/components/ui/badge';
import { buttonClass, iconButtonClass } from '@/components/ui/button';
import { errorBox } from '@/components/ui/form';
import { eyebrow, mono } from '@/components/ui/styles';
import { AmbientBackdrop } from '@/components/effects/ambient-backdrop';
import { CountUp, useSpotlight } from '@/components/effects/motion';
import { Sparkline } from '@/components/charts/journal-charts';
import { useJournal } from '@/features/journal/journal-provider';
import { authService } from '@/features/auth/auth.api';
import { resetAnalytics } from '@/features/analytics/posthog';
import { TradeForm } from '@/features/trades/components/trade-form';
import { money } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Avatar } from './avatar';
/** Only shown on phones (previously .mobile-only). */
const mobileOnly = 'hidden max-[700px]:inline-flex';
const skeleton =
  'block h-32 animate-[shimmer-bg_1.6s_linear_infinite] rounded-[20px] border border-line [background:linear-gradient(100deg,transparent_30%,#ffffff0b_50%,transparent_70%)_0_0/200%_100%,#ffffff05]';
const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Calendar', href: '/dashboard/calendar', icon: CalendarDays },
  { name: 'Trades', href: '/dashboard/trades', icon: ListOrdered },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartNoAxesCombined },
  { name: 'My courses', href: '/dashboard/courses', icon: GraduationCap },
  { name: 'Profile', href: '/dashboard/profile', icon: UserRound },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];
const greeting = () => {
  const hour = new Date().getHours();
  return hour < 5
    ? 'Late session'
    : hour < 12
      ? 'Good morning'
      : hour < 18
        ? 'Good afternoon'
        : 'Good evening';
};
export function DashboardShell({ children }: { children: ReactNode }) {
  const journal = useJournal();
  const path = usePathname();
  const router = useRouter();
  const [mobile, setMobile] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  useSpotlight();
  const user = journal.user;
  const start = user?.startingBalance || 0;
  const pnl = journal.summary?.totalPnl || 0;
  // Cash on hand already has withdrawals deducted (see JournalProvider).
  const balance = journal.cashBalance;
  const change = start ? (pnl / start) * 100 : 0;
  return (
    <div className="relative isolate min-h-screen">
      <AmbientBackdrop />
      <aside
        className={cn(
          'fixed top-3 bottom-3 left-3 z-40 flex w-[246px] flex-col rounded-[22px] border border-line bg-[linear-gradient(180deg,rgba(20,19,32,0.82),rgba(12,12,20,0.82))] px-3.5 pt-[22px] pb-4 shadow-[0_30px_60px_#00000055,inset_0_1px_0_#ffffff0d] backdrop-blur-[20px] backdrop-saturate-150',
          'max-[1200px]:w-[220px] max-[700px]:top-0 max-[700px]:bottom-0 max-[700px]:left-0 max-[700px]:w-[272px] max-[700px]:rounded-[0_22px_22px_0] max-[700px]:transition-transform max-[700px]:duration-[350ms] max-[700px]:ease-smooth',
          mobile ? 'max-[700px]:translate-x-0' : 'max-[700px]:-translate-x-[105%]',
        )}
      >
        <div className="flex items-center justify-between gap-1.5 px-1.5">
          <Brand />
          <button
            className={iconButtonClass({ className: mobileOnly })}
            aria-label="Close navigation"
            onClick={() => setMobile(false)}
          >
            <PanelLeftClose size={20} />
          </button>
        </div>
        <div className={cn(eyebrow, 'mx-3 mt-[34px] mb-2.5 text-[9.5px] text-dim')}>
          YOUR WORKSPACE
        </div>
        <nav className="flex flex-col gap-1">
          {(user?.isAdmin
            ? [...navigation, { name: 'Admin', href: '/admin', icon: ShieldCheck }]
            : navigation
          ).map((item) => {
            const active = path === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-[13.5px] font-medium',
                  active
                    ? "border-[#a78bfa26] bg-[linear-gradient(90deg,#8b5cf62b,#8b5cf608)] text-[#f3eeff] before:absolute before:top-1/4 before:bottom-1/4 before:-left-[15px] before:w-[3px] before:rounded-[0_3px_3px_0] before:bg-[linear-gradient(180deg,var(--color-violet-3),var(--color-cyan))] before:shadow-[0_0_12px_var(--color-violet)] before:content-['']"
                    : 'text-[#a9a6bc] hover:bg-[#ffffff07] hover:text-white',
                )}
                onClick={() => setMobile(false)}
              >
                <span
                  className={cn(
                    'grid size-[30px] place-items-center rounded-[9px] border border-[#ffffff08] bg-[#ffffff06] transition-all duration-300 ease-smooth group-hover:scale-[1.06]',
                    active
                      ? 'border-[#c4b5fd66] bg-[linear-gradient(135deg,#8b5cf6,#6d28d9)] text-white shadow-[0_4px_18px_#7c3aed77]'
                      : 'group-hover:text-violet-3',
                  )}
                >
                  <item.icon size={16} />
                </span>
                <span>{item.name}</span>
                {active && (
                  <span className="ml-auto size-1.5 rounded-full bg-violet-3 shadow-[0_0_10px_var(--color-violet-2)]" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto pt-[30px]">
          <div className="relative flex animate-[rotate-angle_8s_linear_infinite] flex-col gap-1 overflow-hidden rounded-[18px] border border-transparent p-4 [background:linear-gradient(160deg,#1d1832,#110f1e)_padding-box,conic-gradient(from_var(--angle),#ffffff12_0_60%,#8b5cf6_75%,#22d3ee_82%,#ffffff12_92%)_border-box]">
            <span className={cn(eyebrow, 'text-[9px] text-[#a7a3bb]')}>ACCOUNT BALANCE</span>
            <CountUp
              className="mt-1.5 font-mono text-[22px] font-bold tracking-[-0.05em]"
              value={balance}
              format={money}
            />
            <div className="flex items-center justify-between gap-1.5 text-[10.5px] text-muted">
              <span>Initial {money(start)}</span>
              {start > 0 && (
                <Badge tone={change >= 0 ? 'gain' : 'loss'}>
                  {change >= 0 ? '+' : ''}
                  {change.toFixed(1)}%
                </Badge>
              )}
            </div>
            <Sparkline
              className="mx-[-4px] mt-2 h-[38px]"
              values={(journal.summary?.equityCurve || []).map((p) => p.balance)}
              color={change >= 0 ? '#4ade80' : '#ff5c6c'}
            />
            <button
              className={buttonClass({ className: 'mt-2.5 p-[9px] text-[12px]' })}
              onClick={() => journal.openTrade()}
            >
              <Plus size={16} /> New trade
            </button>
          </div>
          <div className="mt-3.5 flex items-center justify-center gap-2 text-[10.5px] text-[#77758b]">
            <StatusDot />
            All systems operational
          </div>
        </div>
      </aside>
      {mobile && (
        <button
          className="fixed inset-0 z-[35] animate-[fade-in_0.3s_both] border-0 bg-[#000000aa] backdrop-blur-[4px] min-[700px]:hidden"
          aria-label="Close menu"
          onClick={() => setMobile(false)}
        />
      )}
      <div className="ml-[270px] flex min-h-screen flex-col max-[1200px]:ml-[244px] max-[700px]:ml-0">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between gap-[15px] border-b border-line bg-[linear-gradient(180deg,#06060be6,#06060bb3)] px-[30px] backdrop-blur-[18px] backdrop-saturate-150 max-[1200px]:px-[22px] max-[700px]:h-[66px] max-[700px]:gap-1.5 max-[700px]:px-3.5">
          <div className="flex items-center gap-3">
            <button
              className={iconButtonClass({ className: mobileOnly })}
              aria-label="Open navigation"
              onClick={() => setMobile(true)}
            >
              <Menu size={22} />
            </button>
            <div>
              <strong
                className="font-display text-[16px] font-semibold tracking-[-0.02em] max-[700px]:text-[13px]"
                suppressHydrationWarning
              >
                {greeting()}
                {user ? `, ${user.name.split(' ')[0]}` : ''}{' '}
                <span className="inline-block origin-[70%_70%] animate-[wave_2.4s_0.6s_ease-in-out_2]">
                  👋
                </span>
              </strong>
              <small
                className="mt-0.5 block text-[11.5px] text-muted max-[700px]:text-[10px]"
                suppressHydrationWarning
              >
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </small>
            </div>
          </div>
          <div className="flex items-center gap-3 max-[700px]:gap-1.5">
            <span className="flex items-center gap-2 rounded-full border border-[#4ade8022] bg-[#4ade800d] px-3 py-[7px] text-[11px] text-[#a7e8bf] max-[1200px]:hidden">
              <StatusDot /> Personal workspace
            </span>
            <button
              className={buttonClass({
                size: 'sm',
                className: 'max-[700px]:px-2.5 max-[700px]:py-[9px]',
              })}
              onClick={() => journal.openTrade()}
            >
              <Plus size={17} />
              <span className="max-[700px]:hidden">Add Trade</span>
            </button>
            <Link
              href="/dashboard/profile"
              className="rounded-full transition-transform hover:scale-105 max-[900px]:hidden"
              title="Your profile"
            >
              <Avatar image={user?.image} title={user?.name}>
                {user?.name.slice(0, 2).toUpperCase() || 'ET'}
              </Avatar>
            </Link>
            <button
              className={iconButtonClass()}
              title="Sign out"
              aria-label="Sign out"
              onClick={async () => {
                try {
                  await authService.logout();
      resetAnalytics();
                  router.replace('/login');
                } catch (e) {
                  setLogoutError((e as Error).message);
                }
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1640px] flex-1 px-[30px] pt-8 pb-10 max-[1200px]:px-[22px] max-[1200px]:py-[26px] max-[700px]:px-3.5 max-[700px]:pt-5 max-[700px]:pb-[30px]">
          {logoutError && (
            <p className={errorBox} role="alert">
              {logoutError}
            </p>
          )}
          {journal.error ? (
            <div className="px-5 py-[70px] text-center">
              <h2>We couldn’t load your journal</h2>
              <p className="mt-[15px] mb-[25px] text-muted">{journal.error}</p>
              <button className={buttonClass()} onClick={() => journal.refresh()}>
                Try again <ArrowUpRight size={16} />
              </button>
            </div>
          ) : journal.loading ? (
            <div className="flex flex-col gap-[18px]" aria-busy="true">
              <span className="inline-flex items-center gap-3 text-[13px] text-[#b0a6c6]">
                <span className="size-[18px] animate-[spin_0.8s_linear_infinite] rounded-full border-2 border-[#a78bfa33] border-t-violet-2" />
                Loading your workspace…
              </span>
              <div className="grid grid-cols-3 gap-3.5 max-[900px]:grid-cols-2">
                <i className={skeleton} />
                <i className={skeleton} />
                <i className={skeleton} />
                <i className={cn(skeleton, 'col-span-full h-[340px]')} />
              </div>
            </div>
          ) : (
            <div
              className="flex animate-[page-in_0.6s_var(--ease-smooth)_backwards] flex-col gap-[22px] max-[700px]:gap-4"
              key={path}
            >
              {children}
            </div>
          )}
        </main>
        <footer className="flex justify-between border-t border-line px-[30px] py-[18px] text-[10.5px] text-[#5d586f] max-[700px]:px-4 max-[700px]:py-[15px]">
          <span>ET Official · Built for the process.</span>
          <span className={cn(mono, 'max-[700px]:hidden')}>Reflect. Refine. Repeat.</span>
        </footer>
      </div>
      {journal.editor && (
        <TradeForm
          trade={journal.editor.trade}
          date={journal.editor.date}
          onClose={journal.closeTrade}
        />
      )}
    </div>
  );
}
