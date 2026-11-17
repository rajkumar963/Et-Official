import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { surface } from './styles';

/** Glass content panel (previously .panel). `index` staggers the entrance animation. */
export function Panel({
  index,
  animate = true,
  className,
  children,
}: {
  index?: number;
  animate?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        surface,
        'p-[22px] max-[1200px]:p-[19px] max-[700px]:rounded-2xl max-[700px]:p-4',
        '[&_h2]:flex [&_h2]:flex-wrap [&_h2]:items-center [&_h2]:gap-[9px] [&_h2]:font-display [&_h2]:text-[17px] [&_h2]:tracking-[-0.03em]',
        animate && 'rise',
        className,
      )}
      style={index === undefined ? undefined : ({ '--i': index } as CSSProperties)}
    >
      {children}
    </section>
  );
}

/** Title row of a panel (previously .panel-header): title block left, actions right. */
export function PanelHeader({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'mb-5 flex items-center justify-between gap-3 [&_p]:mt-1 [&_p]:text-[12px] [&_p]:text-muted',
        className,
      )}
    >
      {children}
    </div>
  );
}
