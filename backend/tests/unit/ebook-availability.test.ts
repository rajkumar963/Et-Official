import { test } from 'node:test';
import assert from 'node:assert/strict';
import { products } from '@et-trader/shared';

test('upcoming e-books reject checkout and new orders before accessing payments or the database', async () => {
  process.env.JWT_ACCESS_SECRET = 'test-only-secret-at-least-thirty-two-characters';
  process.env.NODE_ENV = 'test';
  process.env.RESEND_API_KEY = '';
  const { checkoutConfig, createOrder } = await import('../../src/modules/orders/orders.service');
  const { HttpError } = await import('../../src/utils/http-error');
  const isComingSoon = (error: unknown) =>
    error instanceof HttpError && error.status === 409 && /coming soon/i.test(error.message);

  for (const ebook of products.filter((product) => product.type === 'ebook')) {
    await assert.rejects(checkoutConfig('000000000000000000000001', ebook.id), isComingSoon);
    await assert.rejects(
      createOrder('000000000000000000000001', {
        productId: ebook.id,
        network: 'TRC20',
        buyerName: 'Test Buyer',
        accessEmail: 'buyer@example.com',
        whatsapp: '',
        telegram: '',
      }),
      isComingSoon,
    );
  }
});
