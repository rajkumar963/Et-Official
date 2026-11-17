'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, CircleCheck, CircleX, LinkIcon, X } from 'lucide-react';
import { rejectOrderSchema, type ReviewDto } from '@et-trader/shared';
import { reviewService } from '@/features/admin/admin.api';
import { ApiError } from '@/lib/api-client';
import { AmbientBackdrop } from '@/components/effects/ambient-backdrop';
import { Brand } from '@/components/ui/brand';
import { buttonClass } from '@/components/ui/button';
import { errorBox, label, textarea } from '@/components/ui/form';
import { eyebrow, mono, surface } from '@/components/ui/styles';
import { cn } from '@/lib/cn';
import { MissingAccessWarning, OrderFields } from './order-detail';
import { Loading, StatusBadge, usdt } from './order-ui';

type LinkProblem = 'invalid' | 'expired';

function Problem({ kind, message }: { kind: LinkProblem; message?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <span className="grid size-14 place-items-center rounded-[18px] border border-[#fbbf2440] bg-[#fbbf2414] text-amber">
        <LinkIcon size={24} />
      </span>
      <h1 className="font-display text-[24px] font-bold tracking-[-0.04em]">
        {kind === 'expired' ? 'This review link has expired' : 'This review link is not valid'}
      </h1>
      <p className="max-w-[420px] text-[13px] text-muted">
        {message ||
          (kind === 'expired'
            ? 'For safety, review links only work for a limited time.'
            : 'It may have been used already, or the address is incomplete.')}{' '}
        You can still review the order from the admin portal after signing in.
      </p>
      <Link href="/admin/orders?status=submitted" className={buttonClass()}>
        Open admin orders <ArrowUpRight size={15} />
      </Link>
    </div>
  );
}

