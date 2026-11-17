import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { AmbientBackdrop } from '@/components/effects/ambient-backdrop';
import { Brand } from '@/components/ui/brand';
import { buttonClass } from '@/components/ui/button';
import { eyebrow, tone } from '@/components/ui/styles';
import { cn } from '@/lib/cn';
import { SiteFooter } from '@/features/marketing/components/site-footer';
export default function NotFound() {
  return (
    <>
      <main className="relative isolate flex min-h-screen flex-col items-center justify-center gap-[22px] overflow-hidden p-6 text-center">
        <AmbientBackdrop />
        <Brand />
        <span
          className="animate-[rise_1s_var(--ease-smooth)_both] bg-[linear-gradient(180deg,#fff,#8b5cf6_60%,transparent)] bg-clip-text font-display text-[length:clamp(120px,26vw,260px)] leading-[0.85] font-bold tracking-[-0.07em] text-transparent [-webkit-text-fill-color:transparent]"
          aria-hidden="true"
        >
          404
        </span>
        <span className={cn(eyebrow, tone.purple)}>OFF THE CHART</span>
        <h1 className="font-display text-[length:clamp(22px,3vw,32px)] tracking-[-0.04em]">
          This page isn’t in your journal.
        </h1>
        <p className="max-w-[420px] text-muted">
          The link may be outdated, or the page has moved. Let’s get you back on track.
        </p>
        <Link href="/" className={buttonClass()}>
          Back to home <ArrowUpRight size={16} />
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
