'use client';
import { useEffect, useState } from 'react';
import { Globe2 } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Live trading-session strip. Everything here is derived from the visitor's real clock —
 * no simulated prices — so the status shown is genuinely correct.
 * Windows are the conventional FX session hours in UTC (they shift ~1h with local DST).
 */
type Session = { city: string; open: number; close: number; tone: string };

const sessions: Session[] = [
  { city: 'Sydney', open: 22, close: 7, tone: '#22d3ee' },
  { city: 'Tokyo', open: 0, close: 9, tone: '#a78bfa' },
  { city: 'London', open: 8, close: 17, tone: '#4ade80' },
  { city: 'New York', open: 13, close: 22, tone: '#fbbf24' },
];

const inWindow = (s: Session, minutes: number) => {
  const start = s.open * 60;
  const end = s.close * 60;
  return start < end ? minutes >= start && minutes < end : minutes >= start || minutes < end;
};

/** FX week: opens Sunday 22:00 UTC, closes Friday 22:00 UTC. */
function weekIsOpen(now: Date) {
  const day = now.getUTCDay();
  const hour = now.getUTCHours();
  if (day === 6) return false;
  if (day === 0 && hour < 22) return false;
  if (day === 5 && hour >= 22) return false;
  return true;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function MarketSessions({ className }: { className?: string }) {
  // Null until mounted so server and client markup match (the clock is client-only).
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const minutes = now ? now.getUTCHours() * 60 + now.getUTCMinutes() : 0;
  const weekOpen = now ? weekIsOpen(now) : false;
  const openCount = now ? sessions.filter((s) => weekOpen && inWindow(s, minutes)).length : 0;

  return (
    <section
      aria-label="Live market sessions"
      className={cn(
        'relative overflow-hidden bg-[linear-gradient(180deg,#0b0a14,#08080f)]',
        className,
      )}
    >
      {/* faint terminal grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[size:34px_34px] opacity-60 [background-image:linear-gradient(90deg,#ffffff06_1px,transparent_1px)] [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]"
      />
      <div className="relative mx-auto flex max-w-[1180px] items-center gap-5 overflow-x-auto px-6 py-3 max-[860px]:px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex shrink-0 items-center gap-2.5">
          <Globe2 size={15} className="text-violet-3" aria-hidden="true" />
          <span className="font-mono text-[10.5px] font-semibold tracking-[0.16em] text-[#77748c]">
            MARKET SESSIONS
          </span>
        </div>

        <span className="h-4 w-px shrink-0 bg-[#ffffff14]" aria-hidden="true" />

        <ul className="flex min-w-max items-center gap-2.5">
          {sessions.map((s) => {
            const live = Boolean(now) && weekOpen && inWindow(s, minutes);
            return (
              <li
                key={s.city}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] whitespace-nowrap transition-colors',
                  live
                    ? 'border-[#ffffff1f] bg-[#ffffff0a] text-white'
                    : 'border-[#ffffff0d] bg-transparent text-[#6e6b84]',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'size-[6px] shrink-0 rounded-full',
                    live ? 'animate-[lp-live_2s_infinite]' : 'opacity-40',
                  )}
                  style={{ background: live ? s.tone : '#6e6b84' }}
                />
                <span className="font-semibold tracking-[0.04em]">{s.city}</span>
                <span className={cn('text-[9.5px] tracking-[0.12em]', live && 'text-gain')}>
                  {now ? (live ? 'OPEN' : 'CLOSED') : '—'}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex shrink-0 items-center gap-3 pl-4">
          <span className="font-mono text-[10.5px] tracking-[0.1em] text-[#6e6b84]">
            {now ? `${openCount} OPEN` : ''}
          </span>
          <span
            className="font-mono text-[12px] font-semibold tabular-nums text-[#cdc6dd]"
            suppressHydrationWarning
          >
            {now
              ? `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`
              : '--:--:--'}
            <span className="ml-1 text-[9.5px] text-[#6e6b84]">UTC</span>
          </span>
        </div>
      </div>
    </section>
  );
}
