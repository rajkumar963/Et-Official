'use client';
import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { AlertTriangle, Check, RotateCcw, ShieldOff, X } from 'lucide-react';
import { networkInfo, rejectOrderSchema, type AdminOrderDto } from '@et-trader/shared';
import { adminService } from '@/features/admin/admin.api';
import { Modal } from '@/components/ui/modal';
import { buttonClass, textLinkClass } from '@/components/ui/button';
import { errorBox, formFooter, label, textarea } from '@/components/ui/form';
import { mono, tone } from '@/components/ui/styles';
import { cn } from '@/lib/cn';
import { CopyButton, StatusBadge, TxHash, dateTime, usdt } from './order-ui';

export type DetailMode = 'view' | 'approve' | 'reject';

const dialogFooter = cn(formFooter, 'flex-wrap');

export const successBox =
  'rounded-[11px] border border-[#4ade8040] bg-[#4ade8012] px-[13px] py-[11px] text-[12.5px] text-[#a7e8bf]';

function Field({
  name,
  children,
  wide = false,
}: {
  name: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-[13px] border border-[#ffffff09] bg-[#ffffff05] p-[13px]',
        wide && 'col-span-full',
      )}
    >
      <small className="text-[11px] text-muted">{name}</small>
      <div className="mt-1 text-[13px] wrap-anywhere text-[#e2dfee]">{children}</div>
    </div>
  );
}

const dash = <span className="text-dim">—</span>;

/** Every field of an order, used by the detail modal and the email review page. */
export function OrderFields({ order, portal = true }: { order: AdminOrderDto; portal?: boolean }) {
  return (
    <div className="grid w-full grid-cols-2 gap-2.5 max-[700px]:grid-cols-1">
      <Field name="Product">
        {order.productTitle} <span className="text-[11px] text-muted">({order.productType})</span>
      </Field>
      <Field name="Amount">
        <span className={cn(mono, 'font-semibold')}>{usdt(order.amount)}</span>{' '}
        <span className="text-[11px] text-muted">
          via {order.network} · {networkInfo[order.network]?.chain}
        </span>
      </Field>
      <Field name="Buyer name">{order.buyerName}</Field>
      <Field name="Account">
        {order.user ? (
          <>
            {order.user.name}
            <span className="block text-[12px] text-muted">{order.user.email}</span>
          </>
        ) : (
          <span className="text-dim">Account deleted</span>
        )}
      </Field>
      <Field name="Gmail for access">
        <span className="inline-flex max-w-full items-center gap-1">
          <span className={cn(mono, 'text-[12px] wrap-anywhere')}>{order.accessEmail}</span>
          <CopyButton value={order.accessEmail} label="Copy Gmail" />
        </span>
      </Field>
      <Field name="WhatsApp / Telegram">
        {order.whatsapp || order.telegram ? (
          <>
            {order.whatsapp && <span className="block">WhatsApp: {order.whatsapp}</span>}
            {order.telegram && <span className="block">Telegram: {order.telegram}</span>}
          </>
        ) : (
          dash
        )}
      </Field>
      <Field name="Wallet address paid to" wide>
        <span className="inline-flex max-w-full items-center gap-1">
          <span className={cn(mono, 'text-[12px] wrap-anywhere')}>{order.walletAddress}</span>
          <CopyButton value={order.walletAddress} label="Copy wallet address" />
        </span>
      </Field>
      <Field name="Transaction hash" wide>
        <TxHash order={order} full />
      </Field>
      <Field name="Created">{dateTime(order.createdAt)}</Field>
      <Field name="Submitted">{dateTime(order.submittedAt)}</Field>
      <Field name="Reviewed">{dateTime(order.reviewedAt)}</Field>
      <Field name="Reviewed by">{order.reviewedBy || dash}</Field>
      {order.rejectReason && (
        <Field name="Reject reason" wide>
          <span className="whitespace-pre-wrap text-[#ffadb5]">{order.rejectReason}</span>
        </Field>
      )}
      <Field name="Configured access link" wide>
        {order.accessUrl ? (
          <a
            href={order.accessUrl}
            target="_blank"
            rel="noreferrer"
            className="text-violet-3 wrap-anywhere hover:text-white"
          >
            {order.accessUrl}
          </a>
        ) : (
          <span className="text-amber">
            Not set for this product yet
            {portal && (
              <>
                {' · '}
                <Link href="/admin/products" className="underline">
                  Set it under Course access
                </Link>
              </>
            )}
          </span>
        )}
        {order.accessNote && (
          <span className="mt-1 block text-[12px] text-muted">{order.accessNote}</span>
        )}
      </Field>
    </div>
  );
}

/** Warning shown before approving a product that has no access link configured. */
export function MissingAccessWarning() {
  return (
    <p className="flex items-start gap-2 rounded-[11px] border border-[#fbbf2440] bg-[#fbbf2412] px-[13px] py-[11px] text-[12.5px] text-[#fde68a]">
      <AlertTriangle size={15} className="mt-px shrink-0" />
      <span>
        No access link is configured for this product, so the approval email won&apos;t include one.
        Add it under Course access before or right after approving.
      </span>
    </p>
  );
}

