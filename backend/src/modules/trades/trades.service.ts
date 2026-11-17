import * as repo from './trades.repository';
import { tradeDto } from '../../models/Trade';
import { HttpError } from '../../utils/http-error';
import type { TradeInput, TradePatch } from '@et-trader/shared';
export async function create(userId: string, data: TradeInput) {
  return tradeDto(await repo.create(userId, data));
}
export const get = (userId: string, id: string) => mustExist(repo.find(userId, id));
export const update = (userId: string, id: string, data: TradePatch) =>
  mustExist(repo.update(userId, id, data));
export const remove = (userId: string, id: string) => mustExist(repo.remove(userId, id));
export async function list(userId: string, month?: number, year?: number) {
  let range;
  if (month !== undefined && year !== undefined) {
    const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const end = `${month === 11 ? year + 1 : year}-${String(month === 11 ? 1 : month + 2).padStart(2, '0')}-01`;
    range = { start, end };
  }
  return (await repo.list(userId, range)).map(tradeDto);
}
export async function mustExist<T>(promise: PromiseLike<T | null>) {
  const record = await promise;
  if (!record) throw new HttpError(404, 'Trade not found');
  return tradeDto(record);
}
