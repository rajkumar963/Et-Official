'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  BadgeCheck,
  CircleDollarSign,
  Clock3,
  Hourglass,
  RotateCw,
  Users,
  XCircle,
} from 'lucide-react';
import type { AdminOrderDto } from '@et-trader/shared';
import { adminService } from '@/features/admin/admin.api';
import { useAdminQuery } from '@/features/admin/use-admin-query';
import { PageHeading, headingActions } from '@/components/ui/page-heading';
import { Panel, PanelHeader } from '@/components/ui/panel';
import { StatCard } from '@/components/ui/stat-card';
import { buttonClass, textLinkClass } from '@/components/ui/button';
import { LoadError } from './admin-states';
import { OrderDetail, type DetailMode } from './order-detail';
import { OrdersTable } from './orders-table';
import { Loading, usdt } from './order-ui';

export function AdminOverview() {
  const stats = useAdminQuery(adminService.stats);
  const pending = useAdminQuery(() => adminService.orders({ status: 'submitted' }));
  const [open, setOpen] = useState<{ order: AdminOrderDto; mode: DetailMode } | null>(null);

  const refresh = () => {
    void stats.reload();
    void pending.reload();
  };
  const s = stats.data;
  const waiting = s?.orders.submitted ?? 0;

  return (
    <>
      <PageHeading
        eyebrow="ADMIN OVERVIEW"
        title="Payments & access"
        description="Review USDT payments, approve buyers and keep an eye on your store."
        actions={
          <div className={headingActions}>
            <button className={buttonClass({ variant: 'secondary' })} onClick={refresh}>
              <RotateCw size={15} /> Refresh
            </button>
            <Link href="/admin/orders" className={buttonClass()}>
              All orders <ArrowUpRight size={15} />
            </Link>
          </div>
        }
      />

      {stats.error ? (
        <LoadError message={stats.error} onRetry={refresh} />
      ) : !s ? (
        <Loading label="Loading stats…" />
      ) : (
        <div className="grid grid-cols-3 gap-3.5 max-[900px]:grid-cols-2">
          <StatCard
            index={0}
            label="NEEDS REVIEW"
            icon={Clock3}
            tone="amber"
            value={waiting}
            valueTone={waiting ? 'amber' : ''}
            sub={waiting ? 'Payments waiting for your approval' : 'All caught up'}
          />
          <StatCard
            index={1}
            label="APPROVED"
            icon={BadgeCheck}
            tone="green"
            value={s.orders.approved}
            sub="Buyers with access granted"
          />
          <StatCard
            index={2}
            label="REVENUE"
            icon={CircleDollarSign}
            tone="purple"
            value={usdt(s.revenue)}
            valueClassName="text-[22px] min-[1650px]:text-[22px]"
            sub={`${usdt(s.revenueLast30Days)} in the last 30 days`}
          />
          <StatCard
            index={3}
            label="USERS"
            icon={Users}
            tone="cyan"
            value={s.users}
            sub={`${s.verifiedUsers} verified email${s.verifiedUsers === 1 ? '' : 's'}`}
          />
          <StatCard
            index={4}
            label="AWAITING PAYMENT"
            icon={Hourglass}
            tone="purple"
            value={s.orders.awaiting_payment}
            sub="Orders started, no transaction ID yet"
          />
          <StatCard
            index={5}
            label="REJECTED"
            icon={XCircle}
            tone="red"
            value={s.orders.rejected}
            sub="Payments that couldn’t be confirmed"
          />
        </div>
      )}

      <Panel index={2}>
        <PanelHeader>
          <div>
            <h2>
              Needs review
              {waiting > 0 && (
                <span className="rounded-full border border-[#fbbf2440] bg-[#fbbf2416] px-2 py-px font-mono text-[11px] text-amber">
                  {waiting}
                </span>
              )}
            </h2>
            <p>Check each transaction on the explorer, then approve or reject.</p>
          </div>
          <Link href="/admin/orders?status=submitted" className={textLinkClass}>
            View all <ArrowUpRight size={14} />
          </Link>
        </PanelHeader>
        {pending.error ? (
          <LoadError message={pending.error} onRetry={() => pending.reload()} />
        ) : !pending.data ? (
          <Loading />
        ) : (
          <OrdersTable
            orders={pending.data}
            onOpen={(order, mode = 'view') => setOpen({ order, mode })}
            empty="No payments waiting for review."
          />
        )}
      </Panel>

      <Panel index={3}>
        <PanelHeader>
          <div>
            <h2>Recent orders</h2>
            <p>The latest orders across every status.</p>
          </div>
          <Link href="/admin/orders" className={textLinkClass}>
            All orders <ArrowUpRight size={14} />
          </Link>
        </PanelHeader>
        {s ? (
          <OrdersTable
            compact
            orders={s.recentOrders}
            onOpen={(order, mode = 'view') => setOpen({ order, mode })}
            empty="No orders yet."
          />
        ) : (
          !stats.error && <Loading />
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
