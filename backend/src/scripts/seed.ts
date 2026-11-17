import { connectDatabase } from '../config/database';
import { User } from '../models/User';
import { Trade } from '../models/Trade';
import { signup } from '../modules/auth/auth.service';
import mongoose from 'mongoose';
async function main() {
  await connectDatabase();
  const email = 'demo@et-trader.local';
  let user = await User.findOne({ email });
  if (!user) {
    user = await signup({ name: 'Alex Morgan', email, password: 'JournalDemo2026!' });
    user.emailVerified = true; // demo account skips email verification
    await user.save();
  }
  if (await Trade.exists({ userId: user._id })) {
    console.log('Demo journal already contains trades; no records were changed.');
    return;
  }
  const pnl = [
    320, 410, -180, 550, 190, 1420, -90, 0, -240, 640, 210, 912, 924, -262, 480, 350, -120, 690,
  ];
  const symbols = ['NVDA', 'SPY', 'TSLA', 'QQQ', 'AAPL', 'AMD'];
  const strategies = ['Morning Breakout', 'VWAP Bounce', 'Reversal Fade', 'Flag Breakout'];
  const now = new Date();
  for (let i = 0; i < pnl.length; i++) {
    const date = new Date(now.getFullYear(), now.getMonth(), Math.min(i + 1, now.getDate()));
    const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    await Trade.create({
      userId: user._id,
      date: day,
      symbol: symbols[i % symbols.length],
      side: i % 3 === 0 ? 'short' : 'long',
      pnl: pnl[i],
      strategy: strategies[i % strategies.length],
      quantity: 100,
      entryPrice: 145 + i,
      exitPrice: 145 + i + pnl[i] / 100,
      notes:
        i % 4 ? 'Waited for confirmation before entry. Reviewed execution after the close.' : '',
      tags: ['demo'],
    });
  }
  console.log('Demo account ready: demo@et-trader.local / JournalDemo2026!');
}
main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
