import { Schema, model } from 'mongoose';
const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    symbol: { type: String, required: true, uppercase: true },
    side: { type: String, enum: ['long', 'short'], required: true },
    pnl: { type: Number, required: true },
    entryPrice: Number,
    exitPrice: Number,
    quantity: Number,
    strategy: { type: String, default: '' },
    notes: { type: String, default: '' },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);
schema.index({ userId: 1, date: -1 });
export const Trade = model('Trade', schema);
export function tradeDto(t: any) {
  return {
    id: String(t._id),
    date: t.date,
    symbol: t.symbol,
    side: t.side,
    pnl: t.pnl,
    entryPrice: t.entryPrice,
    exitPrice: t.exitPrice,
    quantity: t.quantity,
    strategy: t.strategy,
    notes: t.notes,
    tags: t.tags,
    createdAt: new Date(t.createdAt).toISOString(),
    updatedAt: new Date(t.updatedAt).toISOString(),
  };
}
