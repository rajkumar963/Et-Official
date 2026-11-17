import type { CSSProperties, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { eyebrow, mono, surface, tone as toneText } from './styles';

export type Tone = 'purple' | 'green' | 'red' | 'amber' | 'cyan';

/** Sets the --tone colour consumed by StatIcon and the stat-card glow (previously .accent-*). */
export const accent: Record<Tone, string> = {
  purple: '[--tone:#8b5cf6]',
  green: '[--tone:#4ade80]',
  red: '[--tone:#ff5c6c]',
  amber: '[--tone:#fbbf24]',
  cyan: '[--tone:#22d3ee]',
};

const valueTone: Record<Tone, string> = {
  purple: toneText.purple,
  green: toneText.green,
  red: toneText.red,
  amber: toneText.amber,
  cyan: toneText.cyan,
};

/** Tinted rounded icon tile (previously .stat-icon). Pass `tone` or inherit --tone from a parent. */
export function StatIcon({
  tone,
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'grid size-[34px] shrink-0 place-items-center rounded-[11px] border border-[color:color-mix(in_srgb,var(--tone,#8b5cf6)_30%,transparent)] bg-[color:color-mix(in_srgb,var(--tone,#8b5cf6)_14%,transparent)] text-[color:var(--tone,#c4b5fd)] shadow-[0_0_18px_color-mix(in_srgb,var(--tone,#8b5cf6)_20%,transparent)]',
        tone && accent[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatCard({
  label,
  icon: Icon,
  tone = 'purple',
  value,
  valueTone: valueToneName,
  valueClassName,
  sub,
  index = 0,
  children,
}: {
  label: string;
  icon?: LucideIcon;
  tone?: Tone;
  value: ReactNode;
  valueTone?: Tone | '';
  /** Extra classes for the value, e.g. a page-specific font size. */
  valueClassName?: string;
  sub?: ReactNode;
  index?: number;
  children?: ReactNode;
}) {
  return (
    <article
      className={cn(
        surface,
        'group spotlight rise flex flex-col gap-3 overflow-hidden p-5 transition-[translate,border-color,box-shadow] duration-[400ms] ease-smooth hover:-translate-y-[3px] hover:border-line-strong hover:shadow-[inset_0_1px_0_#ffffff0f,0_26px_60px_#00000055]',
        '[&_small]:text-[11px] [&_small]:text-[#8d899f]',
        'max-[700px]:gap-2.5 max-[700px]:rounded-2xl max-[700px]:px-3.5 max-[700px]:py-[15px] max-[700px]:[&_small]:text-[10px]',
        accent[tone],
      )}
      style={{ '--i': index } as CSSProperties}
    >
      <span
        className="pointer-events-none absolute -top-20 -right-[60px] size-40 rounded-full bg-[radial-gradient(circle,var(--tone,#8b5cf6)_0%,transparent_70%)] opacity-[0.16] transition-opacity duration-[400ms] group-hover:opacity-30"
        aria-hidden="true"
      />
      <div className="flex items-center justify-between gap-2">
        <span className={cn(eyebrow, 'text-[9.5px] tracking-[0.08em] text-[#aaa6bd]')}>
          {label}
        </span>
        {Icon && (
          <StatIcon className="max-[700px]:size-7 max-[700px]:[&_svg]:w-3.5">
            <Icon size={16} />
          </StatIcon>
        )}
      </div>
      <strong
        className={cn(
          mono,
          'text-[27px] leading-[1.15] font-bold tracking-[-0.05em] min-[1650px]:text-[24px] max-[700px]:text-[20px]',
          valueToneName && valueTone[valueToneName],
          valueClassName,
        )}
      >
        {value}
      </strong>
      {children}
      {sub && <small>{sub}</small>}
    </article>
  );
}
