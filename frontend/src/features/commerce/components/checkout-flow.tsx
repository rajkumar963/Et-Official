'use client';
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Clock,
  ExternalLink,
  Lock,
  MessageCircle,
} from 'lucide-react';
import {
  networkInfo,
  type CheckoutConfig,
  type OrderDto,
  type PaymentNetwork,
} from '@et-trader/shared';
import { buttonClass, textLinkClass } from '@/components/ui/button';
import { errorBox, form, formGrid, input, label, labelHint } from '@/components/ui/form';
import { eyebrow, mono, surface } from '@/components/ui/styles';
import { getSessionUser } from '@/features/auth/auth.api';
import { ordersApi } from '@/features/commerce/orders.api';
import { cn } from '@/lib/cn';
import { CopyButton } from './copy-button';
import { OrderStatusBadge } from './order-status';

type Step = 'details' | 'pay' | 'review' | 'done';

const stepFor = (order: OrderDto | null, editing: boolean): Step => {
  if (!order || editing) return 'details';
  if (order.status === 'submitted') return 'review';
  if (order.status === 'approved') return 'done';
  return 'pay'; // awaiting_payment or rejected (resubmit)
};

const card = cn(surface, 'rounded-[22px] p-7 max-[560px]:p-5');

function Steps({ step }: { step: Step }) {
  const items: [Step, string][] = [
    ['details', 'Your details'],
    ['pay', 'Pay in USDT'],
    ['review', 'Verification'],
  ];
  const index = step === 'done' ? 3 : items.findIndex(([s]) => s === step);
  return (
    <ol className="mb-8 flex list-none flex-wrap items-center gap-3 text-[12.5px]">
      {items.map(([key, text], i) => (
        <li key={key} className="flex items-center gap-3">
          <span
            className={cn(
              'flex items-center gap-2 rounded-full border px-3 py-1.5 font-semibold',
              i < index && 'border-[#4ade8040] bg-[#4ade8012] text-gain',
              i === index && 'border-[#8b5cf680] bg-[#8b5cf61f] text-white',
              i > index && 'border-line text-dim',
            )}
            aria-current={i === index ? 'step' : undefined}
          >
            <span className={cn(mono, 'text-[11px]')}>{i < index ? '✓' : i + 1}</span> {text}
          </span>
          {i < items.length - 1 && <span className="h-px w-6 bg-line-strong" aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}

function Summary({ config, order }: { config: CheckoutConfig; order: OrderDto | null }) {
  const { product } = config;
  return (
    <aside className={cn(card, 'min-[901px]:sticky min-[901px]:top-[110px]')}>
      <span className={cn(eyebrow, 'text-violet-3')}>ORDER SUMMARY</span>
      <h2 className="mt-3 font-display text-[22px] leading-[1.2] tracking-[-0.03em] text-white">
        {product.title}
      </h2>
      <p className="mt-1 text-[13px] text-muted">
        {product.type === 'course' ? 'Recorded video course · lifetime access' : 'PDF e-book'}
      </p>
      <div className="mt-6 flex items-baseline justify-between border-t border-line pt-5">
        <span className="text-[13px] text-muted">Total</span>
        <strong className={cn(mono, 'text-[28px] font-extrabold text-white')}>
          {product.price} <span className="text-[14px] text-violet-3">USDT</span>
        </strong>
      </div>
      {order && (
        <dl className="mt-5 grid gap-2.5 border-t border-line pt-5 text-[12.5px]">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Order</dt>
            <dd className={cn(mono, 'text-white')}>{order.orderNumber}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Status</dt>
            <dd>
              <OrderStatusBadge order={order} />
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Access for</dt>
            <dd className="truncate text-white">{order.accessEmail}</dd>
          </div>
        </dl>
      )}
      <p className="mt-6 flex gap-2 text-[11.5px] leading-[1.6] text-dim">
        <Lock size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
        Every payment is verified by our team before access is granted. Access is personal and
        can&apos;t be shared.
      </p>
    </aside>
  );
}

function DetailsStep({
  config,
  order,
  onSaved,
  onCancel,
}: {
  config: CheckoutConfig;
  order: OrderDto | null;
  onSaved: (order: OrderDto) => void;
  onCancel?: () => void;
}) {
  const [network, setNetwork] = useState<PaymentNetwork | ''>(
    order?.network ?? (config.networks.length === 1 ? config.networks[0] : ''),
  );
  const [name, setName] = useState(order?.buyerName ?? '');
  const [gmail, setGmail] = useState(order?.accessEmail ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (order) return;
    void getSessionUser().then((user) => {
      if (!user) return;
      // Pre-fill only fields the buyer hasn't typed into yet.
      setName((current) => current || user.name);
      if (user.email.endsWith('@gmail.com')) setGmail((current) => current || user.email);
    });
  }, [order]);

  if (!config.networks.length)
    return (
      <div className={card}>
        <h2 className="font-display text-[22px] text-white">Checkout is temporarily unavailable</h2>
        <p className="mt-3 text-[14px] leading-[1.7] text-muted">
          Online payments are being set up. Please contact us to buy this{' '}
          {config.product.type === 'course' ? 'course' : 'e-book'} — do not send any payment until
          you have the correct address.
        </p>
        <Link href="/contact?topic=courses" className={buttonClass({ className: 'mt-6' })}>
          <MessageCircle size={16} /> Contact us
        </Link>
      </div>
    );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!network) {
      setError('Choose the network you will pay on.');
      return;
    }
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      onSaved(
        await ordersApi.create({
          productId: config.product.id,
          network,
          buyerName: String(data.get('buyerName') ?? ''),
          accessEmail: String(data.get('accessEmail') ?? ''),
          whatsapp: String(data.get('whatsapp') ?? ''),
          telegram: String(data.get('telegram') ?? ''),
        }),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={cn(card, form)} onSubmit={submit}>
      <div>
        <h2 className="font-display text-[22px] tracking-[-0.03em] text-white">Your details</h2>
        <p className="mt-1.5 text-[13.5px] leading-[1.6] text-muted">
          {config.product.type === 'course'
            ? 'The course is shared view-only with this Gmail on Google Drive.'
            : 'Your e-book download link is sent to this Gmail.'}
        </p>
      </div>
      <div className={formGrid}>
        <label className={label}>
          Full name
          <input
            className={input}
            name="buyerName"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className={label}>
          Gmail for access
          <input
            className={input}
            name="accessEmail"
            type="email"
            required
            pattern=".+@gmail\.com"
            title="Use a Gmail address (ends with @gmail.com)"
            placeholder="you@gmail.com"
            autoComplete="email"
            value={gmail}
            onChange={(e) => setGmail(e.target.value)}
          />
        </label>
        <label className={label}>
          <span>
            WhatsApp number <span className={labelHint}>(optional)</span>
          </span>
          <input
            className={input}
            name="whatsapp"
            type="tel"
            maxLength={30}
            placeholder="+91 …"
            defaultValue={order?.whatsapp}
          />
        </label>
        <label className={label}>
          <span>
            Telegram username <span className={labelHint}>(optional)</span>
          </span>
          <input
            className={input}
            name="telegram"
            maxLength={40}
            placeholder="@username"
            defaultValue={order?.telegram}
          />
        </label>
      </div>
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="mb-3 text-[12.5px] font-medium text-[#cdc6dd]">Pay with USDT on</legend>
        <div className="grid grid-cols-3 gap-3 max-[560px]:grid-cols-1">
          {config.networks.map((n) => (
            <label
              key={n}
              className={cn(
                'relative flex cursor-pointer flex-col gap-1 rounded-[14px] border border-line-strong bg-[#0a0a12cc] p-4 transition-colors hover:border-[#a78bfa66]',
                'has-[input:checked]:border-violet has-[input:checked]:bg-[#8b5cf61a] has-[input:checked]:shadow-[0_0_0_1px_var(--color-violet)] has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-violet-2',
              )}
            >
              <input
                type="radio"
                name="network"
                value={n}
                checked={network === n}
                onChange={() => setNetwork(n)}
                className="pointer-events-none absolute opacity-0"
              />
              <span className={cn(mono, 'text-[15px] font-bold text-white')}>USDT · {n}</span>
              <span className="text-[12px] text-muted">{networkInfo[n].chain}</span>
            </label>
          ))}
        </div>
        <p className="mt-2.5 text-[12px] text-dim">
          Choose the same network in your wallet or exchange when you send.
        </p>
      </fieldset>
      {error && (
        <p className={errorBox} role="alert">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {onCancel ? (
          <button type="button" className={textLinkClass} onClick={onCancel}>
            <ArrowLeft size={14} /> Back to payment
          </button>
        ) : (
          <Link
            href={config.product.type === 'course' ? '/courses' : '/ebooks'}
            className={textLinkClass}
          >
            <ArrowLeft size={14} /> Back
          </Link>
        )}
        <button className={buttonClass()} disabled={busy}>
          {busy ? 'Saving…' : 'Continue to payment'} <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}

function PayStep({
  order,
  onSubmitted,
  onEdit,
}: {
  order: OrderDto;
  onSubmitted: (order: OrderDto) => void;
  onEdit: () => void;
}) {
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const info = networkInfo[order.network];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      onSubmitted(await ordersApi.submitPayment(order.orderNumber, txHash.trim()));
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-5">
      {order.status === 'rejected' && (
        <div className={errorBox} role="alert">
          <strong className="block text-[13px]">We couldn&apos;t confirm your last payment.</strong>
          {order.rejectReason}
          <span className="mt-1 block">If you paid, submit the correct transaction ID below.</span>
        </div>
      )}
      <section className={card}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-[22px] tracking-[-0.03em] text-white">
              Send exactly {order.amount} USDT
            </h2>
            <p className="mt-1.5 text-[13.5px] text-muted">
              On the <strong className="text-white">{order.network}</strong> network ({info.chain})
              to the address below.
            </p>
          </div>
          <button type="button" className={textLinkClass} onClick={onEdit}>
            Change network or details
          </button>
        </div>

        <div className="mt-6 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-6 max-[640px]:grid-cols-1">
          <div className="grid place-items-center rounded-[16px] bg-white p-3 max-[640px]:mx-auto">
            <QRCodeSVG value={order.walletAddress} size={152} level="M" />
          </div>
          <div className="grid min-w-0 gap-4">
            <div>
              <span className={cn(eyebrow, 'text-muted')}>AMOUNT</span>
              <div className="mt-1.5 flex items-center gap-3">
                <strong className={cn(mono, 'text-[26px] font-extrabold text-white')}>
                  {order.amount} USDT
                </strong>
                <CopyButton value={String(order.amount)} label="Copy amount" />
              </div>
            </div>
            <div>
              <span className={cn(eyebrow, 'text-muted')}>{order.network} ADDRESS</span>
              <div className="mt-1.5 flex items-center gap-3 rounded-[12px] border border-line-strong bg-[#0a0a12cc] p-3">
                <code className={cn(mono, 'min-w-0 flex-1 text-[13px] break-all text-[#ece8f6]')}>
                  {order.walletAddress}
                </code>
                <CopyButton value={order.walletAddress} label="Copy" />
              </div>
            </div>
          </div>
        </div>

        <ul className="mt-6 grid list-none gap-2 rounded-[14px] border border-[#fbbf2433] bg-[#fbbf240d] p-4 text-[12.5px] leading-[1.6] text-[#f3dfa8]">
          {[
            `Send only USDT on ${order.network}. Funds sent on another network or token can't be recovered.`,
            'Send the exact amount. Your exchange may deduct a fee — make sure the full amount arrives.',
            'The QR code contains only the address; enter the amount yourself.',
          ].map((text) => (
            <li key={text} className="flex gap-2">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
      </section>

      <form className={cn(card, form)} onSubmit={submit}>
        <div>
          <h2 className="font-display text-[20px] tracking-[-0.03em] text-white">
            Already paid? Submit your transaction ID
          </h2>
          <p className="mt-1.5 text-[13.5px] leading-[1.6] text-muted">
            Find it in your wallet or exchange withdrawal history (also called TxID or hash).
            We&apos;ll verify it and email you as soon as your access is ready.
          </p>
        </div>
        <label className={label}>
          Transaction ID (TxID)
          <input
            className={cn(input, mono, 'text-[13px]')}
            name="txHash"
            required
            minLength={10}
            maxLength={100}
            spellCheck={false}
            autoComplete="off"
            placeholder={order.network === 'TRC20' ? '64-character hash' : '0x…'}
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
          />
        </label>
        {error && (
          <p className={errorBox} role="alert">
            {error}
          </p>
        )}
        <button className={buttonClass({ fullWidth: true })} disabled={busy || !txHash.trim()}>
          {busy ? 'Submitting…' : 'Submit payment for verification'} <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}

function ReviewStep({ order }: { order: OrderDto }) {
  return (
    <section className={cn(card, 'text-center')}>
      <span className="mx-auto grid size-14 place-items-center rounded-[16px] border border-[#fbbf2455] bg-[#fbbf241a] text-amber">
        <Clock size={26} aria-hidden="true" />
      </span>
      <h2 className="mt-5 font-display text-[26px] tracking-[-0.03em] text-white">
        Payment submitted — under review
      </h2>
      <p className="mx-auto mt-3 max-w-[480px] text-[14px] leading-[1.7] text-muted">
        Our team is verifying your transaction on the blockchain. We&apos;ve emailed you a
        confirmation, and you&apos;ll get another email the moment your access is approved. Please
        don&apos;t pay again for this order.
      </p>
      {order.explorerUrl && (
        <a
          href={order.explorerUrl}
          target="_blank"
          rel="noreferrer"
          className={cn(textLinkClass, 'mt-5')}
        >
          View your transaction <ExternalLink size={13} />
        </a>
      )}
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/dashboard/courses" className={buttonClass()}>
          Go to My courses <ArrowRight size={16} />
        </Link>
        <Link href="/" className={buttonClass({ variant: 'secondary' })}>
          Back to home
        </Link>
      </div>
    </section>
  );
}

function DoneStep({ order }: { order: OrderDto }) {
  return (
    <section className={cn(card, 'text-center')}>
      <span className="mx-auto grid size-14 place-items-center rounded-[16px] border border-[#4ade8055] bg-[#4ade801a] text-gain">
        <BadgeCheck size={26} aria-hidden="true" />
      </span>
      <h2 className="mt-5 font-display text-[26px] tracking-[-0.03em] text-white">
        {order.accessRevoked ? 'Access removed' : 'You already own this'}
      </h2>
      <p className="mx-auto mt-3 max-w-[480px] text-[14px] leading-[1.7] text-muted">
        {order.accessRevoked
          ? 'Access for this order has been removed. Please contact support with your order ID.'
          : `Your payment was approved. The ${order.productType === 'course' ? 'course' : 'e-book'} is shared with ${order.accessEmail}.`}
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {order.accessUrl && (
          <a href={order.accessUrl} target="_blank" rel="noreferrer" className={buttonClass()}>
            Open {order.productTitle} <ExternalLink size={15} />
          </a>
        )}
        <Link href="/dashboard/courses" className={buttonClass({ variant: 'secondary' })}>
          My courses
        </Link>
      </div>
    </section>
  );
}

export function CheckoutFlow({ productId }: { productId: string }) {
  const [config, setConfig] = useState<CheckoutConfig | null>(null);
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    ordersApi
      .checkout(productId)
      .then((data) => {
        setConfig(data);
        setOrder(data.existingOrder);
      })
      .catch((e) => setError((e as Error).message));
  }, [productId]);

  if (error)
    return (
      <div className={card}>
        <p className={errorBox} role="alert">
          {error}
        </p>
      </div>
    );
  if (!config)
    return (
      <p className="py-24 text-center text-[14px] text-muted" aria-busy="true">
        Preparing secure checkout…
      </p>
    );

  const step = stepFor(order, editing);
  return (
    <>
      <span className={cn(eyebrow, 'text-violet-3')}>SECURE USDT CHECKOUT</span>
      <h1 className="mt-3 mb-6 font-display text-[length:clamp(30px,4vw,44px)] leading-[1.1] tracking-[-0.04em] text-white">
        {step === 'done' ? config.product.title : `Buy ${config.product.title}`}
      </h1>
      <Steps step={step} />
      <div className="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-8 max-[900px]:grid-cols-1">
        <div className="min-w-0">
          {step === 'details' && (
            <DetailsStep
              config={config}
              order={order}
              onSaved={(saved) => {
                setOrder(saved);
                setEditing(false);
              }}
              onCancel={order ? () => setEditing(false) : undefined}
            />
          )}
          {step === 'pay' && order && (
            <PayStep order={order} onSubmitted={setOrder} onEdit={() => setEditing(true)} />
          )}
          {step === 'review' && order && <ReviewStep order={order} />}
          {step === 'done' && order && <DoneStep order={order} />}
        </div>
        <Summary config={config} order={order} />
      </div>
    </>
  );
}
