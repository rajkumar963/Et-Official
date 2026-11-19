import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/cn';

export function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'group inline-flex items-center gap-2.5 whitespace-nowrap font-display text-[19px] font-bold tracking-[-0.04em]',
        className,
      )}
      aria-label="ET Official home"
    >
      <Image
        src="/brand-logo.jpg"
        alt=""
        width={40}
        height={40}
        priority
        className="size-10 rounded-full object-cover shadow-[0_0_0_1px_#ffffff30,0_4px_18px_#00df7633] transition-transform duration-[400ms] ease-smooth group-hover:scale-[1.06]"
      />
      <span>
        ET <span className="text-violet-3">Official</span>
      </span>
    </Link>
  );
}
