import { Trade } from '../../models/Trade';
import type { TradeInput, TradePatch } from '@et-trader/shared';
export const list = (userId: string, range?: { start: string; end: string }) =>
  Trade.find({ userId, ...(range ? { date: { $gte: range.start, $lt: range.end } } : {}) }).sort({
    date: -1,
    createdAt: -1,
  });
export const find = (userId: string, id: string) => Trade.findOne({ _id: id, userId });
export const create = (userId: string, data: TradeInput) => Trade.create({ ...data, userId });
export const update = (userId: string, id: string, data: TradePatch) =>
  Trade.findOneAndUpdate({ _id: id, userId }, { $set: data }, { new: true, runValidators: true });
export const remove = (userId: string, id: string) => Trade.findOneAndDelete({ _id: id, userId });
