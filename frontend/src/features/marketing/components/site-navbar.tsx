'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, ChevronDown, LineChart, Menu, Binary, X } from 'lucide-react';
import { Brand } from '@/components/ui/brand';
import type { UserDto } from '@et-trader/shared';
import { getSessionUser } from '@/features/auth/auth.api';
import { cn } from '@/lib/cn';

type NavChild = { label: string; href: string; desc: string; icon: typeof Binary };
type NavItem = {
  label: string;
  homeHref?: string;
  pageHref?: string;
  children?: NavChild[];
};

/** `homeHref` is used on the landing page (in-page anchors), `pageHref` everywhere else. */
const items: NavItem[] = [
  { label: 'Home', homeHref: '/', pageHref: '/' },
  { label: 'Dashboard', homeHref: '/dashboard', pageHref: '/dashboard' },
  { label: 'Courses', homeHref: '/courses', pageHref: '/courses' },
  { label: 'E-books', homeHref: '/ebooks', pageHref: '/ebooks' },
   {
    label: 'Account and Update',
    children: [
      {
        label: 'Binary Trading',
        href: '/brokers/binary',
        desc: 'Open a binary account & updates',
        icon: Binary,
      },
      {
        label: 'Forex Trading',
        href: '/brokers/forex',
        desc: 'Open a forex account & updates',
        icon: LineChart,
      },
    ],
  },
  { label: 'Contact Us', homeHref: '/contact', pageHref: '/contact' },
];

const isActive = (pathname: string, href: string) =>
  href === '/'
    ? pathname === '/'
    : href.startsWith('/') && !href.includes('#') && pathname.startsWith(href);

/** Below 1020px the inline links collapse into the menu-button dropdown. */
const navBase = 'mx-auto flex gap-1.5';
const navClosed = 'max-[1020px]:hidden';
const navOpen =
  'max-[1020px]:absolute max-[1020px]:inset-x-[14px] max-[1020px]:top-[calc(100%-4px)] max-[1020px]:flex-col max-[1020px]:rounded-[16px] max-[1020px]:border max-[1020px]:border-[#ffffff14] max-[1020px]:bg-[rgba(12,12,21,0.94)] max-[1020px]:p-[10px] max-[1020px]:backdrop-blur-[18px] max-[1020px]:animate-[lp-rise-in_0.3s_both]';

const ctaClass =
  'inline-flex items-center gap-1.5 rounded-[11px] bg-[linear-gradient(180deg,#fff,#ddd5f7)] px-4 py-[10px] text-[14px] font-semibold text-[#0b0716] shadow-[inset_0_0_0_1px_#ffffff40,0_8px_26px_#8b5cf640] hover:-translate-y-px hover:shadow-[inset_0_0_0_1px_#ffffff60,0_12px_32px_#8b5cf670] max-[560px]:px-[13px] max-[560px]:py-[9px] max-[560px]:text-[13px]';

const linkBase =
  'relative rounded-[10px] px-[14px] py-2 text-[14px] font-medium text-[#b4b1c6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a78bfa]';
const linkClosed = 'hover:bg-[#ffffff0a] hover:text-white';
const linkOpen = 'max-[1020px]:py-[13px] max-[1020px]:text-[15px]';

