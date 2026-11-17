import type { TradeInput } from '../schemas';
export interface UserDto {
  id: string;
  name: string;
  email: string;
  image?: string;
  providers: string[];
  startingBalance: number;
  /** True for accounts listed in the backend's ADMIN_EMAILS. */
  isAdmin: boolean;
}
export interface TradeDto extends TradeInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}
export interface DayPnl {
  date: string;
  pnl: number;
  count: number;
}
export interface AnalyticsSummary {
  totalPnl: number;
  totalTrades: number;
  wins: number;
  losses: number;
  breakeven: number;
  winRate: number;
  profitFactor: number | null;
  avgWin: number;
  avgLoss: number;
  biggestWin: number;
  biggestLoss: number;
  grossWin: number;
  grossLoss: number;
  bestDay: DayPnl | null;
  worstDay: DayPnl | null;
  currentStreak: { type: 'win' | 'loss' | 'neutral'; count: number };
  mostTradedSymbol: string | null;
  dailyPnl: DayPnl[];
  equityCurve: { date: string; balance: number }[];
  behavioralScores: { name: string; score: number }[];
}
export type ApiResponse<T> = { data: T };

/** Result of sign-up, login and email verification. */
export type AuthResult =
  { status: 'authenticated'; user: UserDto } | { status: 'verification_required'; email: string };

export interface VerificationStatus {
  /** Masked address the code was sent to, e.g. "al••••@gmail.com". */
  email: string;
  resendAvailableAt: string;
}
