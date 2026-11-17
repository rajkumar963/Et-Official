'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Brand } from '@/components/ui/brand';
import type { UserDto } from '@et-trader/shared';
import { getSessionUser } from '@/features/auth/auth.api';
import { cn } from '@/lib/cn';

/** `homeHref` is used on the landing page (in-page anchors), `pageHref` everywhere else. */
const items = [
  { label: 'Home', homeHref: '/', pageHref: '/' },
  { label: 'Courses', homeHref: '/courses', pageHref: '/courses' },
  { label: 'E-books', homeHref: '/ebooks', pageHref: '/ebooks' },
  { label: 'Account and Update', homeHref: '#updates', pageHref: '/#updates' },
  { label: 'Dashboard', homeHref: '/dashboard', pageHref: '/dashboard' },
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
          {items.map(({ label, homeHref, pageHref }) => {
            const href = isHome ? homeHref : pageHref;
            const current = isActive(pathname, href);
            return (
              <Link
                key={label}
                href={href}
                aria-current={current ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  linkBase,
                  menuOpen ? linkOpen : linkClosed,
                  current && 'bg-[#ffffff0d] text-white',
                )}
              >
                {label}
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
