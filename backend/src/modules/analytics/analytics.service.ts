import { get } from '../users/users.service';
import { list } from '../trades/trades.service';
import { computeAnalytics } from './calculations';
export async function getSummary(userId: string) {
  const [user, trades] = await Promise.all([get(userId), list(userId)]);
  return computeAnalytics(trades, user.startingBalance);
}
