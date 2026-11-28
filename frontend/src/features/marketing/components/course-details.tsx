import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, ChevronDown, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/cn';
import { sectionLabel } from '../marketing-styles';
import type { Course } from '../data/courses';
import { CourseOffer } from './course-offer';
import { CourseArtwork } from './course-artwork';
import {
  CourseDisclaimer,
  CourseFaq,
  CourseIncludes,
  CourseStartDate,
  EnrollmentSteps,
  courseCard,
  courseSectionTitle,
} from './course-info';
import { CoursesSection } from './learning-sections';

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="scroll-mt-[110px]">
      <h2 id={id} className={courseSectionTitle}>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function PurchaseCard({ course }: { course: Course }) {
  return (
    <aside
      className={cn(
        courseCard,
        'overflow-hidden min-[1021px]:sticky min-[1021px]:top-[110px]',
        course.bestValue && 'border-[#22d3ee66]',
      )}
      aria-label="Enroll in this course"
    >
      <CourseArtwork course={course} variant="purchase" />
      <div className="p-6 max-[560px]:p-5">
        <CourseOffer productId={course.id} variant="purchase" />
        <Link
          href="/contact?topic=courses"
          className="mt-3 flex items-center justify-center gap-2 text-[12px] font-semibold text-[#d4c8ff] hover:text-white"
        >
          <MessageCircle size={15} /> Have a question first? Contact us
        </Link>
        <div className="mt-6 border-t border-[#ffffff10] pt-5">
          <p className="mb-4 font-mono text-[10px] font-bold tracking-[0.14em] text-[#8f8ca5]">
            THIS COURSE INCLUDES
          </p>
          <CourseIncludes />
        </div>
        <p className="mt-5 rounded-[10px] border border-[#ffffff0f] bg-[#ffffff05] px-3.5 py-3 text-[11px] leading-[1.6] text-[#8f8ca5]">
          Pay in USDT on TRC20, BEP20 or ERC20. Every payment is verified by our team; once
          approved, the course is shared to your Gmail and appears in My courses.
        </p>
      </div>
    </aside>
  );
}

