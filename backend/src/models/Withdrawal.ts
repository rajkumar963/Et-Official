import { Schema, model } from 'mongoose';

/**
 * Cash the trader has taken out of the account. Kept apart from trades so withdrawals
 * reduce the cash balance without distorting P&L or the equity curve.
 */
const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    /** Always stored positive; it is subtracted when the balance is computed. */
    amount: { type: Number, required: true, min: 0 },
    /** Day of the withdrawal as YYYY-MM-DD. */
    date: { type: String, required: true },
    note: { type: String, default: '', trim: true },
  },
  { timestamps: true },
);

export const Withdrawal = model('Withdrawal', schema);
