import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'neutral' | 'gain' | 'loss';

const tones: Record<BadgeTone, string> = {
  neutral: 'border border-[#a78bfa2a] bg-[#8b5cf61a] text-[#d3c7f5]',
  gain: 'border border-[#4ade8030] bg-[#4ade8014] text-gain',
  loss: 'border border-[#ff5c6c33] bg-[#ff5c6c16] text-[#ff8a95]',
};

export function badgeClass(toneName: BadgeTone, className?: string) {
  return cn(
    'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-[3px] font-mono text-[9.5px] leading-[1.45] font-semibold tracking-[0.06em]',
    tones[toneName],
    className,
  );
}

/** Small pill label (previously .badge.neutral/.gain/.loss). */
export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return <span className={badgeClass(tone, className)}>{children}</span>;
}

/** Pulsing live indicator dot (previously .status-dot / .purple-dot). */
export function StatusDot({ purple = false, className }: { purple?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        'inline-block size-[7px] shrink-0 animate-[pulse-dot_2.2s_infinite] rounded-full',
        purple ? 'bg-violet-2 shadow-[0_0_0_0_#a78bfa80]' : 'bg-gain shadow-[0_0_0_0_#4ade8080]',
        className,
      )}
    />
  );
}
