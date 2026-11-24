'use client';
import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookKey,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  ChartNoAxesCombined,
  PlaySquare,
  ReceiptText,
  ShieldCheck,
  Users,
  UserRound,
} from 'lucide-react';
import { Brand } from '@/components/ui/brand';
import { StatusDot } from '@/components/ui/badge';
import { iconButtonClass } from '@/components/ui/button';
import { errorBox } from '@/components/ui/form';
import { eyebrow, mono } from '@/components/ui/styles';
import { AmbientBackdrop } from '@/components/effects/ambient-backdrop';
import { authService } from '@/features/auth/auth.api';
import { resetAnalytics } from '@/features/analytics/posthog';
import { cn } from '@/lib/cn';

const mobileOnly = 'hidden max-[700px]:inline-flex';

const navigation = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ReceiptText },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Course access', href: '/admin/products', icon: BookKey },
  { name: 'Course lessons', href: '/admin/lessons', icon: PlaySquare },
  { name: 'Analytics', href: '/admin/analytics', icon: ChartNoAxesCombined },
];

const secondary = [
  { name: 'Back to site', href: '/', icon: ArrowLeft },
  { name: 'My dashboard', href: '/dashboard', icon: UserRound },
];

const pageTitle = (path: string) =>
  [...navigation].reverse().find((item) => path === item.href || path.startsWith(`${item.href}/`))
    ?.name || 'Admin';

export function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string } | null;
  children: ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const [mobile, setMobile] = useState(false);
  const [logoutError, setLogoutError] = useState('');
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
        <div
          className={cn(
            eyebrow,
            'mx-3 mt-[34px] mb-2.5 flex items-center gap-1.5 text-[9.5px] text-amber',
          )}
        >
          <ShieldCheck size={12} /> ADMIN
        </div>
        <nav className="flex flex-col gap-1">
          {navigation.map((item) => {
            const active =
              item.href === '/admin'
                ? path === '/admin'
                : path === item.href || path.startsWith(`${item.href}/`);
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
        <div className={cn(eyebrow, 'mx-3 mt-7 mb-2.5 text-[9.5px] text-dim')}>SHORTCUTS</div>
        <nav className="flex flex-col gap-0.5">
          {secondary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-[#a9a6bc] hover:bg-[#ffffff07] hover:text-white"
              onClick={() => setMobile(false)}
            >
              <item.icon size={15} className="ml-[7px]" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-[30px]">
          {user && (
            <div className="rounded-[16px] border border-line bg-[#ffffff05] p-3.5">
              <span className={cn(eyebrow, 'text-[9px] text-[#a7a3bb]')}>SIGNED IN AS</span>
              <strong className="mt-1.5 block truncate text-[13px]">{user.name}</strong>
              <small className="block truncate text-[11px] text-muted">{user.email}</small>
            </div>
          )}
          <div className="mt-3.5 flex items-center justify-center gap-2 text-[10.5px] text-[#77758b]">
            <StatusDot />
            Admin portal
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
              <strong className="font-display text-[16px] font-semibold tracking-[-0.02em] max-[700px]:text-[14px]">
                {pageTitle(path)}
              </strong>
              <small className="mt-0.5 block text-[11.5px] text-muted max-[700px]:text-[10px]">
                ET Official admin
              </small>
            </div>
          </div>
          <div className="flex items-center gap-3 max-[700px]:gap-1.5">
            <span className="flex items-center gap-2 rounded-full border border-[#fbbf2430] bg-[#fbbf240d] px-3 py-[7px] text-[11px] text-[#fde68a] max-[700px]:hidden">
              <ShieldCheck size={13} /> Admin access
            </span>
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
            <p className={cn(errorBox, 'mb-4')} role="alert">
              {logoutError}
            </p>
          )}
          <div
            className="flex animate-[page-in_0.6s_var(--ease-smooth)_backwards] flex-col gap-[22px] max-[700px]:gap-4"
            key={path}
          >
            {children}
          </div>
        </main>
        <footer className="flex justify-between border-t border-line px-[30px] py-[18px] text-[10.5px] text-[#5d586f] max-[700px]:px-4 max-[700px]:py-[15px]">
          <span>ET Official · Admin</span>
          <span className={cn(mono, 'max-[700px]:hidden')}>Verify. Approve. Deliver.</span>
        </footer>
      </div>
    </div>
  );
}