export function CourseDetails({ course }: { course: Course }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[12px] text-[#8f8ca5]">
        <Link href="/courses" className="inline-flex items-center gap-1.5 hover:text-white">
          <ArrowLeft size={14} /> All courses
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-[#d4d1e2]" aria-current="page">
          {course.title}
        </span>
      </nav>

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)_380px] items-start gap-x-12 gap-y-10 max-[1020px]:grid-cols-1">
        {/* Hero (column 1, row 1) */}
        <header className="min-w-0 min-[1021px]:col-start-1">
          <span className={sectionLabel}>{course.level} · TRADING COURSE</span>
          <h1 className="mt-4 font-display text-[length:clamp(36px,5vw,58px)] leading-[1.04] tracking-[-0.045em] text-white">
            {course.title}
          </h1>
          <p className="mt-4 max-w-[620px] text-[17px] leading-[1.65] text-[#b3b0c6]">
            {course.tagline}
          </p>
          <CourseStartDate date={course.startDate} />
          <ul className="mt-6 flex list-none flex-wrap gap-2">
            {course.topics.map((topic) => (
              <li
                key={topic}
                className="rounded-full border border-[#8b5cf640] bg-[#8b5cf614] px-3 py-1.5 text-[12px] font-semibold text-[#ddd3ff]"
              >
                {topic}
              </li>
            ))}
          </ul>
        </header>

        {/* Purchase card: right column spanning both rows on desktop, directly under the hero on mobile. */}
        <div className="min-w-0 min-[1021px]:col-start-2 min-[1021px]:row-span-2 min-[1021px]:row-start-1 min-[1021px]:self-stretch">
          <PurchaseCard course={course} />
        </div>

        {/* Details (column 1, row 2) */}
        <div className="grid min-w-0 gap-14 min-[1021px]:col-start-1">
          <Section id="overview" title="About this course">
            <div className="grid gap-4 text-[15px] leading-[1.75] text-[#a9a6bd]">
              {course.overview.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Section>

          <Section id="outcomes" title="What you'll learn">
            <ul
              className={cn(
                courseCard,
                'grid list-none grid-cols-2 gap-4 p-6 max-[700px]:grid-cols-1',
              )}
            >
              {course.outcomes.map((outcome) => (
                <li key={outcome} className="flex gap-3 text-[14px] leading-[1.55] text-[#dfe2ec]">
                  <Check size={18} className="mt-0.5 shrink-0 text-gain" aria-hidden="true" />
                  {outcome}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="curriculum" title="Course curriculum">
            <p className="-mt-2 mb-4 text-[13px] text-[#8f8ca5]">
              {course.modules.length} modules · recorded video lessons
            </p>
            <ol className="grid list-none gap-3">
              {course.modules.map((module, index) => (
                <li key={module.title}>
                  <details
                    open={index === 0}
                    className="group rounded-[14px] border border-[#ffffff12] bg-[#0b0d14] transition-colors open:border-[#8b5cf655]"
                  >
                    <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                      <span className="grid size-10 shrink-0 place-items-center rounded-[10px] border border-[#8b5cf644] bg-[#8b5cf61a] font-mono text-[12px] font-bold text-violet-3">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-[16px] tracking-[-0.01em] text-white">
                          {module.title}
                        </span>
                        <span className="mt-0.5 block text-[12.5px] leading-[1.5] text-[#8f8ca5]">
                          {module.summary}
                        </span>
                      </span>
                      <ChevronDown
                        size={18}
                        className="shrink-0 text-violet-2 transition-transform duration-200 group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </summary>
                    <ul className="grid list-none gap-2.5 border-t border-[#ffffff0d] px-5 py-4 pl-[76px] max-[560px]:pl-5">
                      {module.points.map((point) => (
                        <li
                          key={point}
                          className="relative pl-4 text-[13.5px] leading-[1.6] text-[#c9c6d8] before:absolute before:top-[0.6em] before:left-0 before:size-[5px] before:rounded-full before:bg-violet before:content-['']"
                        >
                          {point}
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))}
            </ol>
          </Section>

          <div className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
            <section aria-labelledby="audience" className={cn(courseCard, 'p-6')}>
              <h2 id="audience" className="font-display text-[19px] tracking-[-0.02em] text-white">
                Who this course is for
              </h2>
              <ul className="mt-4 grid list-none gap-3">
                {course.audience.map((item) => (
                  <li key={item} className="flex gap-3 text-[13.5px] leading-[1.55] text-[#c9c6d8]">
                    <Check size={16} className="mt-0.5 shrink-0 text-violet-2" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
            <section aria-labelledby="requirements" className={cn(courseCard, 'p-6')}>
              <h2
                id="requirements"
                className="font-display text-[19px] tracking-[-0.02em] text-white"
              >
                Before you start
              </h2>
              <ul className="mt-4 grid list-none gap-3">
                {course.requirements.map((item) => (
                  <li key={item} className="flex gap-3 text-[13.5px] leading-[1.55] text-[#c9c6d8]">
                    <Check size={16} className="mt-0.5 shrink-0 text-cyan" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <Section id="enrollment" title="How enrollment works">
            <EnrollmentSteps />
          </Section>

          <Section id="faq" title="Frequently asked questions">
            <CourseFaq />
          </Section>
        </div>
      </div>

      <section aria-labelledby="more-courses" className="mt-24">
        <h2 id="more-courses" className={cn(courseSectionTitle, 'mb-6 text-center')}>
          Explore the other course
        </h2>
        <CoursesSection
          exclude={course.id}
          showNote={false}
          className="mx-auto max-w-[790px] grid-cols-2"
        />
      </section>

      <CourseDisclaimer className="mt-12" />
    </>
  );
}
