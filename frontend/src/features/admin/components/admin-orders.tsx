'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { RotateCw, Search } from 'lucide-react';
import type { AdminOrderDto } from '@et-trader/shared';
import { adminService, type OrderFilter } from '@/features/admin/admin.api';
import { useAdminQuery } from '@/features/admin/use-admin-query';
import { PageHeading, headingActions } from '@/components/ui/page-heading';
import { Panel } from '@/components/ui/panel';
import { buttonClass } from '@/components/ui/button';
import { input } from '@/components/ui/form';
import { cn } from '@/lib/cn';
import { LoadError } from './admin-states';
import { OrderDetail, type DetailMode } from './order-detail';
import { OrdersTable } from './orders-table';
import { Loading } from './order-ui';

const filters: { value: OrderFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'submitted', label: 'Needs review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'awaiting_payment', label: 'Awaiting payment' },
];

export function AdminOrders({
  initialStatus = 'all',
  initialQuery = '',
}: {
  initialStatus?: OrderFilter;
  initialQuery?: string;
}) {
  const router = useRouter();
  const path = usePathname();
  const [status, setStatus] = useState<OrderFilter>(initialStatus);
  const [search, setSearch] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState<{ order: AdminOrderDto; mode: DetailMode } | null>(null);

  // Debounce typing before hitting the API.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Keep the URL shareable (e.g. /admin/orders?status=submitted).
  useEffect(() => {
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (query) params.set('q', query);
    const next = params.size ? `${path}?${params}` : path;
    router.replace(next, { scroll: false });
  }, [status, query, path, router]);

  const orders = useAdminQuery(
    () => adminService.orders({ status, q: query }),
    `${status}|${query}`,
  );
  const stats = useAdminQuery(adminService.stats);

  const counts = stats.data?.orders;
  const countFor = (value: OrderFilter) =>
    !counts
      ? null
      : value === 'all'
        ? Object.values(counts).reduce((sum, n) => sum + n, 0)
        : counts[value];

  const refresh = () => {
    void orders.reload();
    void stats.reload();
  };

  return (
    <>
      <PageHeading
        eyebrow="ORDERS"
        title="Orders & payments"
        description="Every order with its USDT payment. Click a row for full details and actions."
        actions={
          <div className={headingActions}>
            <button className={buttonClass({ variant: 'secondary' })} onClick={refresh}>
              <RotateCw size={15} /> Refresh
            </button>
          </div>
        }
      />
      <Panel index={1}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div
            className="flex max-w-full gap-1 overflow-x-auto rounded-[13px] border border-line bg-[#ffffff05] p-1"
            role="tablist"
            aria-label="Filter by status"
          >
            {filters.map((f) => {
              const active = f.value === status;
              const count = countFor(f.value);
              return (
                <button
                  key={f.value}
                  role="tab"
                  aria-selected={active}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-[10px] px-3 py-[7px] text-[12.5px] font-medium whitespace-nowrap transition-colors',
                    active
                      ? 'bg-[linear-gradient(135deg,#8b5cf6,#6d28d9)] text-white shadow-[0_4px_18px_#7c3aed55]'
                      : 'text-[#a9a6bc] hover:bg-[#ffffff08] hover:text-white',
                  )}
                  onClick={() => setStatus(f.value)}
                >
                  {f.label}
                  {count !== null && (
                    <span
                      className={cn(
                        'rounded-full px-1.5 font-mono text-[10.5px]',
                        active
                          ? 'bg-[#ffffff26]'
                          : f.value === 'submitted' && count > 0
                            ? 'bg-[#fbbf2420] text-amber'
                            : 'bg-[#ffffff0d] text-muted',
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <label className="relative w-[300px] max-[700px]:w-full">
            <span className="sr-only">Search orders</span>
            <Search
              size={15}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted"
            />
            <input
              className={cn(input, 'py-[9px] pl-9 text-[13px]')}
              type="search"
              placeholder="Order #, buyer, Gmail, tx hash…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
        {orders.error ? (
          <LoadError message={orders.error} onRetry={() => orders.reload()} />
        ) : !orders.data ? (
          <Loading label="Loading orders…" />
        ) : (
          <div className={cn('transition-opacity', orders.loading && 'opacity-60')}>
            <OrdersTable
              orders={orders.data}
              onOpen={(order, mode = 'view') => setOpen({ order, mode })}
              empty={query ? `No orders match “${query}”.` : 'No orders in this view.'}
            />
          </div>
        )}
      </Panel>
      {open && (
        <OrderDetail
          key={open.order.id}
          order={open.order}
          initialMode={open.mode}
          onClose={() => setOpen(null)}
          onChanged={refresh}
        />
      )}
    </>
  );
}
