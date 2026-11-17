import { MonitorPlay } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Course, CourseDirection } from '../data/courses';

const artworkBackground: Record<CourseDirection, string> = {
  BASIC:
    '[background:radial-gradient(ellipse_at_80%_70%,#0e933c80,transparent_40%),radial-gradient(ellipse_at_32%_100%,#b67613aa,transparent_56%),linear-gradient(130deg,#17112b,#101014_58%,#24200f)]',
  ADVANCED:
    '[background:radial-gradient(ellipse_at_80%_72%,#8b5cf680,transparent_42%),radial-gradient(ellipse_at_30%_100%,#b67613aa,transparent_56%),linear-gradient(130deg,#1c1235,#101014_58%,#21152e)]',
};

/** Course cover illustration used on course cards and course detail pages. */
export function CourseArtwork({
  course,
  variant = 'card',
  className,
}: {
  course: Course;
  variant?: string;
  className?: string;
}) {
  const gradientId = `chart-${course.id}-${variant}`;
  return (
    <div
      className={cn(
        'relative isolate flex aspect-[1.76] flex-col justify-between overflow-hidden border-b border-[#8b5cf644] px-4 py-[14px]',
        artworkBackground[course.direction],
        className,
      )}
    >
      <div
        className="absolute inset-0 z-[-1] bg-[linear-gradient(#ffffff0c_1px,transparent_1px),linear-gradient(90deg,#ffffff0c_1px,transparent_1px)] bg-[size:28px_28px] opacity-30 [mask-image:linear-gradient(110deg,transparent_5%,#000_75%)]"
        aria-hidden="true"
      />
      <svg
        className="absolute right-[-3%] bottom-[-2%] z-[-1] h-[90%] w-[78%] opacity-70 drop-shadow-[0_0_8px_#f5a62355]"
        viewBox="0 0 400 180"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <path
          d="M0 142 48 116 92 128 141 82 191 98 242 54 293 70 345 22 400 38"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {[42, 110, 178, 246, 314, 378].map((x, index) => {
          const top = [105, 84, 55, 64, 30, 14][index];
          return (
            <g key={x} opacity=".72">
              <path d={`M${x} ${top - 13}v52`} stroke="#22d3ee" />
              <rect x={x - 7} y={top} width="14" height="25" rx="2" fill="#22d3ee" />
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-[9px] font-mono text-[10px] font-extrabold tracking-[0.12em] text-[#f5f3f4]">
        ET TRADER
        <span className="rounded-[3px] border border-[#d6ab5d88] px-1.5 py-[3px] text-[7px] text-[#f3c869]">
          TRADING COURSE
        </span>
      </div>
      <div className="flex w-max max-w-[82%] -skew-x-4 flex-col items-start [text-shadow:0_3px_14px_#000]">
        <strong className="font-display text-[length:clamp(23px,2.8vw,38px)] leading-[0.95] font-black tracking-[-0.04em] text-[#ffdf74] [text-shadow:0_2px_0_#6f3407,0_4px_12px_#000a,0_0_24px_#ffbf3c55]">
          {course.direction === 'BASIC' ? 'START' : 'LEVEL UP'}
        </strong>
        <b className="mt-[3px] bg-[linear-gradient(95deg,#5b21b6,#8b5cf6_74%,#4c1d95)] px-2 pt-px pb-[3px] font-display text-[length:clamp(19px,2.3vw,30px)] leading-[1.05] font-black tracking-[-0.03em] text-white shadow-[0_4px_16px_#0008]">
          {course.level}
        </b>
        <span className="mt-2 font-mono text-[8px] font-bold tracking-[0.16em] text-[#f5dfc2]">
          TRADING VIDEO COURSE
        </span>
      </div>
      {course.bestValue && (
        <span className="absolute top-[48px] right-[14px] rounded-[4px] bg-[linear-gradient(110deg,#6d28d9,#8b5cf6)] px-[7px] py-[5px] font-mono text-[8px] font-extrabold text-white">
          ADVANCED
        </span>
      )}
      <span
        className="absolute bottom-[10px] left-3 inline-flex items-center gap-1.5 rounded-full bg-[#08090edb] px-2 py-[5px] text-[9px] font-bold text-[#f7f6f8] [&_svg]:text-violet-2"
        aria-hidden="true"
      >
        <MonitorPlay size={14} /> Video course
      </span>
    </div>
  );
}
