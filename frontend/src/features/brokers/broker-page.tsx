import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Binary,
  Bell,
  Check,
  Info,
  LineChart,
  Send,
  TriangleAlert,
} from 'lucide-react';
import { SiteNavbar } from '@/features/marketing/components/site-navbar';
import { SiteFooter } from '@/features/marketing/components/site-footer';
import {
  CourseDisclaimer,
  CourseFaq,
  EnrollmentSteps,
  courseSectionTitle,
} from '@/features/marketing/components/course-info';
import { gradientText, home, sectionLabel } from '@/features/marketing/marketing-styles';
import { cn } from '@/lib/cn';
import { binaryTelegram, telegram, updates, type BrokerPageData, type Broker, type Update } from './data';

const footerLink = 'inline-flex items-center gap-2 font-semibold text-[#d4c8ff] hover:text-white';

const toneStyles: Record<Update['tone'], { tag: string; icon: typeof Info }> = {
  info: { tag: 'border-[#22d3ee33] bg-[#22d3ee12] text-cyan', icon: Info },
  new: { tag: 'border-[#8b5cf655] bg-[#8b5cf61f] text-violet-2', icon: Bell },
  alert: { tag: 'border-[#f59e0b44] bg-[#f59e0b14] text-[#fbbf24]', icon: TriangleAlert },
};

