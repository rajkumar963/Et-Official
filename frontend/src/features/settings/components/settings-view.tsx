'use client';
import { useState, type FormEvent } from 'react';
import { ShieldCheck, Wallet, UserRound, Check } from 'lucide-react';
import { useJournal } from '@/features/journal/journal-provider';
import { updateSettings } from '@/features/settings/settings.api';
import { PageHeading } from '@/components/ui/page-heading';
import { Panel, PanelHeader } from '@/components/ui/panel';
import { Badge } from '@/components/ui/badge';
import { buttonClass } from '@/components/ui/button';
import { errorBox, formFooter, formGrid, input, label, labelHint } from '@/components/ui/form';
import { note, tone } from '@/components/ui/styles';
import { Avatar } from '@/features/journal/components/avatar';
import { cn } from '@/lib/cn';
/** Settings panels use roomier padding than regular panels (previously .settings-form > .panel). */
const panelPad = 'p-[26px] max-[1200px]:p-[26px] max-[700px]:p-[18px]';
/** Tinted icon tile beside a section title (previously .section-icon). */
const sectionIcon = (green = false) =>
  cn(
    'inline-grid size-[34px] place-items-center rounded-[11px] border',
    green
      ? 'border-[#4ade8030] bg-[#4ade8014] text-gain'
      : 'border-[#a78bfa33] bg-[#8b5cf61c] text-violet-3',
  );
export function SettingsView() {
  const { user, refresh } = useJournal();
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!user) return null;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setSaved(false);
    setError('');
    const data = new FormData(event.currentTarget);
    try {
      await updateSettings({
        name: String(data.get('name')),
        startingBalance: Number(data.get('startingBalance')),
      });
      await refresh();
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="MAKE THIS SPACE YOURS"
        title="Account Settings"
        description="Manage your profile and the foundation of your journal."
      />
      <form className="flex w-full max-w-[900px] flex-col gap-[18px]" onSubmit={submit}>
        <Panel index={0} className={panelPad}>
          <PanelHeader>
            <div>
              <h2>
                <span className={sectionIcon()}>
                  <UserRound size={17} />
                </span>
                Profile details
              </h2>
              <p>The person behind the process.</p>
            </div>
            <Avatar large image={user.image} title={user.name}>
              {user.name.slice(0, 2).toUpperCase()}
            </Avatar>
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
              <small className={labelHint}>Your sign-in identity</small>
            </label>
          </div>
        </Panel>
        <Panel index={1} className={panelPad}>
          <PanelHeader>
            <div>
              <h2>
                <span className={sectionIcon()}>
                  <Wallet size={17} />
                </span>
                Trading account
              </h2>
              <p>Set your baseline. Measure your progress.</p>
            </div>
          </PanelHeader>
          <label className={cn(label, 'max-w-[340px]')}>
            Starting balance (USD)
            <input
              className={cn(input, 'font-mono')}
              name="startingBalance"
              type="number"
              min="0"
              max="1000000000000"
              step="0.01"
              required
              defaultValue={user.startingBalance}
            />
          </label>
          <p className={note}>
            Changing your starting balance adjusts the equity curve baseline. Your recorded trade
            P&amp;L stays the same.
          </p>
        </Panel>
        <Panel index={2} className={panelPad}>
          <h2>
            <span className={sectionIcon(true)}>
              <ShieldCheck size={17} />
            </span>
            Account security
          </h2>
          <div className="mt-[22px] flex items-center justify-between gap-5 rounded-[14px] border border-[#ffffff08] bg-[#00000030] p-4 text-[13px]">
            <div>
              <strong>Authentication provider</strong>
              <p className="mt-1 text-[12px] text-muted">
                Signed in with {user.providers.join(' and ')}
              </p>
            </div>
            <Badge tone="gain">CONNECTED</Badge>
          </div>
          <p className={note}>
            Your session uses secure HttpOnly cookies. No authentication tokens are stored in
            browser local storage.
          </p>
        </Panel>
        {error && (
          <p className={errorBox} role="alert">
            {error}
          </p>
        )}
        <div className={formFooter}>
          {saved && (
            <span
              className={cn(
                tone.green,
                'flex animate-[rise_0.4s_var(--ease-smooth)_both] items-center gap-1.5 text-[13px]',
              )}
              role="status"
            >
              <Check size={17} />
              Settings saved
            </span>
          )}
          <button className={buttonClass()} disabled={busy}>
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </>
  );
}
