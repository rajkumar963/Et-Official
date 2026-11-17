import Link from 'next/link';
import { cn } from '@/lib/cn';

export function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'group inline-flex items-center gap-2.5 whitespace-nowrap font-display text-[19px] font-bold tracking-[-0.04em]',
        className,
      )}
      aria-label="ET Trader home"
    >
      <span
        className="relative grid size-[34px] place-items-center rounded-[11px] bg-[linear-gradient(135deg,#8b5cf6_0%,#6d28d9_50%,#0891b2_100%)] text-white shadow-[0_0_0_1px_#ffffff2a_inset,0_6px_20px_#7c3aed66] transition-transform duration-[400ms] ease-smooth group-hover:-rotate-[8deg] group-hover:scale-[1.06]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M3.5 16.5 9 11l3.6 3.2L20 6.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 6.5h5v5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>
        ET <span className="text-violet-3">Official</span>
      </span>
    </Link>
  );
}
