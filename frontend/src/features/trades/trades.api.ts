import type { TradeDto, TradeInput } from '@et-trader/shared';
import { api } from '@/lib/api-client';
export const tradeService = {
  list: () => api<TradeDto[]>('/trades'),
  save: (data: TradeInput, id?: string) =>
    api<TradeDto>(id ? `/trades/${id}` : '/trades', {
      method: id ? 'PATCH' : 'POST',
      body: JSON.stringify(data),
    }),
  remove: (id: string) => api(`/trades/${id}`, { method: 'DELETE' }),
};
