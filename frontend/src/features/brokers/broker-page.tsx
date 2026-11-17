import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  Check,
  CircleDollarSign,
  Info,
  Send,
  TriangleAlert,
} from 'lucide-react';
import { SiteNavbar } from '@/features/marketing/components/site-navbar';
import { SiteFooter } from '@/features/marketing/components/site-footer';
import {
  CourseDisclaimer,
  CourseFaq,
  EnrollmentSteps,
  courseCard,
  courseSectionTitle,
} from '@/features/marketing/components/course-info';
import { gradientText, home, sectionLabel } from '@/features/marketing/marketing-styles';
import { cn } from '@/lib/cn';
import { telegram, updates, type BrokerPageData, type Broker, type Update } from './data';

const footerLink = 'inline-flex items-center gap-2 font-semibold text-[#d4c8ff] hover:text-white';

const toneStyles: Record<Update['tone'], { tag: string; icon: typeof Info }> = {
  info: { tag: 'border-[#22d3ee33] bg-[#22d3ee12] text-cyan', icon: Info },
  new: { tag: 'border-[#8b5cf655] bg-[#8b5cf61f] text-violet-2', icon: Bell },
  alert: { tag: 'border-[#f59e0b44] bg-[#f59e0b14] text-[#fbbf24]', icon: TriangleAlert },
};