function BrokerCard({ broker, kind }: { broker: Broker; kind: BrokerPageData['kind'] }) {
  const isPlaceholder = broker.affiliateUrl.includes('PASTE-YOUR');
  const PlatformIcon = kind === 'binary' ? Binary : LineChart;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-[#ffffff12] bg-[linear-gradient(145deg,#171521,#0d0c14_68%)] p-7 shadow-[0_18px_55px_#0000002e,inset_0_1px_0_#ffffff0b] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-[#8b5cf655] hover:shadow-[0_24px_60px_#00000055,0_0_36px_#8b5cf610] max-[560px]:p-5">
      <div className="pointer-events-none absolute -top-24 -right-16 size-56 rounded-full bg-[#8b5cf610] blur-3xl transition-colors group-hover:bg-[#8b5cf61c]" />
      <div className="relative flex items-start justify-between gap-4">
        <span className="grid size-12 place-items-center rounded-[15px] border border-[#8b5cf644] bg-[linear-gradient(145deg,#8b5cf626,#22d3ee0c)] text-violet-2 shadow-[inset_0_1px_0_#ffffff12]">
          <PlatformIcon size={22} aria-hidden="true" />
        </span>
        {broker.badge && (
          <span className="rounded-full border border-[#8b5cf644] bg-[#8b5cf61a] px-3 py-1.5 font-mono text-[9px] font-bold tracking-[0.12em] text-violet-2 uppercase">
            {broker.badge}
          </span>
        )}
      </div>
      <div className="relative mt-5">
        <h3 className="font-display text-[24px] font-semibold tracking-[-0.03em] text-white">{broker.name}</h3>
        <p className="mt-1 text-[13px] font-medium text-cyan">{broker.tagline}</p>
      </div>
      <p className="relative mt-4 text-[13.5px] leading-[1.75] text-[#a09db4]">{broker.description}</p>
      <ul className="relative mt-5 grid list-none grid-cols-2 gap-2 max-[560px]:grid-cols-1">
        {broker.highlights.map((h) => (
          <li key={h} className="flex min-h-10 items-center gap-2 rounded-[11px] border border-[#ffffff0a] bg-[#ffffff04] px-3 py-2 text-[12px] text-[#d8d5e4]">
            <Check size={14} className="shrink-0 text-cyan" aria-hidden="true" />
            {h}
          </li>
        ))}
      </ul>
      <div className="relative mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-[#ffffff10] pt-5">
        <span className="inline-flex items-center gap-2 text-[12px] text-[#858197]">
          Minimum deposit <strong className="text-[14px] text-white">{broker.minDeposit}</strong>
        </span>
        <a
          href={broker.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          aria-disabled={isPlaceholder}
          className={cn(
            'inline-flex shrink-0 items-center gap-2 rounded-[11px] bg-[linear-gradient(110deg,#6d28d9,#8b5cf6)] px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_24px_#8b5cf633] transition hover:-translate-y-px hover:brightness-110',
            isPlaceholder && 'pointer-events-none opacity-50',
          )}
        >
          Visit broker <ArrowUpRight size={15} />
        </a>
      </div>
      {isPlaceholder && (
        <p className="font-mono text-[10.5px] tracking-[0.08em] text-[#f59e0b]">
          ⚠ Add your affiliate link in features/brokers/data.ts
        </p>
      )}
    </article>
  );
}

function UpdateCard({ update }: { update: Update }) {
  const tone = toneStyles[update.tone];
  const Icon = tone.icon;
  const date = new Date(update.date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return (
    <li className="group rounded-[18px] border border-[#ffffff10] bg-[linear-gradient(145deg,#14131d,#0c0b12)] p-5 transition-colors hover:border-[#ffffff20] max-[560px]:p-4">
      <div className="flex items-center justify-between gap-3">
        <span className={cn('grid size-10 place-items-center rounded-[12px] border', tone.tag)}>
          <Icon size={17} aria-hidden="true" />
        </span>
        <span className={cn('rounded-full border px-2.5 py-1 font-mono text-[9px] font-bold tracking-[0.1em] uppercase', tone.tag)}>
          {update.tag}
        </span>
      </div>
      <h3 className="mt-5 font-display text-[16px] font-semibold leading-snug tracking-[-0.02em] text-white">
        {update.title}
      </h3>
      <p className="mt-2 text-[12.5px] leading-[1.7] text-[#9b98ad]">{update.text}</p>
      <time className="mt-5 block border-t border-[#ffffff0c] pt-3 font-mono text-[10px] tracking-[0.08em] text-[#706d83] uppercase" dateTime={update.date}>
        {date}
      </time>
    </li>
  );
}

export function BrokerPage({ data }: { data: BrokerPageData }) {
  const otherHref = data.kind === 'binary' ? '/brokers/forex' : '/brokers/binary';
  const otherLabel = data.kind === 'binary' ? 'Forex trading' : 'Binary trading';
  const telegramChannel = data.kind === 'binary' ? binaryTelegram : telegram;

  return (
    <div className={home}>
      <SiteNavbar />
      <main className="min-h-screen px-6 pt-[150px] pb-[110px] max-[560px]:px-[18px] max-[560px]:pt-[120px]">
        <div className="mx-auto max-w-[1192px]">
          {/* Hero */}
          <div className="relative mx-auto mb-14 max-w-[940px] overflow-hidden rounded-[30px] border border-[#ffffff10] bg-[radial-gradient(60%_130%_at_50%_0%,#8b5cf61a,transparent_72%),linear-gradient(145deg,#12111a,#0a0910)] px-8 py-10 text-center shadow-[0_24px_70px_#00000035,inset_0_1px_0_#ffffff08] max-[560px]:rounded-[22px] max-[560px]:px-5 max-[560px]:py-8">
            <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#8b5cf644] bg-[#8b5cf614] px-3.5 py-1.5 font-mono text-[10px] font-semibold tracking-[0.14em] text-violet-2 uppercase">
              {data.kind === 'binary' ? <Binary size={13} aria-hidden="true" /> : <LineChart size={13} aria-hidden="true" />}
              {data.eyebrow} | ACCOUNTS &amp; UPDATES
            </span>
            <h1 className="mx-auto mt-5 max-w-[760px] font-display text-[length:clamp(32px,5vw,52px)] leading-[1.06] font-semibold tracking-[-0.045em] text-white">
              {data.title} <span className={gradientText}>{data.titleAccent}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-[650px] text-[14px] leading-[1.8] text-[#a09db4]">
              {data.intro}
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#22d3ee24] bg-[#22d3ee0c] px-3.5 py-2 text-[11px] font-medium text-[#c5f5fa]">
                <Check size={14} className="text-cyan" /> Partner details
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#ffffff12] bg-[#ffffff05] px-3.5 py-2 text-[11px] font-medium text-[#d0cddd]">
                <BadgeCheck size={14} className="text-violet-2" /> Risk notes included
              </span>
              <a href="#updates" className="inline-flex items-center gap-2 rounded-full border border-[#ffffff12] bg-[#ffffff05] px-3.5 py-2 text-[11px] font-medium text-[#d0cddd] transition hover:border-[#8b5cf655] hover:text-white">
                Latest updates <ArrowUpRight size={13} />
              </a>
            </div>
            <Link
              href={otherHref}
              className="mt-6 inline-flex items-center gap-2 text-[12px] font-medium text-[#918da3] transition hover:text-violet-2"
            >
              Looking for {otherLabel}? <ArrowUpRight size={15} />
            </Link>
          </div>

          {/* Brokers */}
          <section aria-labelledby="brokers" className="scroll-mt-[120px]">
            <div className="mb-6 flex items-end justify-between gap-5 max-[640px]:items-start max-[640px]:flex-col">
              <div>
                <span className={sectionLabel}>COMPARE YOUR OPTIONS</span>
                <h2 id="brokers" className={cn(courseSectionTitle, 'mt-2')}>
                  Recommended accounts
                </h2>
              </div>
              <span className="max-w-[360px] text-[12px] leading-relaxed text-[#858197] max-[640px]:max-w-none">
                Review each platform and its terms before creating an account.
              </span>
            </div>
            <div className="grid grid-cols-2 items-stretch gap-5 max-[860px]:grid-cols-1">
              {data.brokers.map((b) => (
                <BrokerCard key={b.name} broker={b} kind={data.kind} />
              ))}
            </div>
          </section>

          {/* Important updates & information */}
          <section aria-labelledby="updates-title" className="mt-20 scroll-mt-[120px]" id="updates">
            <div className="mb-6 flex items-end justify-between gap-5 max-[640px]:items-start max-[640px]:flex-col">
              <div>
                <span className={sectionLabel}>STAY INFORMED</span>
                <h2 id="updates-title" className={cn(courseSectionTitle, 'mt-2')}>
                  Updates &amp; trading notes
                </h2>
              </div>
              <p className="max-w-[370px] text-[12px] leading-relaxed text-[#858197] max-[640px]:max-w-none">
                A quick read before you sign up or fund an account.
              </p>
            </div>
            <ul className="grid list-none grid-cols-3 gap-4 max-[860px]:grid-cols-2 max-[560px]:grid-cols-1">
              {updates.map((u) => (
                <UpdateCard key={u.title} update={u} />
              ))}
            </ul>

            {/* Telegram channel CTA */}
            <a
              href={telegramChannel.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'mt-5 flex items-center justify-between gap-5 rounded-[20px] border border-[#22d3ee24] bg-[radial-gradient(80%_130%_at_0%_50%,#22d3ee12,transparent_60%),linear-gradient(120deg,#11131a,#0c0b12)] p-5 shadow-[inset_0_1px_0_#ffffff08] transition hover:border-[#22d3ee55] max-[560px]:flex-col max-[560px]:text-center',
              )}
            >
              <span className="flex items-center gap-4 max-[560px]:flex-col">
                <span className="grid size-12 shrink-0 place-items-center rounded-[15px] border border-[#22d3ee33] bg-[#22d3ee12] text-cyan shadow-[0_0_25px_#22d3ee12]">
                  <Send size={19} aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-display text-[16px] tracking-[-0.01em] text-white">
                    Join the Telegram channel - {telegramChannel.handle}
                  </span>
                  <span className="block text-[13px] text-[#a09db4]">
                    Follow channel updates and announcements.
                  </span>
                </span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-[11px] bg-[linear-gradient(100deg,#0e7490,#22d3ee)] px-5 py-3 text-[13px] font-bold text-[#06141a] shadow-[0_10px_30px_#22d3ee33]">
                Join channel <ArrowUpRight size={15} />
              </span>
            </a>
          </section>

          {/* How to open */}
          <section aria-labelledby="how" className="mt-20">
            <h2 id="how" className={cn(courseSectionTitle, 'mb-6 text-center')}>
              How to open your account
            </h2>
            <EnrollmentSteps steps={data.steps} />
          </section>

          {/* FAQ */}
          <section aria-labelledby="faq" className="mx-auto mt-20 max-w-[820px]">
            <h2 id="faq" className={cn(courseSectionTitle, 'mb-6 text-center')}>
              Frequently asked questions
            </h2>
            <CourseFaq faqs={data.faqs} />
          </section>

          <CourseDisclaimer className="mt-14" />
          <div className="mt-[44px] flex flex-wrap justify-center gap-[22px]">
            <Link href="/" className={footerLink}>
              <ArrowLeft size={16} /> Back to home
            </Link>
            <Link href="/contact?topic=brokers" className={footerLink}>
              Ask a question <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
