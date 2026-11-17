import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Round gradient initials badge (previously .avatar / .avatar.large). */
export function Avatar({
  large = false,
  title,
  className,
  children,
}: {
  large?: boolean;
  title?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-grid size-9 place-items-center rounded-full bg-[linear-gradient(135deg,#8b5cf6,#0891b2)] text-[11px] font-bold text-white shadow-[0_0_0_2px_#06060b,0_0_0_3px_#a78bfa55]',
        large && 'size-[54px] text-[17px]',
        className,
      )}
      title={title}
    >
      {children}
    </span>
  );
}
