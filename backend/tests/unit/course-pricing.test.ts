import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createOrderSchema, getProduct, productQuote, paymentQrValue } from '@et-trader/shared';

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

test('ET10 discounts each course by 10% of its actual catalogue price', () => {
  for (const [id, price, discount, total] of [
    ['basic-to-advanced-course', 250, 25, 225],
    ['advanced-to-pro-course', 450, 45, 405],
  ] as const) {
    const product = getProduct(id)!;
    assert.deepEqual(productQuote(product, ' et10 '), {
      originalAmount: price,
      discountAmount: discount,
      couponCode: 'ET10',
      amount: total,
    });
    assert.equal(productQuote(product).amount, price);
  }
  assert(paymentQrValue('ERC20', '0xWallet', 225).endsWith('uint256=225000000'));
});

test('coupon validation rejects unknown codes, e-books and browser-supplied prices', () => {
  const valid = { ...buyer, productId: 'basic-to-advanced-course', couponCode: ' et10 ' };
  assert.equal(createOrderSchema.parse(valid).couponCode, 'ET10');
  for (const input of [
    { ...valid, couponCode: 'FREE100' },
    { ...valid, productId: 'price-action-patterns' },
    { ...valid, amount: 1 },
    { ...valid, discountAmount: 249 },
  ])
    assert.equal(createOrderSchema.safeParse(input).success, false);
});

test('server applies and removes ET10 on unpaid orders and preserves it on checkout reload', async (t) => {
  const { createOrder, checkoutConfig } = await import('../../src/modules/orders/orders.service');
  const { Order } = await import('../../src/models/Order');
  for (const [id, originalAmount, amount] of [
    ['basic-to-advanced-course', 250, 225],
    ['advanced-to-pro-course', 450, 405],
  ] as const) {
    const order = await oldOrder(id);
    t.mock.method(order, 'save', async () => order);
    const lookup = t.mock.method(Order, 'findOne', async () => order);
    const discounted = await createOrder('000000000000000000000001', {
      ...buyer,
      productId: id,
      couponCode: 'ET10',
    });
    assert.equal(discounted.amount, amount);
    assert.equal(discounted.originalAmount, originalAmount);
    assert.equal(discounted.couponCode, 'ET10');
    assert.equal(discounted.discountAmount, originalAmount - amount);
    lookup.mock.restore();
    const reload = t.mock.method(Order, 'findOne', () => ({ sort: async () => order }) as never);
    const config = await checkoutConfig('000000000000000000000001', id);
    assert.equal(config.existingOrder?.amount, amount);
    assert.equal(config.existingOrder?.couponCode, 'ET10');
    reload.mock.restore();
    const update = t.mock.method(Order, 'findOne', async () => order);
    const fullPrice = await createOrder('000000000000000000000001', {
      ...buyer,
      productId: id,
      couponCode: '',
    });
    assert.equal(fullPrice.amount, originalAmount);
    assert.equal(fullPrice.discountAmount, 0);
    assert.equal(fullPrice.couponCode, null);
    update.mock.restore();
  }
});

test('new discounted orders persist the coupon, original price and payable amount', async (t) => {
  const { createOrder } = await import('../../src/modules/orders/orders.service');
  const { Order } = await import('../../src/models/Order');
  t.mock.method(Order, 'findOne', async () => null);
  const create = t.mock.method(Order, 'create', async (details: object) => {
    const order = new Order(details);
    order.set('createdAt', new Date());
    return order;
  });
  const result = await createOrder('000000000000000000000001', {
    ...buyer,
    productId: 'basic-to-advanced-course',
    couponCode: 'ET10',
  });
  assert.equal(create.mock.calls.length, 1);
  assert.equal(result.amount, 225);
  assert.equal(result.originalAmount, 250);
  assert.equal(result.discountAmount, 25);
  assert.equal(result.couponCode, 'ET10');
});

test('invalid coupons cannot bypass validation by calling the order service directly', async () => {
  const { createOrder } = await import('../../src/modules/orders/orders.service');
  await assert.rejects(
    createOrder('000000000000000000000001', {
      ...buyer,
      productId: 'basic-to-advanced-course',
      couponCode: 'FREE100',
    }),
    /Invalid coupon code/,
  );
});

test('submitted discounted payments retain their original price and discount', async (t) => {
  const { checkoutConfig, createOrder } = await import('../../src/modules/orders/orders.service');
  const { Order } = await import('../../src/models/Order');
  const order = await oldOrder('advanced-to-pro-course', 225, 'submitted');
  order.set({ couponCode: 'ET10', originalAmount: 250, discountAmount: 25 });
  const save = t.mock.method(order, 'save', async () => order);
  const reload = t.mock.method(Order, 'findOne', () => ({ sort: async () => order }) as never);
  const result = await checkoutConfig('000000000000000000000001', order.productId);
  assert.equal(result.existingOrder?.amount, 225);
  assert.equal(result.existingOrder?.originalAmount, 250);
  assert.equal(result.existingOrder?.discountAmount, 25);
  assert.equal(save.mock.calls.length, 0);
  reload.mock.restore();
  t.mock.method(Order, 'findOne', async () => order);
  await assert.rejects(
    createOrder('000000000000000000000001', {
      ...buyer,
      productId: order.productId,
      couponCode: '',
    }),
    /already submitted a payment/,
  );
});
