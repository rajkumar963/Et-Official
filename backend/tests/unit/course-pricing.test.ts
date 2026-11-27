import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createOrderSchema } from '@et-trader/shared';

process.env.JWT_ACCESS_SECRET = 'test-only-secret-at-least-thirty-two-characters';
process.env.NODE_ENV = 'test';
process.env.RESEND_API_KEY = '';
process.env.USDT_TRC20_ADDRESS = 'TTestCurrentReceivingWallet';

const buyer = {
  network: 'TRC20' as const,
  buyerName: 'Course Buyer',
  accessEmail: 'buyer@gmail.com',
  whatsapp: '',
  telegram: '',
};

async function oldOrder(
  productId = 'basic-to-advanced-course',
  amount = 199,
  status = 'awaiting_payment',
) {
  const { Order } = await import('../../src/models/Order');
  const order = new Order({
    orderNumber: 'ET-TEST1234',
    userId: '000000000000000000000001',
    productId,
    productType: 'course',
    productTitle: 'Old course title',
    amount,
    walletAddress: 'TOldReceivingWallet',
    status,
    ...buyer,
  });
  order.set('createdAt', new Date('2026-11-01T00:00:00Z'));
  return order;
}

test('checkout refreshes an unpaid quote to the current course title, price and wallet', async (t) => {
  const { checkoutConfig } = await import('../../src/modules/orders/orders.service');
  const { Order } = await import('../../src/models/Order');
  const order = await oldOrder();
  const save = t.mock.method(order, 'save', async () => order);
  t.mock.method(Order, 'findOne', () => ({ sort: async () => order }) as never);
  const result = await checkoutConfig('000000000000000000000001', 'basic-to-advanced-course');
  assert.equal(result.product.price, 250);
  assert.equal(result.existingOrder?.amount, 250);
  assert.equal(result.existingOrder?.productTitle, 'Binary ET Strategies');
  assert.equal(result.existingOrder?.walletAddress, 'TTestCurrentReceivingWallet');
  assert.equal(save.mock.calls.length, 1);
});

test('a submitted payment keeps its original quote amount and wallet', async (t) => {
  const { checkoutConfig } = await import('../../src/modules/orders/orders.service');
  const { Order } = await import('../../src/models/Order');
  const order = await oldOrder('basic-to-advanced-course', 199, 'submitted');
  const save = t.mock.method(order, 'save', async () => order);
  t.mock.method(Order, 'findOne', () => ({ sort: async () => order }) as never);
  const result = await checkoutConfig('000000000000000000000001', 'basic-to-advanced-course');
  assert.equal(result.existingOrder?.amount, 199);
  assert.equal(result.existingOrder?.walletAddress, 'TOldReceivingWallet');
  assert.equal(save.mock.calls.length, 0);
});

test('order updates use the confirmed 250 and 450 USDT prices from the server catalogue', async (t) => {
  const { createOrder } = await import('../../src/modules/orders/orders.service');
  const { Order } = await import('../../src/models/Order');
  const cases = [
    { id: 'basic-to-advanced-course', oldPrice: 199, price: 250, title: 'Binary ET Strategies' },
    {
      id: 'advanced-to-pro-course',
      oldPrice: 319,
      price: 450,
      title: 'Basic to Advanced Binary Trading',
    },
  ];
  for (const example of cases) {
    const order = await oldOrder(example.id, example.oldPrice);
    t.mock.method(order, 'save', async () => order);
    const lookup = t.mock.method(Order, 'findOne', async () => order);
    const result = await createOrder('000000000000000000000001', {
      ...buyer,
      productId: example.id,
    });
    assert.equal(result.amount, example.price);
    assert.equal(result.productTitle, example.title);
    lookup.mock.restore();
  }
});

test('the upcoming Gold Masterclass is not offered as a purchasable product', () => {
  assert.equal(
    createOrderSchema.safeParse({ ...buyer, productId: 'forex-gold-masterclass' }).success,
    false,
  );
});
