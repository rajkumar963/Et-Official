'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { UserDto, TradeDto, AnalyticsSummary, WithdrawalDto } from '@et-trader/shared';
import { authService } from '@/features/auth/auth.api';
import { tradeService } from '@/features/trades/trades.api';
import { getAnalytics } from '@/features/analytics/analytics.api';
import { withdrawalService } from '@/features/withdrawals/withdrawals.api';
import { identifyUser } from '@/features/analytics/posthog';
import { ApiError } from '@/lib/api-client';
interface Journal {
  user: UserDto | null;
  trades: TradeDto[];
  summary: AnalyticsSummary | null;
  withdrawals: WithdrawalDto[];
  /** Sum of all recorded withdrawals, subtracted from the cash balance. */
  totalWithdrawn: number;
  /** Single source of truth for cash on hand: capital + realised P&L - withdrawals. */
  cashBalance: number;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  openTrade: (trade?: TradeDto, date?: string) => void;
  closeTrade: () => void;
  editor: { trade?: TradeDto; date?: string } | null;
}
const Context = createContext<Journal | null>(null);
export function JournalProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserDto | null>(null);
  const [trades, setTrades] = useState<TradeDto[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editor, setEditor] = useState<Journal['editor']>(null);
  const inFlight = useRef<Promise<void> | null>(null);
  const refresh = useCallback(() => {
    if (inFlight.current) return inFlight.current;
    inFlight.current = (async () => {
      try {
        setError('');
        // Verify or renew the session before starting concurrent protected reads.
        const u = await authService.me();
        const [t, s, w] = await Promise.all([
          tradeService.list(),
          getAnalytics(),
          withdrawalService.list(),
        ]);
        setUser(u);
        setTrades(t);
        setSummary(s);
        setWithdrawals(w);
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) router.replace('/login');
        else setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })().finally(() => {
      inFlight.current = null;
    });
    return inFlight.current;
  }, [router]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const userId = user?.id;
  useEffect(() => {
    if (user && userId) identifyUser(user);
    // identify() sends an event, so only re-run when the account itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);
  return (
    <Context.Provider
      value={{
        user,
        trades,
        summary,
        withdrawals,
        totalWithdrawn,
        cashBalance: (user?.startingBalance ?? 0) + (summary?.totalPnl ?? 0) - totalWithdrawn,
        loading,
        error,
        refresh,
        editor,
        openTrade: (trade, date) => setEditor({ trade, date }),
        closeTrade: () => setEditor(null),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useJournal() {
  const value = useContext(Context);
  if (!value) throw new Error('Journal provider missing');
  return value;
}