export function OrderDetail({
  order: initial,
  initialMode = 'view',
  onClose,
  onChanged,
}: {
  order: AdminOrderDto;
  initialMode?: DetailMode;
  onClose: () => void;
  onChanged: (order: AdminOrderDto) => void;
}) {
  const [order, setOrder] = useState(initial);
  const [mode, setMode] = useState<DetailMode>(
    initial.status === 'submitted' ? initialMode : 'view',
  );
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  async function run(action: () => Promise<AdminOrderDto>, message: string) {
    setBusy(true);
    setError('');
    setDone('');
    try {
      const updated = await action();
      setOrder(updated);
      setMode('view');
      setReason('');
      setDone(message);
      onChanged(updated);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function reject() {
    const parsed = rejectOrderSchema.safeParse({ reason });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Enter a reason (3–500 characters).');
      return;
    }
    void run(
      () => adminService.reject(order.id, parsed.data.reason),
      'Rejected — the buyer was emailed your reason.',
    );
  }

  const switchMode = (next: DetailMode) => {
    setError('');
    setDone('');
    setMode(next);
  };

  return (
    <Modal title={`Order ${order.orderNumber}`} onClose={onClose}>
      <div className="flex flex-col gap-[18px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusBadge order={order} />
          {order.user && (
            <Link
              href={`/admin/users?q=${encodeURIComponent(order.user.email)}`}
              className={textLinkClass}
            >
              View buyer account
            </Link>
          )}
        </div>
        {done && (
          <p className={successBox} role="status">
            {done}
          </p>
        )}
        <OrderFields order={order} />

        {mode === 'approve' && (
          <div className="flex flex-col gap-3 rounded-[16px] border border-[#4ade8030] bg-[#4ade800a] p-4">
            <strong className="font-display text-[15px]">Approve this payment?</strong>
            <p className="text-[12.5px] text-muted">
              Confirm you received <span className={cn(mono, 'text-fg')}>{usdt(order.amount)}</span>{' '}
              on {order.network} for this transaction. The buyer gets access and an email with the
              access link.
            </p>
            {!order.accessUrl && <MissingAccessWarning />}
          </div>
        )}
        {mode === 'reject' && (
          <label className={label}>
            Reason for rejecting (emailed to the buyer)
            <textarea
              className={textarea}
              rows={3}
              maxLength={500}
              value={reason}
              autoFocus
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
      </div>

      <div className={dialogFooter}>
        {mode === 'approve' && (
          <>
            <button
              className={buttonClass({ variant: 'secondary' })}
              onClick={() => switchMode('view')}
            >
              Back
            </button>
            <button
              className={buttonClass()}
              disabled={busy}
              onClick={() =>
                run(
                  () => adminService.approve(order.id),
                  'Approved — the buyer has been emailed their access.',
                )
              }
            >
              <Check size={16} /> {busy ? 'Approving…' : 'Confirm approval'}
            </button>
          </>
        )}
        {mode === 'reject' && (
          <>
            <button
              className={buttonClass({ variant: 'secondary' })}
              onClick={() => switchMode('view')}
            >
              Back
            </button>
            <button
              className={buttonClass({ variant: 'destructive' })}
              disabled={busy}
              onClick={reject}
            >
              <X size={16} /> {busy ? 'Rejecting…' : 'Reject payment'}
            </button>
          </>
        )}
        {mode === 'view' && (
          <>
            {(order.status === 'awaiting_payment' || order.status === 'rejected') && (
              <span className={cn('mr-auto text-[12px]', tone.muted)}>
                {order.status === 'awaiting_payment'
                  ? 'Waiting for the buyer to submit a transaction ID.'
                  : 'This order was rejected.'}
              </span>
            )}
            <button className={buttonClass({ variant: 'secondary' })} onClick={onClose}>
              Close
            </button>
            {order.status === 'submitted' && (
              <>
                <button
                  className={buttonClass({ variant: 'destructive' })}
                  onClick={() => switchMode('reject')}
                >
                  <X size={16} /> Reject
                </button>
                <button className={buttonClass()} onClick={() => switchMode('approve')}>
                  <Check size={16} /> Approve
                </button>
              </>
            )}
            {order.status === 'approved' &&
              (order.accessRevoked ? (
                <button
                  className={buttonClass()}
                  disabled={busy}
                  onClick={() =>
                    run(() => adminService.restore(order.id), 'Access restored for this buyer.')
                  }
                >
                  <RotateCcw size={15} /> {busy ? 'Restoring…' : 'Restore access'}
                </button>
              ) : (
                <button
                  className={buttonClass({ variant: 'destructive' })}
                  disabled={busy}
                  onClick={() =>
                    run(() => adminService.revoke(order.id), 'Access removed for this buyer.')
                  }
                >
                  <ShieldOff size={15} /> {busy ? 'Removing…' : 'Remove access'}
                </button>
              ))}
          </>
        )}
      </div>
    </Modal>
  );
}
