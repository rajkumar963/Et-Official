import Link from 'next/link';
import { ArrowUpRight, MessageCircle, NotebookPen } from 'lucide-react';
import { gradientText, sectionLabel } from '../marketing-styles';

export function ContactSection() {
  return (
    <section
      className="mx-auto max-w-[1240px] scroll-mt-[100px] px-6 pt-[35px] pb-[75px] max-[560px]:px-[18px] max-[560px]:pt-5 max-[560px]:pb-[60px]"
      id="contact"
    >
      <div className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-6 rounded-[20px] border border-[#8b5cf638] p-7 shadow-[0_20px_70px_#0005] [background:radial-gradient(50%_180%_at_0%_0%,#8b5cf620,transparent_80%),linear-gradient(120deg,#14111f,#0b0c13_72%)] max-[820px]:grid-cols-[56px_minmax(0,1fr)] max-[820px]:gap-5 max-[560px]:gap-x-4 max-[560px]:p-6">
        <div
          className="grid size-14 place-items-center rounded-[15px] border border-[#a78bfa44] bg-[#8b5cf61c] text-[#c4b5fd] max-[560px]:self-start"
          aria-hidden="true"
        >
          <MessageCircle size={22} />
        </div>
        <div>
          <span className={sectionLabel}>WE ARE HERE TO HELP</span>
          <h2 className="mt-2 font-display text-[length:clamp(24px,3vw,35px)] leading-[1.2] font-semibold tracking-[-0.04em]">
            Let&apos;s talk about <span className={gradientText}>your next step.</span>
          </h2>
          <p className="mt-3 max-w-[620px] text-[16px] leading-[1.65] text-[#a6a2b7]">
            Questions about ET Official, the courses, or the e-books? Send us a message from our
            contact page.
          </p>
        </div>
        <Link
          href="/contact"
          className="inline-flex min-h-12 min-w-[136px] items-center justify-center gap-2 rounded-[11px] border border-[#a78bfa66] bg-[linear-gradient(110deg,#6d28d9,#8b5cf6)] px-5 py-3 text-[14px] font-semibold whitespace-nowrap text-white shadow-[0_8px_24px_#8b5cf633] transition-[filter,box-shadow] hover:brightness-110 hover:shadow-[0_10px_30px_#8b5cf64d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-2 max-[820px]:col-start-2 max-[820px]:justify-self-start max-[560px]:col-span-2 max-[560px]:w-full"
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
