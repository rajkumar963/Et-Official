'use client';
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Small "Copy" button for addresses, amounts and IDs. */
export function CopyButton({
  value,
  label = 'Copy',
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          /* Clipboard blocked: the value is still visible to select manually. */
        }
      }}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-[9px] border border-line-strong bg-[#ffffff08] px-2.5 py-1.5 text-[12px] font-semibold text-[#e2dfee] hover:border-[#a78bfa66] hover:text-white',
        copied && 'border-[#4ade8055] text-gain',
        className,
      )}
      aria-label={`${label}: ${value}`}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copied' : label}
    </button>
  );
}
