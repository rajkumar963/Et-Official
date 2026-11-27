import { Check, Send } from 'lucide-react';
import { telegram as forexTelegram } from '@/features/brokers/data';
import { cn } from '@/lib/cn';
import { forexMasterclass } from '../data/courses';
import { sectionLabel } from '../marketing-styles';
import { CourseArtwork } from './course-artwork';

export function ForexCoursesSection({ className }: { className?: string }) {
  return (
    <section
      id="forex-courses"
      aria-labelledby="forex-courses-heading"
      className={cn('scroll-mt-[110px]', className)}
    >
      <div className="mb-6">
        <span className={cn(sectionLabel, 'text-[#d6b36e]')}>FOREX TRAINING</span>
        <h2
          id="forex-courses-heading"
          className="mt-3 font-display text-[length:clamp(26px,3vw,36px)] leading-[1.2] font-semibold tracking-[-0.035em] text-white"
        >
          A dedicated masterclass for gold.
        </h2>
      </div>
      <article
        id={forexMasterclass.id}
        className="grid scroll-mt-[110px] grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-center overflow-hidden rounded-[20px] border border-[#d6b36e33] bg-[linear-gradient(135deg,#17140f,#0d0e15_70%)] max-[860px]:grid-cols-1"
      >
        <div className="h-full min-w-0 overflow-hidden border-r border-[#d6b36e1a] max-[860px]:border-r-0 max-[860px]:border-b">
          <CourseArtwork
            course={forexMasterclass}
            variant="forex-preview"
            className="aspect-auto h-full min-h-[300px] w-full border-b-0 max-[560px]:min-h-[230px]"
          />
        </div>
        <div className="min-w-0 p-8 max-[560px]:p-6">
          <span className="inline-flex items-center rounded-full border border-[#d6b36e44] bg-[#d6b36e0c] px-3 py-1.5 text-[12px] font-semibold tracking-[0.04em] text-[#e2c58e]">
            Coming Soon
          </span>
          <h3 className="mt-4 font-display text-[length:clamp(26px,3vw,34px)] leading-[1.15] font-semibold tracking-[-0.035em] text-[#f4ecdd]">
            {forexMasterclass.title}
          </h3>
          <p className="mt-3 text-[15px] leading-[1.75] text-[#aaa393]">
            {forexMasterclass.description}
          </p>
          <ul className="mt-5 grid list-none gap-2.5 text-[14px] text-[#d7cebc]">
            {forexMasterclass.topics.map((topic) => (
              <li key={topic} className="flex items-center gap-2.5">
                <Check size={15} className="shrink-0 text-[#d6b36e]" aria-hidden="true" />
                {topic}
              </li>
            ))}
          </ul>
          <a
            href={forexTelegram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-[#d6b36e44] bg-[#d6b36e12] px-5 py-3 text-[14px] font-semibold text-[#e9d3ac] transition-colors hover:bg-[#d6b36e24] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d6b36e] max-[560px]:w-full"
          >
            <Send size={16} aria-hidden="true" />
            Get launch updates on Telegram
          </a>
          <p className="mt-3 text-[12px] leading-relaxed text-[#8c8272]">
            Enrollment is not open yet. No payment is required.
          </p>
        </div>
      </article>
    </section>
  );
}
