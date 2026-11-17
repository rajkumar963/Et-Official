import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, ChartLine, Download, FileText, Smartphone } from 'lucide-react';
import { SiteNavbar } from '@/features/marketing/components/site-navbar';
import { SiteFooter } from '@/features/marketing/components/site-footer';
import { EbooksSection, learningIntro } from '@/features/marketing/components/learning-sections';
import {
  CourseDisclaimer,
  CourseFaq,
  CourseIncludes,
  EnrollmentSteps,
  courseCard,
  courseSectionTitle,
} from '@/features/marketing/components/course-info';
import { ebookFaqs, ebookIncludes, ebookSteps } from '@/features/marketing/data/ebooks';
import { gradientText, home, sectionLabel } from '@/features/marketing/marketing-styles';
import { cn } from '@/lib/cn';

export const metadata: Metadata = {
  title: 'Trading E-books',
  description:
    'Trading e-books on price action patterns, candlestick and chart patterns (Hindi edition) and a complete gold (XAUUSD) strategy guide.',
};

const footerLink = 'inline-flex items-center gap-2 font-semibold text-[#d4c8ff] hover:text-white';

export default function EbooksPage() {
  return (
    <div className={home}>
      <SiteNavbar />
      <main className="min-h-screen px-6 pt-[150px] pb-[110px] max-[560px]:px-[18px] max-[560px]:pt-[120px]">
        <div className="mx-auto max-w-[1192px]">
          <div className={cn(learningIntro, 'mb-[52px]')}>
            <span className={sectionLabel}>TRADING E-BOOKS</span>
            <h1>
              Learn the patterns. <span className={gradientText}>Keep the playbook.</span>
            </h1>
            <p>
              Focused guides on price action, candlestick and chart patterns, and gold strategy — as
              a personalized PDF you can read anywhere and come back to before every session.
            </p>
          </div>

          <EbooksSection />

          <section
            aria-labelledby="includes"
            className={cn(
              courseCard,
              'mt-20 grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] items-center gap-10 p-9 max-[860px]:grid-cols-1 max-[560px]:p-6',
            )}
          >
            <div>
              <span className={sectionLabel}>EVERY E-BOOK</span>
              <h2 id="includes" className={cn(courseSectionTitle, 'mt-3')}>
                What you get with each e-book
              </h2>
              <p className="mt-3 text-[14px] leading-[1.7] text-[#a09db4]">
                A reference you can keep open next to your charts: clear rules, worked chart
                examples and risk management in one place.
              </p>
            </div>
            <CourseIncludes
              items={ebookIncludes}
              icons={[FileText, Smartphone, Download, ChartLine]}
              className="grid-cols-2 max-[560px]:grid-cols-1"
            />
          </section>

          <section aria-labelledby="how-it-works" className="mt-20">
            <h2 id="how-it-works" className={cn(courseSectionTitle, 'mb-6 text-center')}>
              How to get your e-book
            </h2>
            <EnrollmentSteps steps={ebookSteps} />
          </section>

          <section aria-labelledby="faq" className="mx-auto mt-20 max-w-[820px]">
            <h2 id="faq" className={cn(courseSectionTitle, 'mb-6 text-center')}>
              Frequently asked questions
            </h2>
            <CourseFaq faqs={ebookFaqs} />
          </section>

          <section
            className={cn(
              courseCard,
              'mt-20 flex items-center justify-between gap-6 p-8 max-[700px]:flex-col max-[700px]:text-center',
            )}
          >
            <div>
              <h2 className={courseSectionTitle}>Want to go deeper?</h2>
              <p className="mt-2 text-[14px] leading-[1.7] text-[#a09db4]">
                Our trading courses cover chart reading, market behavior, and advanced tools.
              </p>
            </div>
            <Link
              href="/courses"
              className="inline-flex shrink-0 items-center gap-2 rounded-[11px] bg-[linear-gradient(100deg,#6d28d9,#8b5cf6)] px-5 py-3 text-[14px] font-bold text-white shadow-[0_10px_30px_#8b5cf645] hover:-translate-y-px hover:brightness-110"
            >
              Browse the courses <ArrowUpRight size={16} />
            </Link>
          </section>

          <CourseDisclaimer className="mt-14" />
          <div className="mt-[44px] flex flex-wrap justify-center gap-[22px]">
            <Link href="/" className={footerLink}>
              <ArrowLeft size={16} /> Back to home
            </Link>
            <Link href="/contact?topic=ebooks" className={footerLink}>
              Ask about an e-book <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
