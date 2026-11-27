import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { SiteNavbar } from '@/features/marketing/components/site-navbar';
import { SiteFooter } from '@/features/marketing/components/site-footer';
import { CoursesSection, learningIntro } from '@/features/marketing/components/learning-sections';
import { ForexCoursesSection } from '@/features/marketing/components/forex-courses-section';
import {
  CourseDisclaimer,
  CourseFaq,
  CourseIncludes,
  EnrollmentSteps,
  courseCard,
  courseSectionTitle,
} from '@/features/marketing/components/course-info';
import { courseFaqs } from '@/features/marketing/data/courses';
import { gradientText, home, sectionLabel } from '@/features/marketing/marketing-styles';
import { cn } from '@/lib/cn';

export const metadata: Metadata = {
  title: 'Trading Courses',
  description:
    'Explore Binary ET Strategies, Basic to Advanced Binary Trading, and the upcoming Forex Gold Masterclass.',
  alternates: { canonical: '/courses' },
};

const footerLink = 'inline-flex items-center gap-2 font-semibold text-[#d4c8ff] hover:text-white';

/** FAQ structured data — lets Google show these answers directly in search results. */
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: courseFaqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: { '@type': 'Answer', text: faq.answer },
  })),
};

export default function CoursesPage() {
  return (
    <div className={home}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <SiteNavbar />
      <main className="min-h-screen px-6 pt-[150px] pb-[110px] max-[560px]:px-[18px] max-[560px]:pt-[120px]">
        <div className="mx-auto max-w-[1192px]">
          <div className={cn(learningIntro, 'mb-[52px]')}>
            <span className={sectionLabel}>TRADING VIDEO COURSES</span>
            <h1>
              Binary strategies. <span className={gradientText}>Forex focus.</span>
            </h1>
            <p>
              Explore Binary ET Strategies and Basic to Advanced Binary Trading, with lifetime
              access to recorded lessons. Our Forex Gold Masterclass is coming soon.
            </p>
          </div>

          <section aria-labelledby="binary-courses-heading">
            <h2 id="binary-courses-heading" className={cn(courseSectionTitle, 'mb-6')}>
              Binary trading courses
            </h2>
            <CoursesSection />
          </section>
          <ForexCoursesSection className="mt-16" />

          <section
            aria-labelledby="includes"
            className={cn(
              courseCard,
              'mt-20 grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] items-center gap-10 p-9 max-[860px]:grid-cols-1 max-[560px]:p-6',
            )}
          >
            <div>
              <span className={sectionLabel}>BINARY COURSES</span>
              <h2 id="includes" className={cn(courseSectionTitle, 'mt-3')}>
                What you get with each course
              </h2>
              <p className="mt-3 text-[14px] leading-[1.7] text-[#a09db4]">
                Each course is a complete set of recorded lessons you keep. Watch at your own pace
                and come back to any lesson whenever you need it.
              </p>
            </div>
            <CourseIncludes className="grid-cols-2 max-[560px]:grid-cols-1" />
          </section>

          <section aria-labelledby="how-it-works" className="mt-20">
            <h2 id="how-it-works" className={cn(courseSectionTitle, 'mb-6 text-center')}>
              How enrollment works
            </h2>
            <EnrollmentSteps />
          </section>

          <section aria-labelledby="faq" className="mx-auto mt-20 max-w-[820px]">
            <h2 id="faq" className={cn(courseSectionTitle, 'mb-6 text-center')}>
              Frequently asked questions
            </h2>
            <CourseFaq />
          </section>

          <CourseDisclaimer className="mt-14" />
          <div className="mt-[44px] flex flex-wrap justify-center gap-[22px]">
            <Link href="/" className={footerLink}>
              <ArrowLeft size={16} /> Back to home
            </Link>
            <Link href="/contact?topic=courses" className={footerLink}>
              Ask about a course <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
