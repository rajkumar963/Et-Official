import type { OrderDto } from '@et-trader/shared';
import { Badge, type BadgeTone } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

const labels: Record<OrderDto['status'], { text: string; tone: BadgeTone | 'amber' }> = {
  awaiting_payment: { text: 'AWAITING PAYMENT', tone: 'neutral' },
  submitted: { text: 'UNDER REVIEW', tone: 'amber' },
  approved: { text: 'ACCESS GRANTED', tone: 'gain' },
  rejected: { text: 'PAYMENT NOT CONFIRMED', tone: 'loss' },
};

/** Status pill for an order, as the buyer sees it. */
export function OrderStatusBadge({ order, className }: { order: OrderDto; className?: string }) {
  if (order.status === 'approved' && order.accessRevoked)
    return (
      <Badge tone="loss" className={className}>
        ACCESS REMOVED
      </Badge>
    );
  const { text, tone } = labels[order.status];
  if (tone === 'amber')
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full border border-[#fbbf2440] bg-[#fbbf2414] px-2 py-[3px] font-mono text-[9.5px] leading-[1.45] font-semibold tracking-[0.06em] whitespace-nowrap text-amber',
          className,
        )}
      >
        {text}
      </span>
    );
  return (
    <Badge tone={tone} className={className}>
      {text}
    </Badge>
  );
}
