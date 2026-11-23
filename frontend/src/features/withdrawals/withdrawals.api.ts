import type { WithdrawalCreateInput, WithdrawalDto } from '@et-trader/shared';
import { api } from '@/lib/api-client';

export const withdrawalService = {
  list: () => api<WithdrawalDto[]>('/withdrawals'),
  create: (data: WithdrawalCreateInput) =>
    api<WithdrawalDto>('/withdrawals', { method: 'POST', body: JSON.stringify(data) }),
  remove: (id: string) =>
    api<{ id: string }>(`/withdrawals/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
