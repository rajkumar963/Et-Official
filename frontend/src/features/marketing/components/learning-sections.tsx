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
import { courseDetailsHref, ebookEnquiryHref, enrollHref } from '../enroll';
import { CourseArtwork } from './course-artwork';
import { ebooks } from '../data/ebooks';

/** Centered intro (kicker, big title, lead) above the course/e-book grids (previously .learningIntro). */
export const learningIntro =
  'mx-auto mb-[42px] max-w-[760px] text-center [&_:is(h1,h2)]:mt-[18px] [&_:is(h1,h2)]:font-display [&_:is(h1,h2)]:text-[length:clamp(34px,5vw,56px)] [&_:is(h1,h2)]:leading-[1.08] [&_:is(h1,h2)]:tracking-[-0.045em] [&_p]:mx-auto [&_p]:mt-[18px] [&_p]:max-w-[590px] [&_p]:text-[16px] [&_p]:leading-[1.7] [&_p]:text-[#a09db4]';

const buyButton =
  'flex min-h-[44px] w-full items-center gap-[7px] rounded-[9px] border-0 bg-[linear-gradient(100deg,#6d28d9,#8b5cf6)] py-1.5 pr-[7px] pl-[13px] text-[12px] font-extrabold text-white shadow-[0_7px_20px_#8b5cf640]';
const buyButtonPrice =
  'ml-auto rounded-[7px] bg-[#4c1d95] px-[10px] py-[7px] font-mono text-[10px] leading-[normal] font-extrabold';
const checkoutNote = 'col-span-full m-0 text-center text-[10px] text-[#777f91]';
const bullet =
  "relative before:absolute before:left-0 before:size-[5px] before:rounded-full before:bg-violet before:content-['']";
const masterclassFeature =
  'flex min-w-0 items-center gap-1.5 text-[9px] leading-[1.3] text-[#d4d7e0] [&_svg]:flex-none [&_svg]:text-cyan';

const ebookCover: Record<string, string> = {
  patterns:
    'w-[176px] justify-start border border-[#565a55] px-[10px] pt-3 pb-2 text-white [background:radial-gradient(ellipse_at_50%_68%,#362166,transparent_60%),linear-gradient(160deg,#090812,#151027_64%,#07070d)]',
  hindi:
    'w-[184px] justify-start border border-[#8b5cf666] bg-[linear-gradient(145deg,#17122a,#090b16)] px-[10px] py-3 text-[#f4f2fa]',
  gold: 'items-start justify-start border border-[#1c3559] px-5 py-[22px] text-left text-white [background:linear-gradient(#5b82bb18_1px,transparent_1px)_0_0/24px_24px,linear-gradient(90deg,#5b82bb18_1px,transparent_1px)_0_0/24px_24px,radial-gradient(ellipse_at_80%_80%,#214c81,transparent_55%),linear-gradient(125deg,#101c35,#07101f)]',
};

const learningLink =
  'inline-flex items-center gap-2 text-[14px] font-semibold text-[#d4c8ff] hover:text-white';
