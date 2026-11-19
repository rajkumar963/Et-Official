import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Mail, MapPin, MessageCircle, Send, Youtube } from 'lucide-react';
import { SiteNavbar } from '@/features/marketing/components/site-navbar';
import { SiteFooter } from '@/features/marketing/components/site-footer';
import { ContactForm } from '@/features/marketing/components/contact-form';
import { contactCard } from '@/features/marketing/components/contact-styles';
import { gradientText, home, sectionLabel } from '@/features/marketing/marketing-styles';
import { contactChannels } from '@/config/site';
import { getCourse } from '@/features/marketing/data/courses';
import { getEbook } from '@/features/marketing/data/ebooks';
import { cn } from '@/lib/cn';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Contact ET Official about the trading journal, courses, or e-books.',
};

const channels = [
  { key: 'telegramCommunity', label: 'Telegram Community', icon: Send, external: true, size: 18 },
  { key: 'telegramPersonal', label: 'Telegram', icon: Send, external: true, size: 18 },
  { key: 'youtube', label: 'YouTube', icon: Youtube, external: true, size: 19 },
  { key: 'email', label: 'Email', icon: Mail, external: false, size: 19 },
] as const;

const topics = { journal: 'Journal support', courses: 'Courses', ebooks: 'E-books' } as const;

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = await searchParams;
  const topicKey = typeof query.topic === 'string' ? query.topic : '';
  const course = typeof query.course === 'string' ? getCourse(query.course) : undefined;
  const ebook = typeof query.ebook === 'string' ? getEbook(query.ebook) : undefined;
  const defaultTopic = course
    ? topics.courses
    : ebook
      ? topics.ebooks
      : (topics[topicKey as keyof typeof topics] ?? topics.journal);
  const defaultMessage = course
    ? `Hi, I'd like to enroll in the ${course.title} (${course.price} USDT). Please send me the USDT payment details.

Gmail address for Google Drive access: `
    : ebook
      ? `Hi, I'd like to buy the e-book "${ebook.title}" (${ebook.price} USDT). Please send me the USDT payment details.`
      : '';

  return (
    <div className={home}>
      <SiteNavbar />
      <main className="min-h-screen px-6 pt-[132px] pb-[100px] max-[560px]:px-[18px] max-[560px]:pt-[116px] max-[560px]:pb-[70px]">
        <div className="mx-auto max-w-[1120px]">
          <Link
            href="/"
            className="inline-flex items-center gap-[7px] text-[12px] text-[#aaa6bf] hover:text-white"
          >
            <ArrowLeft size={15} /> Back to home
          </Link>
          <div className="mx-auto mt-[34px] mb-12 max-w-[720px] text-center max-[560px]:mt-7 max-[560px]:mb-[34px]">
            <span className={sectionLabel}>GET IN TOUCH</span>
            <h1 className="mt-[15px] font-display text-[length:clamp(36px,6vw,62px)] leading-[1.05] tracking-[-0.05em]">
              We&apos;re here for <span className={gradientText}>your questions.</span>
            </h1>
            <p className="mx-auto mt-[17px] max-w-[570px] text-[15px] leading-[1.7] text-[#a09db4] max-[560px]:text-[13px]">
              Send us a note about the journal, a course, or an e-book. Choose a topic and tell us
              what you need help with.
            </p>
          </div>
          <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-stretch gap-5 max-[820px]:grid-cols-1">
            <aside className={cn(contactCard, 'flex flex-col p-[30px] max-[820px]:p-6')}>
              <span className="font-mono text-[10px] leading-[normal] font-bold tracking-[0.14em] text-cyan">
                CONTACT CHANNELS
              </span>
              <h2 className="mt-4 font-display text-[26px] leading-[1.2] tracking-[-0.035em]">
                Choose the way that works best for you.
              </h2>
              <div className="mt-[23px] grid gap-[11px]">
                {channels.map(({ key, label, icon: Icon, external, size }) => (
                  <a
                    key={key}
                    className="flex min-h-[72px] items-center gap-[14px] rounded-[14px] border border-[#ffffff12] bg-[#090b13b8] px-[13px] py-[11px] [transition:border-color_0.2s,background_0.2s,translate_0.2s] hover:-translate-y-px hover:border-[#8b5cf688] hover:bg-[#11101d]"
                    href={contactChannels[key].href}
                    {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  >
                    <span className="grid size-12 flex-none place-items-center rounded-[13px] border border-[#8b5cf655] bg-[#8b5cf61c] text-violet-3">
                      <Icon size={size} />
                    </span>
                    <span className="grid min-w-0 gap-1">
                      <small className="text-[12px] text-[#9c98b2]">{label}</small>
                      <strong className="text-[14px] font-bold wrap-anywhere text-[#f5f3fa]">
                        {contactChannels[key].label}
                      </strong>
                    </span>
                  </a>
                ))}
              </div>
              <div className="mt-auto flex items-start gap-[9px] pt-[26px] text-[10px] leading-[1.5] text-[#8f8ca5] max-[820px]:mt-6 [&_svg]:flex-none [&_svg]:text-cyan">
                <MessageCircle size={17} />
                <span>Use the form to send a message or contact us through any channel above.</span>
              </div>
            </aside>
            <ContactForm defaultTopic={defaultTopic} defaultMessage={defaultMessage} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
