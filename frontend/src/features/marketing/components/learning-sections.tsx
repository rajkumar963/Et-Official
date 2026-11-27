import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  FolderOpen,
  Infinity as InfinityIcon,
  Languages,
  MonitorPlay,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { courses } from '../data/courses';
import { courseDetailsHref, enrollHref } from '../enroll';
import { CourseArtwork } from './course-artwork';
import { ebooks } from '../data/ebooks';
import { EbookArtwork } from './ebook-artwork';

/** Centered intro (kicker, big title, lead) above the course/e-book grids (previously .learningIntro). */
export const learningIntro =
  'mx-auto mb-[42px] max-w-[760px] text-center [&_:is(h1,h2)]:mt-[18px] [&_:is(h1,h2)]:font-display [&_:is(h1,h2)]:text-[length:clamp(34px,5vw,56px)] [&_:is(h1,h2)]:leading-[1.08] [&_:is(h1,h2)]:tracking-[-0.045em] [&_p]:mx-auto [&_p]:mt-[18px] [&_p]:max-w-[590px] [&_p]:text-[16px] [&_p]:leading-[1.7] [&_p]:text-[#a09db4]';

const buyButton =
  'flex min-h-[48px] w-full items-center gap-[7px] rounded-[9px] border-0 bg-[linear-gradient(100deg,#6d28d9,#8b5cf6)] py-1.5 pr-[7px] pl-[13px] text-[14px] font-extrabold text-white shadow-[0_7px_20px_#8b5cf640]';
const buyButtonPrice =
  'ml-auto rounded-[7px] bg-[#4c1d95] px-[10px] py-[7px] font-mono text-[12px] leading-[normal] font-extrabold';
const checkoutNote = 'col-span-full m-0 text-center text-[12px] text-[#777f91]';
const bullet =
  "relative before:absolute before:left-0 before:size-[5px] before:rounded-full before:bg-violet before:content-['']";
const masterclassFeature =
  'flex min-w-0 items-center gap-1.5 text-[12px] leading-[1.4] text-[#d4d7e0] [&_svg]:flex-none [&_svg]:text-cyan';

const learningLink =
  'inline-flex items-center gap-2 text-[14px] font-semibold text-[#d4c8ff] hover:text-white';

