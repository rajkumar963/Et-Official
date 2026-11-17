'use client';
import { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import type { AdminOrderDto, OrderStatus } from '@et-trader/shared';
import { Badge, badgeClass, type BadgeTone } from '@/components/ui/badge';
import { iconButtonClass } from '@/components/ui/button';
import { mono } from '@/components/ui/styles';
import { cn } from '@/lib/cn';

export const usdt = (n: number) =>
  `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n)} USDT`;

export const dateTime = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleString() : '—';

export const shortHash = (hash: string, size = 8) =>
  hash.length > size * 2 + 1 ? `${hash.slice(0, size)}…${hash.slice(-size)}` : hash;

export const statusMeta: Record<OrderStatus, { label: string; tone: BadgeTone | 'amber' }> = {
  submitted: { label: 'Needs review', tone: 'amber' },
  approved: { label: 'Approved', tone: 'gain' },
  rejected: { label: 'Rejected', tone: 'loss' },
  awaiting_payment: { label: 'Awaiting payment', tone: 'neutral' },
};

const amberBadge = 'border-[#fbbf2433] bg-[#fbbf2416] text-amber';

export function StatusBadge({ order }: { order: Pick<AdminOrderDto, 'status' | 'accessRevoked'> }) {
  const meta = statusMeta[order.status];
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {meta.tone === 'amber' ? (
        <span className={badgeClass('neutral', amberBadge)}>{meta.label.toUpperCase()}</span>
      ) : (
        <Badge tone={meta.tone}>{meta.label.toUpperCase()}</Badge>
      )}
      {order.status === 'approved' && order.accessRevoked && (
        <Badge tone="loss">ACCESS REMOVED</Badge>
      )}
    </span>
  );
}

export function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={iconButtonClass({ className: 'size-7' })}
      aria-label={label}
      title={copied ? 'Copied' : label}
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* Clipboard unavailable — the value is still visible to select manually. */
        }
      }}
    >
      {copied ? <Check size={13} className="text-gain" /> : <Copy size={13} />}
    </button>
  );
}

/** Transaction hash: truncated, linked to the block explorer, with a copy button. */
export function TxHash({
  order,
  full = false,
}: {
  order: Pick<AdminOrderDto, 'txHash' | 'explorerUrl'>;
  full?: boolean;
}) {
  if (!order.txHash) return <span className="text-dim">Not submitted</span>;
  return (
    <span className="inline-flex max-w-full items-center gap-1">
      {order.explorerUrl ? (
        <a
          href={order.explorerUrl}
          target="_blank"
          rel="noreferrer"
          className={cn(
            mono,
            'inline-flex min-w-0 items-center gap-1 text-[12px] text-violet-3 hover:text-white',
            full && 'wrap-anywhere',
          )}
          title="Open in block explorer"
          onClick={(e) => e.stopPropagation()}
        >
          <span className={full ? 'wrap-anywhere whitespace-normal' : ''}>
            {full ? order.txHash : shortHash(order.txHash)}
          </span>
          <ExternalLink size={12} className="shrink-0" />
        </a>
      ) : (
        <span className={cn(mono, 'text-[12px]', full && 'wrap-anywhere whitespace-normal')}>
          {full ? order.txHash : shortHash(order.txHash)}
        </span>
      )}
      <CopyButton value={order.txHash} label="Copy transaction hash" />
    </span>
  );
}

/** Centered spinner line used while admin data loads. */
export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <span
      className="inline-flex items-center gap-3 py-6 text-[13px] text-[#b0a6c6]"
      aria-busy="true"
    >
      <span className="size-[18px] animate-[spin_0.8s_linear_infinite] rounded-full border-2 border-[#a78bfa33] border-t-violet-2" />
      {label}
    </span>
  );
}

/** Table cell recipes shared by the admin tables (same feel as the trade table). */
export const th =
  'border-b border-line px-3 py-3 text-left font-mono text-[9.5px] leading-[normal] font-semibold tracking-[0.08em] text-[#8f8ca5] uppercase';
export const td = 'border-b border-[#ffffff07] px-3 py-[14px] text-[#d8d4e5]';
export const cellSmall = 'mt-0.5 block text-[10.5px] text-[#77748c]';
export const rowClass =
  'animate-[rise_0.5s_calc(var(--i,0)*40ms)_var(--ease-smooth)_backwards] transition-[background] duration-200 last:[&>td]:border-b-0 hover:bg-[linear-gradient(90deg,#8b5cf60f,transparent)]';
