'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, ExternalLink, GraduationCap } from 'lucide-react';
import type { OrderDto } from '@et-trader/shared';
import { buttonClass, textLinkClass } from '@/components/ui/button';
import { errorBox } from '@/components/ui/form';
import { headingActions, PageHeading } from '@/components/ui/page-heading';
import { Panel } from '@/components/ui/panel';
import { StatIcon } from '@/components/ui/stat-card';
import { mono } from '@/components/ui/styles';
import { ordersApi } from '@/features/commerce/orders.api';
import { cn } from '@/lib/cn';
import { OrderStatusBadge } from './order-status';

function OrderCard({ order, index }: { order: OrderDto; index: number }) {
  const Icon = order.productType === 'course' ? GraduationCap : BookOpen;
  const hasAccess = order.status === 'approved' && !order.accessRevoked;
  return (
    <Panel index={index} className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <StatIcon tone={hasAccess ? 'green' : 'purple'}>
            <Icon size={17} />
          </StatIcon>
          <div className="min-w-0">
            <h2>{order.productTitle}</h2>
            <p className="mt-1 text-[12.5px] text-muted">
              <span className={mono}>{order.orderNumber}</span> · {order.amount} USDT (
              {order.network}) · {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <OrderStatusBadge order={order} className="shrink-0" />
      </div>

      {hasAccess && (
        <div className="rounded-[14px] border border-[#4ade8030] bg-[#4ade800d] p-4 text-[13px] leading-[1.6] text-[#c9f5d9]">
          {order.accessUrl ? (
            <>
              Your {order.productType === 'course' ? 'course' : 'e-book'} is ready. If Google asks
              for permission, sign in with <strong>{order.accessEmail}</strong>.
              {order.accessNote && (
                <span className="mt-1 block text-muted">{order.accessNote}</span>
              )}
            </>
          ) : (
            <>
              Approved! We&apos;re sharing it with <strong>{order.accessEmail}</strong> on Google
              Drive — check that inbox.
            </>
          )}
        </div>
      )}
      {order.status === 'submitted' && (
        <p className="text-[13px] leading-[1.6] text-muted">
          We&apos;re verifying your payment. You&apos;ll get an email at your account address as
          soon as it&apos;s approved.
        </p>
      )}
      {order.status === 'awaiting_payment' && (
        <p className="text-[13px] leading-[1.6] text-muted">
          Waiting for your payment. Finish checkout and submit your transaction ID.
        </p>
      )}
      {order.status === 'rejected' && (
        <p className={errorBox}>
          {order.rejectReason ?? 'We could not confirm this payment.'} You can submit the correct
          transaction ID from checkout.
        </p>
      )}
      {order.accessRevoked && (
        <p className={errorBox}>Access was removed. Contact support with your order ID.</p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        {hasAccess && order.accessUrl && (
          <a href={order.accessUrl} target="_blank" rel="noreferrer" className={buttonClass()}>
            Open {order.productType === 'course' ? 'course' : 'e-book'} <ExternalLink size={15} />
          </a>
        )}
        {(order.status === 'awaiting_payment' || order.status === 'rejected') && (
          <Link href={`/checkout/${order.productId}`} className={buttonClass()}>
            {order.status === 'rejected' ? 'Resubmit payment' : 'Continue checkout'}{' '}
            <ArrowRight size={15} />
          </Link>
        )}
        {order.explorerUrl && (
          <a href={order.explorerUrl} target="_blank" rel="noreferrer" className={textLinkClass}>
            View transaction <ExternalLink size={13} />
          </a>
        )}
      </div>
    </Panel>
  );
}

export function MyCourses() {
  const [orders, setOrders] = useState<OrderDto[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    ordersApi
      .list()
      .then(setOrders)
      .catch((e) => setError((e as Error).message));
  }, []);

  return (
    <>
      <PageHeading
        eyebrow="YOUR LEARNING LIBRARY"
        title="My courses"
        description="Your courses and e-books, payment status and access links in one place."
        actions={
          <div className={headingActions}>
            <Link href="/courses" className={buttonClass({ variant: 'secondary' })}>
              Browse courses
            </Link>
            <Link href="/ebooks" className={buttonClass({ variant: 'secondary' })}>
              Browse e-books
            </Link>
          </div>
        }
      />
      {error && (
        <p className={errorBox} role="alert">
          {error}
        </p>
      )}
      {!orders && !error && (
        <p className="text-[13px] text-muted" aria-busy="true">
          Loading your purchases…
        </p>
      )}
      {orders && orders.length === 0 && (
        <Panel className="grid place-items-center gap-4 py-14 text-center">
          <StatIcon tone="purple" className="size-12">
            <GraduationCap size={22} />
          </StatIcon>
          <h2>No purchases yet</h2>
          <p className="max-w-[420px] text-[13.5px] leading-[1.7] text-muted">
            Courses and e-books you buy appear here, with their payment status and access link.
          </p>
          <Link href="/courses" className={buttonClass()}>
            Explore the courses <ArrowRight size={15} />
          </Link>
        </Panel>
      )}
      {orders && orders.length > 0 && (
        <div className={cn('grid gap-4')}>
          {orders.map((order, index) => (
            <OrderCard key={order.id} order={order} index={index} />
          ))}
        </div>
      )}
    </>
  );
}
