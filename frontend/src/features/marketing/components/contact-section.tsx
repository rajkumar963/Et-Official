import Link from 'next/link';
import { ArrowUpRight, MessageCircle, NotebookPen } from 'lucide-react';
import { gradientText, sectionLabel } from '../marketing-styles';

export function ContactSection() {
  return (
    <section
      className="mx-auto max-w-[1240px] scroll-mt-[100px] px-6 pt-[35px] pb-[75px] max-[560px]:px-[18px] max-[560px]:pt-5 max-[560px]:pb-[60px]"
      id="contact"
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-6 rounded-[24px] border border-[#8b5cf644] p-[34px] shadow-[0_20px_70px_#0005] [background:radial-gradient(50%_120%_at_0%_0%,#8b5cf620,transparent_80%),linear-gradient(120deg,#11101b,#0a0b12_72%)] max-[820px]:grid-cols-[auto_minmax(0,1fr)] max-[820px]:gap-[18px] max-[820px]:p-6 max-[560px]:grid-cols-1 max-[560px]:p-[22px]">
        <div
          className="grid size-[58px] place-items-center rounded-[18px] border border-[#8b5cf655] bg-[#8b5cf620] text-violet-3"
          aria-hidden="true"
        >
          <MessageCircle size={22} />
        </div>
        <div>
          <span className={sectionLabel}>WE ARE HERE TO HELP</span>
          <h2 className="mt-[9px] font-display text-[length:clamp(24px,3vw,35px)] leading-[1.15] tracking-[-0.04em]">
            Let&apos;s talk about <span className={gradientText}>your next step.</span>
          </h2>
          <p className="mt-[9px] max-w-[620px] text-[13px] leading-[1.65] text-[#a09db4]">
            Questions about ET Trader, the courses, or the e-books? Send us a message from our
            contact page.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center gap-2 rounded-[11px] border border-[#a78bfa66] bg-[linear-gradient(110deg,#6d28d9,#8b5cf6)] px-[17px] py-3 text-[13px] font-bold whitespace-nowrap text-white shadow-[0_8px_24px_#8b5cf633] hover:-translate-y-px hover:brightness-110 max-[820px]:col-[2] max-[820px]:justify-self-start max-[560px]:col-[1]"
        >
          Contact us <ArrowUpRight size={17} />
        </Link>
      </div>
      <Link
        href="/dashboard"
        className="mt-[18px] flex items-center justify-center gap-2 text-[12px] text-[#a7a3bb] hover:text-white max-[560px]:items-start max-[560px]:text-center [&_svg]:text-cyan"
      >
        <NotebookPen size={15} /> Need help with your journal? Open your dashboard
      </Link>
    </section>
  );
}
