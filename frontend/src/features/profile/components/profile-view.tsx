'use client';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Camera,
  Check,
  GraduationCap,
  Loader2,
  Mail,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import type { OrderDto } from '@et-trader/shared';
import { PageHeading } from '@/components/ui/page-heading';
import { Panel, PanelHeader } from '@/components/ui/panel';
import { Badge } from '@/components/ui/badge';
import { buttonClass } from '@/components/ui/button';
import { errorBox, formFooter, formGrid, input, label, labelHint } from '@/components/ui/form';
import { note, tone as toneText } from '@/components/ui/styles';
import { StatCard, StatIcon } from '@/components/ui/stat-card';
import { Avatar } from '@/features/journal/components/avatar';
import { useJournal } from '@/features/journal/journal-provider';
import { ordersApi } from '@/features/commerce/orders.api';
import { updateProfile } from '@/features/profile/profile.api';
import { fileToAvatarDataUrl } from '@/features/profile/resize-image';
import { money, signedMoney } from '@/lib/format';
import { cn } from '@/lib/cn';

const panelPad = 'p-[26px] max-[1200px]:p-[26px] max-[700px]:p-[18px]';

function memberSince(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function ProfileView() {
  const { user, summary, refresh } = useJournal();
  const fileRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);

  const [orders, setOrders] = useState<OrderDto[] | null>(null);
  useEffect(() => {
    ordersApi
      .list()
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);

  const owned = useMemo(
    () => (orders ?? []).filter((o) => o.status === 'approved' && !o.accessRevoked),
    [orders],
  );

  if (!user) return null;

  const initials = user.name.slice(0, 2).toUpperCase();
  const start = user.startingBalance || 0;
  const pnl = summary?.totalPnl ?? 0;

  async function saveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setSaved(false);
    setError('');
    const data = new FormData(event.currentTarget);
    try {
      await updateProfile({ name: String(data.get('name')) });
      await refresh();
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onPhotoPicked(file: File | undefined) {
    if (!file) return;
    setError('');
    setPhotoBusy(true);
    try {
      const image = await fileToAvatarDataUrl(file);
      await updateProfile({ image });
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPhotoBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function removePhoto() {
    setError('');
    setPhotoBusy(true);
    try {
      await updateProfile({ image: '' });
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPhotoBusy(false);
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="THE PERSON BEHIND THE PROCESS"
        title="Your Profile"
        description="Your photo, account details and everything you own — all in one place."
      />

      {/* Identity card */}
      <Panel index={0} className={panelPad}>
        <div className="flex items-center gap-5 max-[560px]:flex-col max-[560px]:text-center">
          <div className="relative shrink-0">
            <Avatar large image={user.image} title={user.name} className="size-[92px] text-[28px]">
              {initials}
            </Avatar>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={photoBusy}
              aria-label="Change photo"
              className="absolute -right-1 -bottom-1 grid size-9 place-items-center rounded-full border border-[#c4b5fd55] bg-[linear-gradient(135deg,#8b5cf6,#6d28d9)] text-white shadow-[0_4px_18px_#7c3aed77] transition-transform hover:scale-105 disabled:opacity-60"
            >
              {photoBusy ? (
                <Loader2 size={16} className="animate-[spin_0.8s_linear_infinite]" />
              ) : (
                <Camera size={16} />
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => onPhotoPicked(e.target.files?.[0])}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5 max-[560px]:justify-center">
              <h2 className="font-display text-[22px] font-semibold tracking-[-0.02em]">
                {user.name}
              </h2>
              {user.isAdmin && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#a78bfa40] bg-[#8b5cf61c] px-2.5 py-1 text-[11px] font-semibold text-violet-3">
                  <ShieldCheck size={13} /> Admin
                </span>
              )}
            </div>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-muted max-[560px]:justify-center">
              <span className="inline-flex items-center gap-1.5">
                <Mail size={13} /> {user.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck size={13} /> Member since {memberSince(user.createdAt)}
              </span>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 max-[560px]:justify-center">
              <button
                type="button"
                className={buttonClass({ variant: 'secondary', size: 'sm' })}
                onClick={() => fileRef.current?.click()}
                disabled={photoBusy}
              >
                <Camera size={15} /> {user.image ? 'Change photo' : 'Upload photo'}
              </button>
              {user.image && (
                <button
                  type="button"
                  className={buttonClass({ variant: 'destructive', size: 'sm' })}
                  onClick={removePhoto}
                  disabled={photoBusy}
                >
                  <Trash2 size={15} /> Remove
                </button>
              )}
            </div>
            <p className={cn(note, 'mt-2 max-[560px]:text-center')}>
              Square photos look best. We resize it to a small thumbnail automatically.
            </p>
          </div>
        </div>
      </Panel>

      {/* At-a-glance stats */}
      <div className="grid grid-cols-3 gap-3.5 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1">
        <StatCard
          index={0}
          label="ACCOUNT BALANCE"
          icon={Wallet}
          tone="cyan"
          value={money(start + pnl)}
          sub={`Starting ${money(start)}`}
        />
        <StatCard
          index={1}
          label="TOTAL P&L"
          icon={TrendingUp}
          tone={pnl >= 0 ? 'green' : 'red'}
          valueTone={pnl >= 0 ? 'green' : 'red'}
          value={signedMoney(pnl)}
          sub={`${summary?.totalTrades ?? 0} trades logged`}
        />
        <StatCard
          index={2}
          label="COURSES OWNED"
          icon={GraduationCap}
          tone="purple"
          value={owned.length}
          sub={orders ? `${orders.length} total orders` : 'Loading…'}
        />
      </div>

      {/* Editable name */}
      <Panel index={1} className={panelPad}>
        <form onSubmit={saveName}>
          <PanelHeader>
            <div>
              <h2>Profile details</h2>
              <p>Update how your name appears across the app.</p>
            </div>
          </PanelHeader>
          <div className={formGrid}>
            <label className={label}>
              Full name
              <input
                className={input}
                name="name"
                required
                minLength={2}
                maxLength={80}
                defaultValue={user.name}
              />
            </label>
            <label className={label}>
              Email address
              <input className={input} value={user.email} disabled readOnly />
              <small className={labelHint}>Your sign-in identity · can’t be changed</small>
            </label>
          </div>
          {error && (
            <p className={cn(errorBox, 'mt-4')} role="alert">
              {error}
            </p>
          )}
          <div className={formFooter}>
            {saved && (
              <span
                className={cn(
                  toneText.green,
                  'flex animate-[rise_0.4s_var(--ease-smooth)_both] items-center gap-1.5 text-[13px]',
                )}
                role="status"
              >
                <Check size={17} /> Saved
              </span>
            )}
            <Link
              href="/dashboard/settings"
              className={buttonClass({ variant: 'secondary', size: 'sm' })}
            >
              More settings
            </Link>
            <button className={buttonClass()} disabled={busy}>
              {busy ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </Panel>

      {/* Courses / library */}
      <Panel index={2} className={panelPad}>
        <PanelHeader>
          <div>
            <h2>
              <span className="mr-2.5 inline-grid size-[34px] place-items-center rounded-[11px] border border-[#a78bfa33] bg-[#8b5cf61c] align-middle text-violet-3">
                <GraduationCap size={17} />
              </span>
              Your courses &amp; e-books
            </h2>
            <p>Everything you’ve unlocked on ET Official.</p>
          </div>
          <Link href="/dashboard/courses" className={buttonClass({ variant: 'secondary', size: 'sm' })}>
            View all <ArrowRight size={15} />
          </Link>
        </PanelHeader>

        {!orders && (
          <p className="mt-4 text-[13px] text-muted" aria-busy="true">
            Loading your library…
          </p>
        )}

        {orders && owned.length === 0 && (
          <div className="mt-4 grid place-items-center gap-3 rounded-[16px] border border-dashed border-line py-10 text-center">
            <StatIcon tone="purple" className="size-11">
              <GraduationCap size={20} />
            </StatIcon>
            <p className="text-[13.5px] text-muted">
              You don’t own any courses yet.
            </p>
            <Link href="/courses" className={buttonClass({ size: 'sm' })}>
              Explore courses <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {orders && owned.length > 0 && (
          <ul className="mt-4 grid gap-3">
            {owned.map((order) => {
              const Icon = order.productType === 'course' ? GraduationCap : BookOpen;
              return (
                <li
                  key={order.id}
                  className="flex items-center justify-between gap-4 rounded-[14px] border border-[#4ade8022] bg-[#4ade8008] p-4"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <StatIcon tone="green">
                      <Icon size={17} />
                    </StatIcon>
                    <div className="min-w-0">
                      <strong className="block truncate text-[14px]">{order.productTitle}</strong>
                      <span className="text-[12px] text-muted">
                        {order.productType === 'course' ? 'Course' : 'E-book'} ·{' '}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {order.accessUrl ? (
                    <a
                      href={order.accessUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonClass({ size: 'sm' })}
                    >
                      Open <ArrowRight size={14} />
                    </a>
                  ) : (
                    <Badge tone="gain">Shared via email</Badge>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </>
  );
}
