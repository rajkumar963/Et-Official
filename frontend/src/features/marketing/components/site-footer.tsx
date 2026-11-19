import Link from 'next/link';
import { MessageCircle, MoveUpRight, Send, Youtube } from 'lucide-react';
import { Brand } from '@/components/ui/brand';
import { contactChannels } from '@/config/site';

const footerLink =
  'inline-flex min-h-9 items-center rounded-lg px-2.5 text-[13px] text-[#aaa7bd] transition-colors hover:bg-white/[0.06] hover:text-white';
const socialLink =
  'inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.025] px-3.5 text-[13px] text-[#c1bed0] transition hover:border-violet-400/40 hover:bg-violet-400/[0.08] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300';

export function SiteFooter() {
  return (
    <footer className="scroll-mt-[100px] border-t border-white/[0.08] bg-[#090b12] px-6 pt-10 pb-6 text-fg sm:pt-12" id="site-footer">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex items-start justify-between gap-8 max-[860px]:flex-col">
          <div className="shrink-0">
            <Brand />
            <p className="mt-3 text-[13px] text-[#858197]">A clearer process starts here.</p>
          </div>
          <nav
            aria-label="Footer navigation"
            className="flex max-w-[700px] flex-wrap gap-1 text-[#a09db4] max-[860px]:-ml-2"
          >
            <Link href="/courses" className={footerLink}>Courses</Link>
            <Link href="/ebooks" className={footerLink}>E-books</Link>
            <Link href="/#updates" className={footerLink}>Important Update</Link>
            <Link href="/#process" className={footerLink}>How it works</Link>
            <Link href="/contact" className={footerLink}>Contact Us</Link>
            <Link href="/login" className={footerLink}>Log in</Link>
            <Link href="/signup" className={footerLink}>Get started <MoveUpRight size={13} /></Link>
          </nav>
        </div>

        <div className="mt-7 border-t border-white/[0.07] pt-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#77748c]">
            Follow and connect
          </p>
          <nav aria-label="Social media" className="flex flex-wrap gap-2">
            <a href={contactChannels.youtube.href} target="_blank" rel="noreferrer" className={socialLink}>
              <Youtube size={16} className="text-red-300" /> YouTube
            </a>
            <a href={contactChannels.telegramCommunity.href} target="_blank" rel="noreferrer" className={socialLink}>
              <Send size={15} className="text-sky-300" /> Telegram community
            </a>
            {/* <a href={contactChannels.telegramPersonal.href} target="_blank" rel="noreferrer" className={socialLink}>
              <Send size={15} className="text-sky-300" /> Telegram contact
            </a> */}
            <a href={contactChannels.whatsapp.href} target="_blank" rel="noreferrer" className={socialLink}>
              <MessageCircle size={16} className="text-emerald-300" /> Instagram
            </a>
          </nav>
        </div>

        <div className="mt-8 flex justify-between gap-4 border-t border-white/[0.07] pt-5 text-[12px] text-[#77748c] max-[560px]:flex-col">
          <span>Copyright © {new Date().getFullYear()} ET Official.</span>
          <span>Reflect. Refine. Repeat.</span>
        </div>
      </div>
    </footer>
  );
}
