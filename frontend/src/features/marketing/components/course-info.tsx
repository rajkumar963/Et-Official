import {
  CalendarDays,
  ChevronDown,
  FolderOpen,
  Infinity as InfinityIcon,
  Languages,
  MonitorPlay,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { courseFaqs, courseIncludes, enrollmentSteps } from '../data/courses';

/** Dark card used across the course pages. */
export const courseCard =
  'rounded-[16px] border border-[#ffffff12] bg-[linear-gradient(160deg,#0d1018_0%,#090b11_70%)] shadow-[0_18px_55px_#0005]';

/** Heading for a section on the course pages. */
export const courseSectionTitle =
  'font-display text-[length:clamp(22px,2.4vw,28px)] leading-[1.2] tracking-[-0.03em] text-white';

const includeIcons = [MonitorPlay, InfinityIcon, Languages, FolderOpen];

export function CourseStartDate({ date }: { date: string }) {
  const label = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
  return (
    <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#a78bfa33] bg-[#8b5cf60c] px-3 py-2 text-[13px] leading-[1.5] text-[#c4b5e4]">
      <CalendarDays size={16} className="shrink-0 text-violet-2" aria-hidden="true" />
      <span>
        Course starts on{' '}
        <time dateTime={date} className="font-semibold text-[#e4d8fb]">
          {label}
        </time>
      </span>
    </p>
  );
}

/** "Every course includes" list with icons. */
export function CourseIncludes({
  items = courseIncludes,
  icons = includeIcons,
  className,
}: {
  items?: string[];
  icons?: LucideIcon[];
  className?: string;
}) {
  return (
    <ul className={cn('grid list-none gap-3', className)}>
      {items.map((item, index) => {
        const Icon = icons[index] ?? icons[0];
        return (
          <li key={item} className="flex items-center gap-3 text-[13px] text-[#dfe2ec]">
            <span className="grid size-8 shrink-0 place-items-center rounded-[9px] border border-[#22d3ee33] bg-[#22d3ee12] text-cyan">
              <Icon size={15} aria-hidden="true" />
            </span>
            {item}
          </li>
        );
      })}
    </ul>
  );
}

/** The three steps a buyer goes through today. */
export function EnrollmentSteps({
  steps = enrollmentSteps,
}: {
  steps?: { title: string; text: string }[];
}) {
  return (
    <ol className="grid list-none grid-cols-3 gap-4 max-[860px]:grid-cols-1">
      {steps.map((step, index) => (
        <li key={step.title} className={cn(courseCard, 'relative p-6')}>
          <span className="font-mono text-[11px] font-bold tracking-[0.14em] text-violet-2">
            STEP {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className="mt-2.5 font-display text-[18px] tracking-[-0.02em] text-white">
            {step.title}
          </h3>
          <p className="mt-2 text-[13px] leading-[1.7] text-[#a09db4]">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}

/** Frequently asked questions as native, keyboard-accessible disclosure widgets. */
export function CourseFaq({
  faqs = courseFaqs,
}: {
  faqs?: { question: string; answer: string }[];
}) {
  return (
    <div className="grid gap-3">
      {faqs.map((faq) => (
        <details
          key={faq.question}
          className="group rounded-[14px] border border-[#ffffff12] bg-[#0b0d14] transition-colors open:border-[#8b5cf655]"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[14px] font-semibold text-[#ece9f6] hover:text-white [&::-webkit-details-marker]:hidden">
            {faq.question}
            <ChevronDown
              size={18}
              className="shrink-0 text-violet-2 transition-transform duration-200 group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <p className="px-5 pb-5 text-[13px] leading-[1.75] text-[#a09db4]">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}

/** Educational-content disclaimer shown under course listings. */
export function CourseDisclaimer({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        'mx-auto max-w-[720px] text-center text-[12px] leading-[1.7] text-[#77748c]',
        className,
      )}
    >
      These materials are for general education and reflection, not personalized financial advice or
      a promise of trading results. Trading involves risk; only trade money you can afford to lose.
    </p>
  );
}
