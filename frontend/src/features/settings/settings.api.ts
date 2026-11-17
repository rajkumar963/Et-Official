import type { UserDto } from '@et-trader/shared';
import { api } from '@/lib/api-client';
export const updateSettings = (data: { name: string; startingBalance: number }) =>
  api<UserDto>('/users/me', { method: 'PATCH', body: JSON.stringify(data) });