export function CoursesSection({
  exclude,
  showNote = true,
  className,
}: {
  /** Course id to leave out (e.g. the one whose details page is open). */
  exclude?: string;
  showNote?: boolean;
  className?: string;
} = {}) {
  const shown = courses.filter((course) => course.id !== exclude);
  return (
    <div
      className={cn(
        'grid grid-cols-2 items-stretch gap-[18px] max-[760px]:mx-auto max-[760px]:max-w-[560px] max-[760px]:grid-cols-1',
        className,
      )}
    >
      {shown.map((course) => (
        <article
          className={cn(
            'group relative flex min-w-0 scroll-mt-[100px] flex-col overflow-hidden rounded-[16px] border border-[#ffffff12] bg-[linear-gradient(160deg,#0d1018_0%,#090b11_70%)] shadow-[0_18px_55px_#0005] [transition:border-color_0.25s,translate_0.25s] hover:-translate-y-1',
            // The best-value course keeps its cyan border, even on hover.
            course.bestValue ? 'border-[#22d3ee66]' : 'hover:border-[#8b5cf680]',
          )}
          id={course.id}
          key={course.id}
        >
          <CourseArtwork course={course} />
          <div className="flex flex-1 flex-col px-6 pt-6 pb-5 max-[560px]:px-5">
            <span className="font-mono text-[11px] leading-[normal] font-extrabold tracking-[0.15em] text-violet-2">
              {course.level}
            </span>
            <h2 className="mt-2 font-display text-[length:clamp(19px,2vw,24px)] leading-[1.2] tracking-[-0.03em] text-white">
              {/* Stretched link: the whole card opens the course details page. */}
              <Link
                href={courseDetailsHref(course)}
                className="after:absolute after:inset-0 after:content-[''] group-hover:text-[#e9ddff]"
              >
                {course.title}
              </Link>
            </h2>
            <p className="mt-[5px] min-h-[45px] text-[14px] leading-[1.6] text-[#9ab3d5]">
              {course.description}
            </p>
            <ul className="mt-3 grid list-none grid-cols-2 gap-x-[10px] gap-y-2 border-y border-[#ffffff10] py-3">
              <li className={masterclassFeature}>
                <MonitorPlay size={13} />
                Recorded video course
              </li>
              <li className={masterclassFeature}>
                <InfinityIcon size={14} />
                Lifetime access
              </li>
              <li className={masterclassFeature}>
                <Languages size={13} />
                Hindi &amp; English
              </li>
              <li className={masterclassFeature}>
                <FolderOpen size={13} />
                Google Drive access
              </li>
            </ul>
            <ul className="mt-5 mb-6 grid list-none gap-2.5 text-[14px] text-[#e2e6ef]">
              {course.topics.map((topic) => (
                <li
                  key={topic}
                  className={cn(bullet, 'pl-[14px] leading-[1.5] before:top-[0.55em]')}
                >
                  {topic}
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              {course.oldPrice && (
                <p className="mb-[7px] text-[9px] text-[#7990af]">
                  <s className="text-[#69748a]">{course.oldPrice} USDT</s> · save{' '}
                  {course.oldPrice - course.price} USDT
                </p>
              )}
              <Link
                href={enrollHref(course)}
                className={cn(
                  buyButton,
                  'relative z-[1] transition-[filter,translate] hover:-translate-y-px hover:brightness-110',
                )}
              >
                Enroll now <ArrowRight size={15} />
                <span className={buyButtonPrice}>{course.price} USDT</span>
              </Link>
              <Link
                className="relative z-[1] mt-[10px] flex items-center justify-center gap-[7px] text-[13px] font-bold text-[#e1e5ec] hover:text-violet-3"
                href={courseDetailsHref(course)}
                aria-label={`${course.title} — full course details`}
              >
                Course details <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </article>
      ))}
      {showNote && (
        <p className={checkoutNote}>
          Pay in USDT (TRC20, BEP20 or ERC20). After our team approves your payment, the course is
          shared to your Gmail.
        </p>
      )}
    </div>
  );
}

export function EbooksSection() {
  return (
    <div className="grid grid-cols-3 gap-[18px] max-[900px]:gap-3 max-[640px]:mx-auto max-[640px]:max-w-[420px] max-[640px]:grid-cols-1">
      {ebooks.map((ebook) => (
        <article
          className={cn(
            'group flex min-w-0 scroll-mt-[100px] flex-col overflow-hidden rounded-[14px] border bg-[linear-gradient(160deg,#101017,#0b0c13)] shadow-[0_18px_55px_#0005] transition-[translate,border-color] duration-300 motion-safe:hover:-translate-y-1',
            ebook.type === 'patterns' && 'border-[#8b5cf638] hover:border-[#a78bfa80]',
            ebook.type === 'hindi' && 'border-[#22d3ee38] hover:border-[#22d3ee80]',
            ebook.type === 'gold' && 'border-[#e8ba5438] hover:border-[#e8ba5480]',
          )}
          key={ebook.id}
          id={ebook.id}
        >
          <div className="aspect-[1.2] overflow-hidden border-b border-white/5 bg-[#08090d] p-2">
            <div className="h-full motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.04]">
              <EbookArtwork ebook={ebook} />
            </div>
          </div>
          <div className="flex flex-1 flex-col p-[18px] max-[900px]:p-[14px]">
            <h3 className="font-display text-[18px] leading-[1.3] font-semibold tracking-[-0.025em] text-[#f4f4f7]">
              {ebook.title}
            </h3>
            <p className="mt-2 text-[13px] leading-[1.6] text-[#a09db4]">{ebook.subtitle}</p>
            <ul className="mt-4 mb-5 grid list-none gap-2 text-[13px] text-[#c4c1d0]">
              {ebook.features.map((feature) => (
                <li key={feature} className={cn(bullet, 'pl-[13px] before:top-[0.55em]')}>
                  {feature}
                </li>
              ))}
            </ul>
            <div
              className={cn(
                'mt-auto flex min-h-[44px] items-center justify-center rounded-lg border text-[14px] font-semibold',
                ebook.type === 'patterns' && 'border-[#8b5cf633] bg-[#8b5cf612] text-[#c4b5fd]',
                ebook.type === 'hindi' && 'border-[#22d3ee33] bg-[#22d3ee0c] text-[#83dbe9]',
                ebook.type === 'gold' && 'border-[#e8ba5433] bg-[#e8ba5410] text-[#e8c77f]',
              )}
            >
              Coming Soon
            </div>
          </div>
        </article>
      ))}
      <p className="col-span-full mt-2 text-center text-[13px] leading-relaxed text-[#9691a8]">
        All e-books are coming soon. Follow our Telegram community for launch updates.
      </p>
    </div>
  );
}
export function LearningSectionLinks() {
  return (
    <div className="mt-[30px] flex flex-wrap justify-center gap-x-7 gap-y-[14px]">
      <Link href="/courses" className={learningLink}>
        Browse all courses <ArrowRight size={16} />
      </Link>
      <Link href="/ebooks" className={learningLink}>
        Explore all e-books <ArrowRight size={16} />
      </Link>
      <Link href="/signup" className={learningLink}>
        Put your learning into practice <ArrowUpRight size={16} />
      </Link>
    </div>
  );
}