const hindiEdition = 'mt-2 text-[6px] font-bold text-[#d2c8f2]';

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
          <div className="flex flex-1 flex-col px-[18px] pt-[18px] pb-[15px]">
            <span className="font-mono text-[9px] leading-[normal] font-extrabold tracking-[0.15em] text-violet-2">
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
            <p className="mt-[5px] min-h-[22px] text-[11px] leading-[1.5] text-[#9ab3d5]">
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
            <ul className="mt-[14px] mb-5 grid list-none gap-[7px] text-[11px] text-[#e2e6ef]">
              {course.topics.map((topic) => (
                <li
                  key={topic}
                  className={cn(bullet, 'pl-[14px] leading-[1.35] before:top-[0.47em]')}
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
                className="relative z-[1] mt-[10px] flex items-center justify-center gap-[7px] text-[10px] font-bold text-[#e1e5ec] hover:text-violet-3"
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
    <div className="grid grid-cols-3 gap-[18px] max-[760px]:grid-cols-1">
      {ebooks.map((ebook, index) => (
        <article
          className={cn(
            'flex min-w-0 flex-col overflow-hidden rounded-[14px] border border-[#ffffff12] bg-[linear-gradient(160deg,#0d1018,#090b11_75%)] shadow-[0_18px_55px_#0005] [transition:translate_0.25s,border-color_0.25s] hover:-translate-y-1 hover:border-[#a78bfa80] max-[760px]:mx-auto max-[760px]:w-full max-[760px]:max-w-[520px]',
            // The middle card is highlighted.
            index === 1 && 'border-[#8b5cf680] shadow-[0_18px_55px_#8b5cf620]',
          )}
          key={ebook.id}
          id={ebook.id}
        >
          <div className="relative grid min-h-[270px] place-items-center overflow-hidden bg-[#07090f] p-[14px]">
            <span className="absolute top-3 left-3 z-[2] rounded-full bg-[linear-gradient(110deg,#6d28d9,#8b5cf6)] px-2 py-[5px] text-[9px] font-extrabold text-white">
              50% off
            </span>
            <div
              className={cn(
                'relative isolate flex h-[242px] w-full flex-col items-center justify-center overflow-hidden text-center shadow-[0_10px_24px_#0009]',
                ebookCover[ebook.type] ?? ebookCover.gold,
              )}
              role="img"
              aria-label={`${ebook.title} cover`}
            >
              {ebook.type === 'patterns' && (
                <>
                  <span className="font-mono text-[7px] leading-[normal] font-extrabold tracking-[0.15em] text-[#c8cbd0]">
                    ET TRADER
                  </span>
                  <strong className="mt-[22px] font-display text-[20px] leading-none font-black tracking-[-0.04em]">
                    PRICE ACTION
                  </strong>
                  <b className="font-display text-[25px] leading-[1.1] font-black tracking-[-0.04em] text-violet-2">
                    PATTERNS <small className="text-[13px] text-[#f1f4ee]">2.0</small>
                  </b>
                  <span className="mt-2 border border-[#22d3ee55] px-[5px] py-[3px] font-mono text-[5px] leading-[normal] font-semibold tracking-[0.06em] text-[#d7e7fa]">
                    15 HIGH-PROBABILITY TRADING PATTERNS
                  </span>
                  <svg
                    className="absolute bottom-[22px] h-[70px] w-[92%] overflow-visible"
                    viewBox="0 0 180 72"
                    aria-hidden="true"
                  >
                    <path
                      className="fill-none stroke-cyan stroke-2"
                      d="M0 54 19 44 34 48 51 28 67 38 82 19 101 31 118 14 132 24 150 8 180 15"
                    />
                    <path className="fill-none stroke-[#7a8d7880] stroke-[0.7]" d="M0 62H180" />
                  </svg>
                  <span className="absolute bottom-[7px] font-mono text-[5px] leading-[normal] font-semibold tracking-[0.16em] text-[#d5dfd3]">
                    LEARN | PRACTICE | EXECUTE
                  </span>
                </>
              )}
              {ebook.type === 'hindi' && (
                <>
                  <span className="font-mono text-[5px] leading-[normal] font-semibold text-[#a09db4]">
                    ET TRADER | EDUCATION SERIES
                  </span>
                  <strong className="mt-4 font-display text-[10px] leading-[normal] font-black text-cyan">
                    TECHNICAL CANDLESTICK
                  </strong>
                  <b className="mt-[5px] font-display text-[9px] leading-[normal] font-black text-violet-2">
                    &amp; CHART PATTERN E-BOOK
                  </b>
                  <span className={hindiEdition}>Hindi Edition</span>
                  <svg
                    className="mt-[10px] h-[82px] w-full rounded-[4px] border border-[#8b5cf666] bg-[#0d1020] p-1"
                    viewBox="0 0 190 82"
                    aria-hidden="true"
                  >
                    <path
                      className="fill-none stroke-[#8b5cf688] stroke-[0.8]"
                      d="M0 65H190M0 42H190M0 19H190"
                    />
                    {[18, 43, 68, 93, 118, 143, 168].map((x, i) => {
                      const y = [34, 22, 38, 16, 26, 11, 18][i];
                      const green = i > 2;
                      return (
                        <g
                          key={x}
                          stroke={green ? '#22d3ee' : '#8b5cf6'}
                          fill={green ? '#22d3ee' : '#8b5cf6'}
                        >
                          <path d={`M${x} ${y - 10}v43`} />
                          <rect x={x - 5} y={y} width="10" height="22" rx="1" />
                        </g>
                      );
                    })}
                  </svg>
                  <span className={hindiEdition}>PATTERNS | EXAMPLES | STRATEGY</span>
                </>
              )}
              {ebook.type === 'gold' && (
                <>
                  <span className="relative z-[1] font-display text-[22px] leading-[1.05] font-black tracking-[-0.035em] text-[#edf3ff] [text-shadow:0_3px_12px_#0008]">
                    GOLD XAUUSD
                    <br />
                    TRADING STRATEGY
                  </span>
                  <span className="relative z-[1] mt-[5px] font-display text-[13px] leading-[normal] font-extrabold text-[#c8d8f3]">
                    COMPLETE GUIDE
                  </span>
                  <svg
                    className="absolute inset-x-0 bottom-[10px] h-[62%] w-full"
                    viewBox="0 0 320 150"
                    aria-hidden="true"
                  >
                    <path
                      className="fill-none stroke-[#55a6ff] stroke-3 drop-shadow-[0_0_4px_#4c9cff]"
                      d="M0 119 41 100 80 110 117 74 156 88 195 48 235 59 276 22 320 31"
                    />
                    <path
                      className="fill-none stroke-[#5579a755] stroke-[0.8]"
                      d="M0 132H320M0 104H320M0 76H320M0 48H320"
                    />
                  </svg>
                  <div
                    className="absolute right-[12%] bottom-[30px] flex -skew-y-8 items-end gap-[3px] drop-shadow-[0_5px_5px_#0009] [&>i]:border [&>i]:border-[#ffe18b] [&>i]:bg-[linear-gradient(145deg,#fff5b6,#e5a91e_45%,#9c5907)]"
                    aria-hidden="true"
                  >
                    <i className="h-[18px] w-[26px]" />
                    <i className="h-[28px] w-[32px]" />
                    <i className="h-[38px] w-[24px]" />
                  </div>
                  <span className="absolute right-[18px] bottom-[13px] z-[1] font-mono text-[12px] leading-[normal] font-extrabold text-[#fff4ce]">
                    XAUUSD
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-1 flex-col px-[18px] pt-[17px] pb-4">
            <h3 className="font-display text-[14px] leading-[1.3] tracking-[-0.015em] text-[#f4f4f7]">
              {ebook.title}
            </h3>
            {/* The broader `.ebookCopy p` rule outranked .ebookSubtitle in the original CSS. */}
            <p className="mt-[10px] text-[13.5px] leading-[1.7] text-[#a09db4]">{ebook.subtitle}</p>
            <ul className="mt-[14px] mb-[18px] grid list-none gap-2 text-[10px] text-[#e2e6ef]">
              {ebook.features.map((feature) => (
                <li key={feature} className={cn(bullet, 'pl-[13px] before:top-[0.45em]')}>
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              <p className="mt-[10px] mb-2 flex gap-[5px] text-[9px] leading-[1.7] text-[#7890af]">
                <s className="text-[#66748a]">{ebook.oldPrice} USDT</s>
                <span>{ebook.approximatePrice}</span>
              </p>
              <Link
                href={ebookEnquiryHref(ebook)}
                className={cn(
                  buyButton,
                  'min-h-[42px] transition-[filter,translate] hover:-translate-y-px hover:brightness-110',
                )}
              >
                Get e-book <ArrowRight size={15} />
                <span className={buyButtonPrice}>{ebook.price} USDT</span>
              </Link>
            </div>
          </div>
        </article>
      ))}
      <p className={checkoutNote}>
        Pay in USDT (TRC20, BEP20 or ERC20). After approval you receive a personalized PDF with up
        to 3 downloads.
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