function BrokerCard({ broker }: { broker: Broker }) {
  const isPlaceholder = broker.affiliateUrl.includes('PASTE-YOUR');
  return (
    <article className={cn(courseCard, 'relative flex flex-col gap-5 p-7 max-[560px]:p-5')}>
      {broker.badge && (
        <span className="absolute top-5 right-5 rounded-full border border-[#8b5cf655] bg-[#8b5cf61f] px-3 py-1 font-mono text-[10px] font-bold tracking-[0.12em] text-violet-2 uppercase">
          {broker.badge}
        </span>
      )}
      <div>
        <h3 className="font-display text-[22px] tracking-[-0.02em] text-white">{broker.name}</h3>
        <p className="mt-1 text-[13px] text-violet-2">{broker.tagline}</p>
      </div>
      <p className="text-[13.5px] leading-[1.7] text-[#a09db4]">{broker.description}</p>
      <ul className="grid list-none grid-cols-2 gap-2.5 max-[560px]:grid-cols-1">
        {broker.highlights.map((h) => (
          <li key={h} className="flex items-center gap-2 text-[13px] text-[#dfe2ec]">
            <Check size={15} className="shrink-0 text-cyan" aria-hidden="true" />
            {h}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex items-center justify-between gap-4 border-t border-[#ffffff10] pt-5">
        <span className="inline-flex items-center gap-2 text-[13px] text-[#a09db4]">
          <CircleDollarSign size={16} className="text-cyan" aria-hidden="true" />
          Min deposit <strong className="text-white">{broker.minDeposit}</strong>
        </span>
        <a
          href={broker.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          aria-disabled={isPlaceholder}
          className={cn(
            'inline-flex shrink-0 items-center gap-2 rounded-[11px] bg-[linear-gradient(100deg,#6d28d9,#8b5cf6)] px-5 py-3 text-[14px] font-bold text-white shadow-[0_10px_30px_#8b5cf645] hover:-translate-y-px hover:brightness-110',
            isPlaceholder && 'pointer-events-none opacity-50',
          )}
        >
          Create account <ArrowUpRight size={16} />
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
    <li className={cn(courseCard, 'flex gap-4 p-5')}>
      <span
        className={cn(
          'grid size-10 shrink-0 place-items-center self-start rounded-[10px] border',
          tone.tag,
        )}
      >
        <Icon size={18} aria-hidden="true" />
      </span>
      <div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="font-display text-[16px] tracking-[-0.01em] text-white">{update.title}</h3>
          <span
            className={cn(
              'rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.1em] uppercase',
              tone.tag,
            )}
          >
            {update.tag}
          </span>
          <time className="font-mono text-[11px] text-[#6e6b84]" dateTime={update.date}>
            {date}
          </time>
        </div>
        <p className="mt-1.5 text-[13px] leading-[1.7] text-[#a09db4]">{update.text}</p>
      </div>
    </li>
  );
}

export function BrokerPage({ data }: { data: BrokerPageData }) {
  const otherHref = data.kind === 'binary' ? '/brokers/forex' : '/brokers/binary';
  const otherLabel = data.kind === 'binary' ? 'Forex trading' : 'Binary trading';

  return (
    <div className={home}>
      <SiteNavbar />
      <main className="min-h-screen px-6 pt-[150px] pb-[110px] max-[560px]:px-[18px] max-[560px]:pt-[120px]">
        <div className="mx-auto max-w-[1192px]">
          {/* Hero */}
          <div className="mx-auto mb-[52px] max-w-[760px] text-center">
            <span className={sectionLabel}>
              <span />
              {data.eyebrow}
            </span>
            <h1 className="mt-4 font-display text-[length:clamp(30px,5vw,48px)] leading-[1.08] tracking-[-0.03em] text-white">
              {data.title} <span className={gradientText}>{data.titleAccent}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-[620px] text-[15px] leading-[1.75] text-[#a09db4]">
              {data.intro}
            </p>
            <Link
              href={otherHref}
              className="mt-6 inline-flex items-center gap-2 rounded-[11px] border border-[#ffffff14] bg-[#ffffff08] px-4 py-2.5 text-[13px] font-semibold text-[#d6d3e4] hover:bg-[#ffffff12] hover:text-white"
            >
              Looking for {otherLabel}? <ArrowUpRight size={15} />
            </Link>
          </div>

          {/* Brokers */}
          <section aria-labelledby="brokers">
            <h2 id="brokers" className="sr-only">
              Recommended brokers
            </h2>
            <div className="grid grid-cols-2 gap-5 max-[860px]:grid-cols-1">
              {data.brokers.map((b) => (
                <BrokerCard key={b.name} broker={b} />
              ))}
            </div>
          </section>

          {/* Important updates & information */}
          <section aria-labelledby="updates" className="mt-20 scroll-mt-[120px]" id="updates">
            <div className="mb-6 flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-[10px] border border-[#8b5cf655] bg-[#8b5cf61f] text-violet-2">
                <BadgeCheck size={18} aria-hidden="true" />
              </span>
              <div>
                <span className={sectionLabel}>IMPORTANT UPDATES &amp; INFORMATION</span>
                <h2 id="updates" className={cn(courseSectionTitle, 'mt-1')}>
                  Before you open an account
                </h2>
              </div>
            </div>
            <ul className="grid list-none gap-3">
              {updates.map((u) => (
                <UpdateCard key={u.title} update={u} />
              ))}
            </ul>

            {/* Telegram channel CTA */}
            <a
              href={telegram.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                courseCard,
                'mt-3 flex items-center justify-between gap-4 p-5 hover:-translate-y-px hover:border-[#22d3ee55] max-[560px]:flex-col max-[560px]:text-center',
              )}
            >
              <span className="flex items-center gap-4 max-[560px]:flex-col">
                <span className="grid size-11 shrink-0 place-items-center rounded-[12px] border border-[#22d3ee33] bg-[#22d3ee12] text-cyan">
                  <Send size={20} aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-display text-[16px] tracking-[-0.01em] text-white">
                    Join our Telegram — {telegram.handle}
                  </span>
                  <span className="block text-[13px] text-[#a09db4]">
                    Live updates, signals and announcements before anyone else.
                  </span>
                </span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-[11px] bg-[linear-gradient(100deg,#0e7490,#22d3ee)] px-5 py-3 text-[14px] font-bold text-[#06141a] shadow-[0_10px_30px_#22d3ee33]">
                Join channel <ArrowUpRight size={16} />
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
