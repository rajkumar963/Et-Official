'use client';
import { useState, type CSSProperties, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpRight, Eye, EyeOff, ShieldCheck, Flame, Target, Zap } from 'lucide-react';
import { API_URL } from '@/config/env';
import { afterLoginPath, authService } from '@/features/auth/auth.api';
import { Brand } from '@/components/ui/brand';
import { MarketCanvas } from '@/components/effects/market-canvas';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { buttonClass, iconButtonClass } from '@/components/ui/button';
import { errorBox, form, input, label } from '@/components/ui/form';
import { StatIcon, type Tone } from '@/components/ui/stat-card';
import { eyebrow, tone as toneText } from '@/components/ui/styles';

/** Auth card inputs are a little roomier than the shared recipe. */
const authInput = cn(input, 'px-[14px] py-[13px]');

const floats: { icon: typeof Zap; tone: Tone; label: string; value: string }[] = [
  { icon: Zap, tone: 'green', label: 'Trade logged · NVDA', value: '+$480.00' },
  { icon: Target, tone: 'cyan', label: 'Win rate · sample', value: '68.4%' },
  { icon: Flame, tone: 'amber', label: 'Current streak', value: '6 green days' },
];

export function AuthForm({ signup = false }: { signup?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState(
    params.get('error') === 'google'
      ? 'Google sign-in failed. If you already have an email account, sign in below.'
      : params.get('error') === 'google-unavailable'
        ? 'Google sign-in has not been configured yet. Use email sign-in to continue.'
        : '',
  );
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    try {
      const result = signup
        ? await authService.signup(data as { name: string; email: string; password: string })
        : await authService.login(data as { email: string; password: string });
      const next = params.get('next');
      if (result.status === 'verification_required') {
        router.replace(next ? `/verify-email?next=${encodeURIComponent(next)}` : '/verify-email');
      } else {
        router.replace(afterLoginPath(next));
        router.refresh();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="isolate grid min-h-screen grid-cols-[1.05fr_1fr] max-[900px]:grid-cols-2 max-[700px]:grid-cols-1">
      <div className="relative flex flex-col justify-between overflow-hidden border-r border-line px-[7%] py-10 [background:radial-gradient(ellipse_at_20%_40%,#7c3aed38,transparent_60%),radial-gradient(ellipse_at_90%_90%,#0891b226,transparent_55%),#08080f] max-[900px]:px-7 max-[900px]:py-[34px] max-[700px]:border-0 max-[700px]:p-[22px] max-[700px]:[background:none]">
        <MarketCanvas
          className="absolute inset-[30%_0_0] -z-1 h-[70%] w-full opacity-[0.55] [mask-image:linear-gradient(to_bottom,transparent,#000_40%)] max-[700px]:hidden"
          speed={0.25}
        />
        <Brand className="relative" />
        <div className="relative max-[700px]:hidden">
          <span className={cn(eyebrow, toneText.purple)}>THE EDGE IS IN YOUR PROCESS</span>
          <h1 className="my-[22px] animate-[rise_0.9s_0.1s_var(--ease-smooth)_both] font-display text-[length:clamp(38px,4.4vw,62px)] leading-[1.04] tracking-[-0.05em]">
            Better records.
            <br />
            Clearer insights.
            <br />
            <span className="gradient-text">Stronger trading.</span>
          </h1>
          <p className="max-w-[420px] animate-[rise_0.9s_0.25s_var(--ease-smooth)_both] text-[15px] leading-[1.75] text-[#a39fb6]">
            A dedicated space to learn from every decision and build the discipline that lasts.
          </p>
          <div className="relative mt-9 flex flex-wrap gap-3 max-[900px]:hidden" aria-hidden="true">
            {floats.map(({ icon: Icon, tone, label: caption, value }, i) => (
              <div
                className="flex items-center gap-3 rounded-2xl border border-[#ffffff1a] bg-[rgba(20,18,34,0.7)] py-3 pr-4 pl-3 shadow-[0_20px_40px_#00000066] backdrop-blur-[14px] [animation:rise_0.8s_calc(0.5s_+_var(--i)_*_0.15s)_var(--ease-smooth)_both,float-y_6s_calc(var(--i)_*_0.8s)_ease-in-out_infinite]"
                key={caption}
                style={{ '--i': i } as CSSProperties}
              >
                <StatIcon tone={tone} className="size-9">
                  <Icon size={16} />
                </StatIcon>
                <div>
                  <small className="block text-[11px] text-[#9a97ae]">{caption}</small>
                  <strong
                    className={cn(
                      'font-mono text-[15px] leading-normal font-bold tracking-[-0.03em]',
                      tone === 'green' && toneText.green,
                    )}
                  >
                    {value}
                  </strong>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-9 animate-[rise_0.9s_0.9s_var(--ease-smooth)_both] border-l-2 border-violet-2 pl-[18px] text-[15px] text-[#d0c2ea]">
            “You can’t improve what you don’t measure.”
            <small className="mt-2.5 block font-mono text-[9px] leading-normal font-semibold tracking-[0.12em] text-[#7d6a92]">
              YOUR NEXT CHAPTER STARTS HERE
            </small>
          </div>
        </div>
        <small className="relative text-muted max-[700px]:hidden">
          ET Official · Reflect. Refine. Repeat.
        </small>
      </div>
      <div className="relative flex items-center justify-center px-[35px] py-[60px] before:absolute before:inset-0 before:-z-1 before:bg-[radial-gradient(#ffffff0e_1px,transparent_1px)] before:bg-[length:24px_24px] before:[mask-image:radial-gradient(ellipse_at_center,#000,transparent_70%)] before:content-[''] max-[900px]:px-[22px] max-[900px]:py-10 max-[700px]:items-start max-[700px]:px-4 max-[700px]:pt-2.5 max-[700px]:pb-[50px]">
        <div className="w-full max-w-[410px] animate-[rise_0.8s_0.15s_var(--ease-smooth)_both,rotate-angle_9s_linear_infinite] rounded-[26px] border border-transparent p-[34px] shadow-[0_40px_100px_#00000088] backdrop-blur-[20px] [background:linear-gradient(180deg,#14122299,#0d0c17ee)_padding-box,conic-gradient(from_var(--angle),#ffffff14_0_60%,#8b5cf6_72%,#22d3ee_80%,#ffffff14_92%)_border-box] max-[900px]:p-[26px] max-[700px]:px-5 max-[700px]:py-6">
          <Badge>YOUR PERSONAL TRADING WORKSPACE</Badge>
          <h2 className="mt-[18px] mb-2 font-display text-[32px] tracking-[-0.045em] max-[700px]:text-[28px]">
            {signup ? 'Find your edge.' : 'Welcome back.'}
          </h2>
          <p className="text-[13px] text-muted">
            {signup
              ? 'Start turning your trades into a better process.'
              : 'Your journal is ready. Let’s keep building.'}
          </p>
          <a
            className={buttonClass({
              variant: 'secondary',
              fullWidth: true,
              className:
                'mt-[26px] border-line-strong bg-[#ffffff07] p-[13px] text-[#ece8f6] hover:border-[#ffffff30] hover:bg-[#ffffff10] hover:text-[#ece8f6]',
            })}
            href={`${API_URL}/auth/google`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#a78bfa"
                d="M21 12.2c0-.7-.1-1.5-.2-2.2H12v4h5c-.3 1.3-1 2.3-2 3v2.5h3.2c1.9-1.8 2.8-4.3 2.8-7.3Z"
              />
              <path
                fill="#4ade80"
                d="M12 22c2.7 0 5-.9 6.7-2.5L15.5 17c-.9.6-2.1 1-3.5 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z"
              />
              <path fill="#fbbf24" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9l3.3-2.6Z" />
              <path
                fill="#ff545f"
                d="M12 6c1.5 0 2.8.5 3.8 1.5L18.6 4A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.8 9.4 6 12 6Z"
              />
            </svg>
            Continue with Google
          </a>
          <div className="my-[22px] flex items-center gap-3 text-[11px] text-[#7a6e88] before:h-px before:flex-1 before:bg-[linear-gradient(90deg,transparent,#a78bfa30,transparent)] before:content-[''] after:h-px after:flex-1 after:bg-[linear-gradient(90deg,transparent,#a78bfa30,transparent)] after:content-['']">
            <span>or continue with email</span>
          </div>
          <form className={cn(form, 'gap-4')} onSubmit={submit}>
            {signup && (
              <label className={label}>
                Full name
                <input
                  className={authInput}
                  name="name"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={80}
                  placeholder="Your name"
                />
              </label>
            )}
            <label className={label}>
              Email address
              <input
                className={authInput}
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
              />
            </label>
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className={label}>
                Password
              </label>
              <div className="relative">
                <input
                  className={cn(authInput, 'pr-[52px]')}
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={signup ? 'new-password' : 'current-password'}
                  required
                  minLength={10}
                  maxLength={72}
                  placeholder="At least 10 characters"
                />
                <button
                  type="button"
                  className={iconButtonClass({
                    className: 'absolute top-1/2 right-1.5 -translate-y-1/2',
                  })}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-controls="password"
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                  ) : (
                    <Eye size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
            {error && (
              <p className={errorBox} role="alert">
                {error}
              </p>
            )}
            <button className={buttonClass({ fullWidth: true })} disabled={busy}>
              {busy ? 'Please wait…' : signup ? 'Create your journal' : 'Sign in to your journal'}
              <ArrowUpRight size={17} />
            </button>
          </form>
          <p className="mt-[22px] text-center text-[13px] text-[#8a789b]">
            {signup ? 'Already have an account?' : 'New to ET Official?'}{' '}
            <Link
              href={signup ? '/login' : '/signup'}
              className="ml-1 font-semibold text-violet-3 hover:text-white"
            >
              {signup ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
          <div className="mt-6 flex items-center justify-center gap-[7px] border-t border-[#ffffff0d] pt-5 text-[11px] text-[#6f6382]">
            <ShieldCheck size={15} />
            Private journal. Secure sessions. Your data.
          </div>
        </div>
      </div>
    </main>
  );
}
