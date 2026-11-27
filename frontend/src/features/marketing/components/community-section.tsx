import { Send } from 'lucide-react';
import { contactChannels } from '@/config/site';

export function CommunitySection() {
  return (
    <section
      id="community"
      aria-labelledby="community-heading"
      className="mx-auto max-w-[1240px] px-6 pt-10 pb-20 max-[560px]:px-[18px] max-[560px]:pb-14"
      data-reveal
    >
      <div className="relative isolate overflow-hidden rounded-[28px] border border-[#a78bfa26] bg-[linear-gradient(120deg,#141020,#0b0c15_65%,#0c1420)] shadow-[0_24px_80px_#00000030,inset_0_1px_0_#ffffff06]">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#a78bfa55_35%,#22d3ee33_80%,transparent)]"
          aria-hidden="true"
        />
        <div className="relative grid items-center gap-12 px-14 py-14 md:grid-cols-[minmax(0,1.35fr)_minmax(0,0.8fr)] max-[1024px]:gap-8 max-[1024px]:px-10 max-[560px]:px-6 max-[560px]:py-9">
          <div className="min-w-0">
            <p className="flex items-center gap-3 font-mono text-[12px] font-semibold tracking-[0.14em] text-[#b8a5df]">
              <span className="h-px w-6 bg-[#a78bfa80]" aria-hidden="true" />
              THE ET COMMUNITY
            </p>
            <h2
              id="community-heading"
              className="mt-5 font-display text-[length:clamp(32px,4.4vw,56px)] leading-[1.1] font-medium tracking-[-0.045em] text-[#f4f1fb]"
            >
              Your next chapter.
              <span className="mt-1 block bg-[linear-gradient(100deg,#c4b5fd,#a78bfa_55%,#67d5eb)] bg-clip-text text-transparent">
                Better, together.
              </span>
            </h2>
            <p className="mt-5 max-w-[440px] text-[16px] leading-[1.75] text-[#aaa3bc]">
              Every trade is a lesson. Join our Telegram community to keep learning, share
              perspectives, and stay connected with ET Official.
            </p>
            <a
              href={contactChannels.telegramCommunity.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join the ET Official Telegram community (opens in a new tab)"
              className="mt-7 inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-xl border border-[#c4b5fd55] bg-[linear-gradient(110deg,#8b5cf6,#6d28d9)] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_28px_#7c3aed30,inset_0_1px_0_#ffffff20] transition-[filter,box-shadow] hover:brightness-110 hover:shadow-[0_10px_32px_#7c3aed50] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300 max-[560px]:w-full"
            >
              <Send size={18} strokeWidth={1.8} aria-hidden="true" />
              Join our Telegram
            </a>
            <p className="mt-3 text-[13px] leading-relaxed text-[#89819c]">
              A clearer process starts with a conversation.
            </p>
          </div>
          <div
            className="relative flex min-h-[300px] flex-col items-center justify-center text-center max-[767px]:hidden"
            aria-hidden="true"
          >
            <div className="absolute inset-[-20px] rounded-full bg-[radial-gradient(ellipse_at_center,#7c3aed1f,transparent_68%)]" />
            <div className="absolute top-1/2 left-1/2 size-[290px] -translate-x-1/2 -translate-y-[60%] rounded-full border border-[#a78bfa0b]" />
            <div className="absolute top-1/2 left-1/2 size-[230px] -translate-x-1/2 -translate-y-[63%] rounded-full border border-[#a78bfa12]" />
            <div className="relative grid size-[112px] place-items-center rounded-[32px] border border-[#c4b5fd33] bg-[linear-gradient(145deg,#9a78f0,#7750ce_45%,#42b9dc)] text-white shadow-[0_16px_50px_#8b5cf62b,inset_0_1px_0_#ffffff44]">
              <Send size={48} strokeWidth={1.35} className="-ml-1 mt-1" />
            </div>
            <p className="relative mt-7 font-display text-[24px] font-medium tracking-[-0.03em] text-[#e9e3f5]">
              ET Official
            </p>
            <p className="relative mt-1 text-[14px] text-[#9890ab]">
              Your trading community on Telegram
            </p>
            <div className="relative mt-6 flex items-center gap-3 text-[12px] tracking-[0.04em] text-[#a399b9]">
              <span>FOREX</span>
              <span className="size-[3px] rounded-full bg-[#766584]" />
              <span>METALS</span>
              <span className="size-[3px] rounded-full bg-[#766584]" />
              <span>CRYPTO</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
