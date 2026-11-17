import {
  orderStatuses,
  type AdminOrderDto,
  type AdminStats,
  type AdminUserDto,
  type OrderStatus,
  type ProductSettingDto,
  type ReviewDto,
} from '@et-trader/shared';
import { api } from '@/lib/api-client';

const post = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });

export type OrderFilter = OrderStatus | 'all';

export const isOrderFilter = (value: unknown): value is OrderFilter =>
  value === 'all' || (orderStatuses as readonly unknown[]).includes(value);

export const adminService = {
  stats: () => api<AdminStats>('/admin/stats'),
  orders: ({ status = 'all', q = '' }: { status?: OrderFilter; q?: string } = {}) => {
    const params = new URLSearchParams({ status });
    if (q.trim()) params.set('q', q.trim());
    return api<AdminOrderDto[]>(`/admin/orders?${params}`);
  },
  order: (id: string) => api<AdminOrderDto>(`/admin/orders/${encodeURIComponent(id)}`),
  approve: (id: string) => post<AdminOrderDto>(`/admin/orders/${encodeURIComponent(id)}/approve`),
  reject: (id: string, reason: string) =>
    post<AdminOrderDto>(`/admin/orders/${encodeURIComponent(id)}/reject`, { reason }),
  revoke: (id: string) => post<AdminOrderDto>(`/admin/orders/${encodeURIComponent(id)}/revoke`),
  restore: (id: string) => post<AdminOrderDto>(`/admin/orders/${encodeURIComponent(id)}/restore`),
  users: () => api<AdminUserDto[]>('/admin/users'),
  products: () => api<ProductSettingDto[]>('/admin/products'),
  updateProduct: (productId: string, data: { accessUrl: string; accessNote?: string }) =>
    api<ProductSettingDto>(`/admin/products/${encodeURIComponent(productId)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

/** Email review link endpoints: the token in the URL authorises these, no sign-in needed. */
export const reviewService = {
  get: (token: string) => api<ReviewDto>(`/admin/review/${encodeURIComponent(token)}`),
  approve: (token: string) =>
    post<ReviewDto>(`/admin/review/${encodeURIComponent(token)}`, { action: 'approve' }),
  reject: (token: string, reason: string) =>
    post<ReviewDto>(`/admin/review/${encodeURIComponent(token)}`, { action: 'reject', reason }),
};