export function ReviewView({ token }: { token: string }) {
  const [review, setReview] = useState<ReviewDto | null>(null);
  const [problem, setProblem] = useState<{ kind: LinkProblem; message?: string } | null>(null);
  const [loadError, setLoadError] = useState('');
  const [mode, setMode] = useState<'choose' | 'reject'>('choose');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<'approved' | 'rejected' | null>(null);

  useEffect(() => {
    let cancelled = false;
    reviewService
      .get(token)
      .then((data) => {
        if (!cancelled) setReview(data);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        if (e instanceof ApiError && (e.status === 404 || e.status === 410)) {
          setProblem({ kind: e.status === 410 ? 'expired' : 'invalid' });
        } else {
          setLoadError((e as Error).message);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function act(action: 'approve' | 'reject') {
    setError('');
    let rejectReason = '';
    if (action === 'reject') {
      const parsed = rejectOrderSchema.safeParse({ reason });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message || 'Enter a reason (3–500 characters).');
        return;
      }
      rejectReason = parsed.data.reason;
    }
    setBusy(true);
    try {
      const updated =
        action === 'approve'
          ? await reviewService.approve(token)
          : await reviewService.reject(token, rejectReason);
      setReview(updated);
      setResult(action === 'approve' ? 'approved' : 'rejected');
    } catch (e) {
      if (e instanceof ApiError && (e.status === 404 || e.status === 410)) {
        setProblem({ kind: e.status === 410 ? 'expired' : 'invalid', message: e.message });
      } else {
        setError((e as Error).message);
      }
    } finally {
      setBusy(false);
    }
  }

  const order = review?.order;

  return (
    <div className="relative isolate min-h-screen px-4 py-8 max-[700px]:py-5">
      <AmbientBackdrop />
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <Brand />
          <span className={cn(eyebrow, 'text-amber')}>PAYMENT REVIEW</span>
        </div>
        <section className={cn(surface, 'p-7 max-[700px]:rounded-2xl max-[700px]:p-4')}>
          {problem ? (
            <Problem kind={problem.kind} message={problem.message} />
          ) : loadError ? (
            <div className="flex flex-col items-start gap-3">
              <p className={cn(errorBox, 'w-full')} role="alert">
                {loadError}
              </p>
              <button
                className={buttonClass({ variant: 'secondary', size: 'sm' })}
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
          ) : !order ? (
            <Loading label="Loading order…" />
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <span className={cn(eyebrow, 'text-violet-3')}>ORDER {order.orderNumber}</span>
                  <h1 className="mt-1.5 font-display text-[26px] leading-[1.15] font-bold tracking-[-0.04em] max-[700px]:text-[21px]">
                    {order.productTitle}
                  </h1>
                  <p className={cn(mono, 'mt-1 text-[15px] font-semibold text-fg')}>
                    {usdt(order.amount)}{' '}
                    <span className="text-[12px] font-normal text-muted">on {order.network}</span>
                  </p>
                </div>
                <StatusBadge order={order} />
              </div>

              {result && (
                <div
                  className={cn(
                    'flex items-start gap-3 rounded-[16px] border p-4',
                    result === 'approved'
                      ? 'border-[#4ade8040] bg-[#4ade8012] text-[#a7e8bf]'
                      : 'border-[#ff5c6c40] bg-[#ff5c6c12] text-[#ffadb5]',
                  )}
                  role="status"
                >
                  {result === 'approved' ? (
                    <CircleCheck size={22} className="shrink-0" />
                  ) : (
                    <CircleX size={22} className="shrink-0" />
                  )}
                  <div>
                    <strong className="block font-display text-[16px]">
                      {result === 'approved' ? 'Approved' : 'Rejected'}
                    </strong>
                    <span className="text-[13px]">
                      {result === 'approved'
                        ? 'The buyer has been emailed their access.'
                        : 'The buyer was emailed your reason.'}
                    </span>
                  </div>
                </div>
              )}

              {!result && !review.actionable && (
                <p className="rounded-[11px] border border-line bg-[#ffffff06] px-[13px] py-[11px] text-[12.5px] text-muted">
                  {order.status === 'submitted'
                    ? 'This link can no longer be used. Review the order from the admin portal.'
                    : 'This order has already been reviewed — no action is needed.'}
                </p>
              )}

              <OrderFields order={order} portal={false} />

              {review.actionable && !result && (
                <div className="flex flex-col gap-4 border-t border-line pt-5">
                  {!order.accessUrl && <MissingAccessWarning />}
                  {mode === 'reject' && (
                    <label className={label}>
                      Reason for rejecting (emailed to the buyer)
                      <textarea
                        className={textarea}
                        rows={3}
                        maxLength={500}
                        autoFocus
                        value={reason}
                        placeholder="e.g. We couldn't find this transaction on the network. Please check the hash."
                        onChange={(e) => setReason(e.target.value)}
                      />
                    </label>
                  )}
                  {error && (
                    <p className={errorBox} role="alert">
                      {error}
                    </p>
                  )}
                  {mode === 'choose' ? (
                    <div className="grid grid-cols-[2fr_1fr] gap-3 max-[700px]:grid-cols-1">
                      <button
                        className={buttonClass({
                          fullWidth: true,
                          className: 'py-[15px] text-[15px]',
                        })}
                        disabled={busy}
                        onClick={() => act('approve')}
                      >
                        <Check size={18} /> {busy ? 'Approving…' : 'Approve payment'}
                      </button>
                      <button
                        className={buttonClass({
                          variant: 'destructive',
                          fullWidth: true,
                          className: 'py-[15px] text-[15px]',
                        })}
                        disabled={busy}
                        onClick={() => {
                          setError('');
                          setMode('reject');
                        }}
                      >
                        <X size={18} /> Reject
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap justify-end gap-2.5">
                      <button
                        className={buttonClass({ variant: 'secondary' })}
                        onClick={() => {
                          setError('');
                          setMode('choose');
                        }}
                      >
                        Back
                      </button>
                      <button
                        className={buttonClass({ variant: 'destructive' })}
                        disabled={busy}
                        onClick={() => act('reject')}
                      >
                        <X size={16} /> {busy ? 'Rejecting…' : 'Reject payment'}
                      </button>
                    </div>
                  )}
                  <p className="text-[11.5px] text-muted">
                    Check the transaction on the block explorer before approving. This link works
                    once.
                  </p>
                </div>
              )}

              <div className="flex justify-end border-t border-line pt-4">
                <Link
                  href="/admin/orders"
                  className="text-[12px] font-semibold text-violet-3 hover:text-white"
                >
                  Open admin portal →
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
