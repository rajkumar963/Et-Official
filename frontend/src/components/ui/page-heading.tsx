import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { StatusDot } from './badge';
import { eyebrow } from './styles';

/** Wrapper for the buttons passed as PageHeading `actions` (previously .heading-actions). */
export const headingActions =
  'flex items-center gap-2 max-[700px]:[&>a]:px-3 max-[700px]:[&>a]:py-[9px] max-[700px]:[&>a]:text-[12px] max-[700px]:[&>button]:px-3 max-[700px]:[&>button]:py-[9px] max-[700px]:[&>button]:text-[12px]';

export function PageHeading({
  eyebrow: label,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-5 max-[1200px]:flex-col max-[1200px]:items-start max-[1200px]:gap-4">
      <div>
        <span className={cn(eyebrow, 'inline-flex items-center gap-2 text-violet-3')}>
          <StatusDot purple />
          {label}
        </span>
        <h1 className="mt-3 mb-2 bg-[linear-gradient(180deg,#fff_30%,#c9c3e0)] bg-clip-text font-display text-[34px] leading-[1.1] font-bold tracking-[-0.045em] text-transparent max-[700px]:text-[28px]">
          {title}
        </h1>
        <p className="text-[13px] text-muted">{description}</p>
      </div>
      {actions}
    </div>
  );
}
