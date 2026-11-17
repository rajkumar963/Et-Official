import type { CheckoutConfig, CreateOrderInput, OrderDto } from '@et-trader/shared';
import { api } from '@/lib/api-client';

export const ordersApi = {
  checkout: (productId: string) =>
    api<CheckoutConfig>(`/orders/checkout/${encodeURIComponent(productId)}`),
  list: () => api<OrderDto[]>('/orders'),
  get: (orderNumber: string) => api<OrderDto>(`/orders/${encodeURIComponent(orderNumber)}`),
  create: (input: CreateOrderInput) =>
    api<OrderDto>('/orders', { method: 'POST', body: JSON.stringify(input) }),
  submitPayment: (orderNumber: string, txHash: string) =>
    api<OrderDto>(`/orders/${encodeURIComponent(orderNumber)}/payment`, {
      method: 'POST',
      body: JSON.stringify({ txHash }),
    }),
};
