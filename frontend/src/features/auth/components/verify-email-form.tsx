'use client';
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpRight, MailCheck, RotateCw } from 'lucide-react';
import type { VerificationStatus } from '@et-trader/shared';
import { Brand } from '@/components/ui/brand';
import { buttonClass, textLinkClass } from '@/components/ui/button';
import { errorBox, form, input, label } from '@/components/ui/form';
import { eyebrow, surface } from '@/components/ui/styles';
import { afterLoginPath, authService } from '@/features/auth/auth.api';
import { ApiError } from '@/lib/api-client';
import { cn } from '@/lib/cn';

export function VerifyEmailForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [missing, setMissing] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    authService
      .verification()
      .then(setStatus)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 404) setMissing(true);
        else setError((e as Error).message);
      });
  }, []);

  // Ticks once a second while the resend cooldown is running.
  const resendAt = status ? Date.parse(status.resendAvailableAt) : 0;
  const waitSeconds = Math.max(0, Math.ceil((resendAt - now) / 1000));
  useEffect(() => {
    if (!waitSeconds) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [waitSeconds]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await authService.verifyEmail(code);
      router.replace(afterLoginPath(params.get('next')));
      router.refresh();
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) setMissing(true);
      setError((e as Error).message);
      setBusy(false);
    }
  }

  async function resend() {
    setError('');
    setNotice('');
    try {
      setStatus(await authService.resendVerification());
      setNow(Date.now());
      setCode('');
      setNotice('A new code is on its way. Codes expire after 10 minutes.');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-5 py-16 [background:radial-gradient(ellipse_at_50%_0%,#7c3aed30,transparent_60%),var(--color-bg)]">
      <div className="w-full max-w-[440px]">
        <div className="mb-8 flex justify-center">
          <Brand />
        </div>
        <section className={cn(surface, 'rounded-[24px] p-8 max-[560px]:p-6')}>
          <span className="mx-auto grid size-14 place-items-center rounded-[16px] border border-[#8b5cf655] bg-[#8b5cf61f] text-violet-3">
            <MailCheck size={26} aria-hidden="true" />
          </span>
          <span className={cn(eyebrow, 'mt-6 block text-center text-violet-3')}>ONE LAST STEP</span>
          <h1 className="mt-2 text-center font-display text-[28px] leading-[1.15] font-bold tracking-[-0.04em]">
            Verify your email
          </h1>

          {missing ? (
            <div className="mt-4 text-center">
              <p className="text-[14px] leading-[1.6] text-muted">
                This verification has expired or was opened in a different browser. Sign in again
                and we&apos;ll email you a new code.
              </p>
              <Link href="/login" className={buttonClass({ fullWidth: true, className: 'mt-6' })}>
                Back to sign in <ArrowUpRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              <p className="mt-3 text-center text-[14px] leading-[1.6] text-muted">
                We sent a 6-digit code to{' '}
                <strong className="font-semibold text-fg">{status?.email ?? 'your email'}</strong>.
                Enter it below to finish signing in.
              </p>
              <form className={cn(form, 'mt-7')} onSubmit={submit}>
                <label className={label}>
                  Verification code
                  <input
                    className={cn(
                      input,
                      'py-4 text-center font-mono text-[26px] font-bold tracking-[0.5em] placeholder:tracking-[0.5em]',
                    )}
                    name="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="\d{6}"
                    maxLength={6}
                    required
                    autoFocus
                    placeholder="••••••"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                </label>
                {error && (
                  <p className={errorBox} role="alert">
                    {error}
                  </p>
                )}
                {notice && (
                  <p className="text-[12.5px] text-gain" role="status">
                    {notice}
                  </p>
                )}
                <button
                  className={buttonClass({ fullWidth: true })}
                  disabled={busy || code.length !== 6}
                >
                  {busy ? 'Verifying…' : 'Verify and continue'}
                  <ArrowUpRight size={17} />
                </button>
              </form>
              <div className="mt-6 flex flex-col items-center gap-3 text-[12.5px] text-muted">
                <span>
                  Didn&apos;t get it? Check your spam folder, or{' '}
                  {waitSeconds > 0 ? (
                    <span className="font-semibold text-dim">resend in {waitSeconds}s</span>
                  ) : (
                    <button type="button" className={textLinkClass} onClick={resend}>
                      send a new code <RotateCw size={13} />
                    </button>
                  )}
                </span>
                <Link href="/login" className="hover:text-fg">
                  Use a different account
                </Link>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
