'use client';
import type { CSSProperties } from 'react';
import { Check, Eye, Inbox, X } from 'lucide-react';
import type { AdminOrderDto } from '@et-trader/shared';
import { buttonClass, iconButtonClass } from '@/components/ui/button';
import { mono } from '@/components/ui/styles';
import { cn } from '@/lib/cn';
import type { DetailMode } from './order-detail';
import { StatusBadge, TxHash, cellSmall, rowClass, td, th, usdt } from './order-ui';

export function OrdersTable({
  orders,
  onOpen,
  compact = false,
  empty = 'No orders match.',
}: {
  orders: AdminOrderDto[];
  onOpen: (order: AdminOrderDto, mode?: DetailMode) => void;
  /** Hides the tx hash column (overview lists). */
  compact?: boolean;
  empty?: string;
}) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-left text-[13px] whitespace-nowrap">
        <thead>
          <tr>
            <th className={th}>Order</th>
            <th className={th}>Buyer</th>
            <th className={th}>Product</th>
            <th className={cn(th, 'text-right')}>Amount</th>
            {!compact && <th className={th}>Tx hash</th>}
            <th className={th}>Status</th>
            <th className={cn(th, 'text-right')}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, i) => (
            <tr
              key={order.id}
              className={cn(rowClass, 'cursor-pointer')}
              style={{ '--i': Math.min(i, 12) } as CSSProperties}
              onClick={() => onOpen(order)}
            >
              <td className={td}>
                <strong className={cn(mono, 'text-[12.5px] font-semibold')}>
                  {order.orderNumber}
                </strong>
                <small className={cellSmall} suppressHydrationWarning>
                  {new Date(order.submittedAt || order.createdAt).toLocaleString()}
                </small>
              </td>
              <td className={cn(td, 'max-w-[220px]')}>
                <span className="block truncate">{order.buyerName}</span>
                <small className={cn(cellSmall, 'truncate')}>
                  {order.user?.email || order.accessEmail}
                </small>
              </td>
              <td className={cn(td, 'max-w-[220px]')}>
                <span className="block truncate">{order.productTitle}</span>
                <small className={cellSmall}>{order.productType}</small>
              </td>
              <td className={cn(td, 'text-right')}>
                <span className={cn(mono, 'font-semibold')}>{usdt(order.amount)}</span>
                <small className={cellSmall}>{order.network}</small>
              </td>
              {!compact && (
                <td className={td}>
                  <TxHash order={order} />
                </td>
              )}
              <td className={td}>
                <StatusBadge order={order} />
              </td>
              <td className={td}>
                <div className="flex items-center justify-end gap-1.5">
                  {order.status === 'submitted' && (
                    <>
                      <button
                        className={buttonClass({ size: 'sm', className: 'px-2.5 py-1.5' })}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpen(order, 'approve');
                        }}
                      >
                        <Check size={14} /> Approve
                      </button>
                      <button
                        className={buttonClass({
                          variant: 'destructive',
                          size: 'sm',
                          className: 'px-2.5 py-1.5',
                        })}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpen(order, 'reject');
                        }}
                      >
                        <X size={14} /> Reject
                      </button>
                    </>
                  )}
                  <button
                    className={iconButtonClass({ className: 'size-[30px]' })}
                    aria-label={`View order ${order.orderNumber}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen(order);
                    }}
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!orders.length && (
        <div className="flex flex-col items-center gap-3 px-5 py-12 text-center text-[13px] text-muted">
          <span className="grid size-12 place-items-center rounded-[16px] border border-line bg-[#ffffff05] text-violet-3">
            <Inbox size={20} />
          </span>
          {empty}
        </div>
      )}
    </div>
  );
}