/** "Account and Update" expands to Binary / Forex. Popover on desktop, inline list in the mobile menu. */
function NavDropdown({
  item,
  pathname,
  menuOpen,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  menuOpen: boolean;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const children = item.children ?? [];
  const anyActive = children.some((c) => pathname.startsWith(c.href));

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const panelItems = children.map(({ label, href, desc, icon: Icon }) => {
    const current = pathname.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        aria-current={current ? 'page' : undefined}
        onClick={() => {
          setOpen(false);
          onNavigate();
        }}
        className={cn(
          'flex items-start gap-3 rounded-[11px] px-3 py-2.5 text-left hover:bg-[#ffffff0a]',
          current && 'bg-[#ffffff0d]',
        )}
      >
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-[9px] border border-[#8b5cf655] bg-[#8b5cf61f] text-violet-2">
          <Icon size={15} aria-hidden="true" />
        </span>
        <span>
          <span className="block text-[14px] font-semibold text-white">{label}</span>
          <span className="block text-[12px] text-[#9a97ad]">{desc}</span>
        </span>
      </Link>
    );
  });

  // Mobile: render inline inside the open menu (no popover).
  if (menuOpen) {
    return (
      <div className="grid gap-1">
        <span className="px-[14px] pt-2 pb-1 font-mono text-[11px] font-semibold tracking-[0.14em] text-[#6e6b84] uppercase">
          {item.label}
        </span>
        {panelItems}
      </div>
    );
  }

  // Desktop: button + popover.
  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          linkBase,
          linkClosed,
          'inline-flex items-center gap-1',
          anyActive && 'bg-[#ffffff0d] text-white',
        )}
      >
        {item.label}
        <ChevronDown
          size={15}
          className={cn('transition-transform duration-200', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-1/2 top-[calc(100%+8px)] z-50 w-[270px] -translate-x-1/2 rounded-[16px] border border-[#ffffff14] bg-[rgba(12,12,21,0.96)] p-2 shadow-[0_18px_50px_#00000080,inset_0_1px_0_#ffffff0d] backdrop-blur-[18px] animate-[lp-rise-in_0.2s_both]"
        >
          {panelItems}
        </div>
      )}
    </div>
  );
}

export function SiteNavbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<UserDto | null>(null);

  useEffect(() => {
    let active = true;
    void getSessionUser().then((u) => active && setUser(u));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 px-6 py-[18px] [transition:padding_0.4s] max-[860px]:px-[14px] max-[860px]:py-3',
        scrolled && 'pt-[10px]',
      )}
    >
      <div
        className={cn(
          'mx-auto flex max-w-[1240px] items-center gap-6 rounded-[18px] border border-transparent py-[10px] pr-3 pl-[18px] [transition:background_0.4s,border-color_0.4s,box-shadow_0.4s,max-width_0.5s]',
          scrolled &&
            'max-w-[1080px] border-[#ffffff14] bg-[rgba(12,12,21,0.72)] shadow-[0_12px_40px_#00000066,inset_0_1px_0_#ffffff0d] backdrop-blur-[18px] backdrop-saturate-[160%]',
        )}
      >
        <Brand />
        <nav
          id="site-navigation"
          aria-label="Main navigation"
          className={cn(navBase, menuOpen ? navOpen : navClosed)}
        >
          {items.map((item) => {
            if (item.children) {
              return (
                <NavDropdown
                  key={item.label}
                  item={item}
                  pathname={pathname}
                  menuOpen={menuOpen}
                  onNavigate={() => setMenuOpen(false)}
                />
              );
            }
            const href = (isHome ? item.homeHref : item.pageHref) ?? '/';
            const current = isActive(pathname, href);
            return (
              <Link
                key={item.label}
                href={href}
                aria-current={current ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  linkBase,
                  menuOpen ? linkOpen : linkClosed,
                  current && 'bg-[#ffffff0d] text-white',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2 max-[1020px]:ml-auto">
          {user ? (
            <>
              <span
                className="grid size-9 place-items-center rounded-full bg-[linear-gradient(135deg,#8b5cf6,#0891b2)] text-[12px] font-bold text-white max-[560px]:hidden"
                title={`Signed in as ${user.name}`}
                aria-hidden="true"
              >
                {user.name.slice(0, 2).toUpperCase()}
              </span>
              {user.isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-[10px] px-[14px] py-[9px] text-[14px] font-medium text-[#d6d3e4] hover:bg-[#ffffff0a] hover:text-white max-[560px]:hidden"
                >
                  Admin
                </Link>
              )}
              <Link href="/dashboard" className={ctaClass}>
                My dashboard <ArrowUpRight size={15} />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-[10px] px-[14px] py-[9px] text-[14px] font-medium text-[#d6d3e4] hover:bg-[#ffffff0a] hover:text-white max-[560px]:hidden"
              >
                Log in
              </Link>
              <Link href="/signup" className={ctaClass}>
                Get started <ArrowUpRight size={15} />
              </Link>
            </>
          )}
          <button
            className="hidden size-10 items-center justify-center rounded-[10px] border border-[#ffffff14] bg-[#ffffff08] text-white max-[1020px]:inline-flex"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            aria-controls="site-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
    </header>
  );
}
