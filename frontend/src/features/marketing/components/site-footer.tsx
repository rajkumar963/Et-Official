import Link from 'next/link';
import { Instagram, Send, Youtube } from 'lucide-react';
import { Brand } from '@/components/ui/brand';
import { contactChannels } from '@/config/site';

const footerGroups = [
  {
    title: 'Explore',
    links: [
      { href: '/dashboard', label: 'Trading journal' },
      { href: '/courses', label: 'Trading courses' },
      { href: '/ebooks', label: 'E-books' },
      { href: '/#process', label: 'How it works' },
    ],
  },
  {
    title: 'ET Official',
    links: [
      { href: '/#updates', label: 'Important updates' },
      { href: '/contact', label: 'Contact us' },
      { href: '/login', label: 'Log in' },
      { href: '/signup', label: 'Get started' },
    ],
  },
];

const socials = [
  {
    label: 'YouTube',
    channel: contactChannels.youtube,
    icon: Youtube,
    color: 'group-hover:text-[#ff9a9a]',
  },
  {
    label: 'Telegram',
    channel: contactChannels.telegramCommunity,
    icon: Send,
    color: 'group-hover:text-[#7dd3fc]',
  },
  {
    label: 'Instagram',
    channel: contactChannels.instagram,
    icon: Instagram,
    color: 'group-hover:text-[#f9a8d4]',
  },
];

export function SiteFooter() {
  return (
    <footer
      id="site-footer"
      className="relative isolate scroll-mt-[100px] overflow-hidden border-t border-white/[0.07] bg-[#080910] text-[#f1eff9]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent_5%,#8b5cf660_45%,#22d3ee30_70%,transparent_95%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-[5%] -z-[1] h-[320px] w-[580px] rounded-full bg-violet/[0.06] blur-[100px]"
      />
      <div className="mx-auto max-w-[1240px] px-6 pt-14 pb-6 max-[560px]:px-[18px] max-[560px]:pt-10">
        <div className="grid grid-cols-1 items-start gap-10 pb-12 md:grid-cols-2 md:gap-x-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12">
          <div className="min-w-0">
            <Brand className="text-[21px] [&_img]:size-11" />
            <p className="mt-6 font-display text-[28px] leading-[1.2] font-medium tracking-[-0.04em]">
              A clearer process.
              <br />
              <span className="text-[#b9a5eb]">One trade at a time.</span>
            </p>
            <p className="mt-4 max-w-[32ch] text-[14px] leading-[1.75] text-[#9390a7]">
              A focused space to reflect on your trades, refine your habits, and keep learning.
            </p>
            <nav aria-label="Social media" className="mt-6 flex items-center gap-2.5">
              {socials.map(({ label, channel, icon: Icon, color }) => (
                <a
                  key={label}
                  href={channel.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  aria-label={`${label}: ${channel.label} (opens in a new tab)`}
                  className="group grid size-11 shrink-0 place-items-center rounded-full border border-white/[0.09] bg-white/[0.025] text-[#a8a4ba] transition-[background-color,border-color,color] duration-200 hover:border-[#a78bfa55] hover:bg-[#a78bfa0c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300"
                >
                  <Icon
                    size={18}
                    strokeWidth={1.7}
                    className={`transition-colors ${color}`}
                    aria-hidden="true"
                  />
                </a>
              ))}
            </nav>
          </div>

          <nav
            aria-label="Footer navigation"
            className="grid min-w-0 grid-cols-2 gap-5 pt-1 md:pt-2"
          >
            {footerGroups.map(({ title, links }) => (
              <div key={title}>
                <h2 className="mb-4 text-[13px] font-semibold tracking-[0.02em] text-[#eeebf6]">
                  {title}
                </h2>
                <ul className="m-0 grid list-none gap-1 p-0">
                  {links.map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="inline-flex min-h-10 max-w-full items-center rounded-md py-2 text-[14px] leading-[1.5] text-[#9390a7] transition-colors hover:text-[#ddd0ff] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <aside
            aria-label="Telegram community"
            className="relative min-w-0 overflow-hidden rounded-[20px] border border-[#a78bfa26] bg-[radial-gradient(ellipse_at_0%_0%,#8b5cf61c,transparent_75%),linear-gradient(145deg,#151220,#0d0e17)] p-6 shadow-[inset_0_1px_0_#ffffff05] md:col-span-2 md:flex md:items-center md:gap-8 lg:col-span-1 lg:block"
          >
            <div className="min-w-0 flex-1">
              <span
                className="mb-5 grid size-10 place-items-center rounded-xl border border-[#a78bfa26] bg-[#8b5cf614] text-[#c4b5fd]"
                aria-hidden="true"
              >
                <Send size={19} strokeWidth={1.6} />
              </span>
              <h2 className="font-display text-[21px] leading-[1.25] font-medium tracking-[-0.03em] text-[#f0ecfa]">
                Keep good company.
              </h2>
              <p className="mt-3 text-[14px] leading-[1.7] text-[#a19ab4]">
                Get the latest updates and join the conversation with the ET community.
              </p>
            </div>
            <a
              href={contactChannels.telegramCommunity.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join the ET Telegram community (opens in a new tab)"
              className="mt-6 inline-flex min-h-11 w-full shrink-0 items-center justify-center rounded-[10px] border border-[#c4b5fd33] bg-[#a78bfa12] px-4 py-2.5 text-[14px] font-semibold text-[#ded2fa] transition-[background-color,border-color,color] hover:border-[#c4b5fd66] hover:bg-[#a78bfa24] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300 md:mt-0 md:w-auto lg:mt-6 lg:w-full"
            >
              Join our Telegram
            </a>
          </aside>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-white/[0.07] pt-5 text-[12px] leading-[1.6] text-[#77738b] max-[560px]:flex-col max-[560px]:items-start">
          <p>© {new Date().getFullYear()} ET Official. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span className="h-px w-5 bg-[#a78bfa55]" aria-hidden="true" />
            Reflect. Refine. Repeat.
          </p>
        </div>
      </div>
    </footer>
  );
}
