import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { randomBytes } from 'node:crypto';

const suffix = randomBytes(5).toString('hex');
const adminEmail = `admin-${suffix}@example.com`;
process.env.JWT_ACCESS_SECRET = 'test-only-secret-at-least-thirty-two-characters';
process.env.NODE_ENV = 'test';
process.env.RESEND_API_KEY = ''; // never send real email from tests
process.env.ADMIN_EMAILS = adminEmail;
process.env.ADMIN_NOTIFY_EMAIL = 'notify@example.com';
process.env.USDT_TRC20_ADDRESS = 'TTestTrc20Address000000000000000000';
process.env.USDT_BEP20_ADDRESS = '0x0000000000000000000000000000000000000bep';
process.env.USDT_ERC20_ADDRESS = '';

test('orders: checkout, payment submission, email review link, admin portal and access', async () => {
  const { app } = await import('../../src/app');
  const { User } = await import('../../src/models/User');
  const { Order } = await import('../../src/models/Order');
  const { Session } = await import('../../src/models/Session');
  const { EmailChallenge } = await import('../../src/models/EmailChallenge');
  const { ProductSetting } = await import('../../src/models/ProductSetting');
  const { devOutbox } = await import('../../src/services/mailer');
  await mongoose.connect(
    process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/et-trader_test',
    { serverSelectionTimeoutMS: 5000 },
  );
  const origin = 'http://localhost:3000';
  const buyerEmail = `buyer-${suffix}@example.com`;
  const productId = 'basic-to-advanced-course';
  const tx = 'a'.repeat(63) + suffix.slice(0, 1).replace(/[^a-f0-9]/, 'b');

  async function signedIn(name: string, email: string) {
    const agent = request.agent(app);
    await agent
      .post('/api/v1/auth/signup')
      .set('Origin', origin)
      .send({ name, email, password: 'long-test-password' });
    const code = devOutbox
      .filter((m) => m.to === email)
      .at(-1)!
      .text.match(/(\d{6})/)![1];
    const verified = await agent
      .post('/api/v1/auth/verify-email')
      .set('Origin', origin)
      .send({ code });
    assert.equal(verified.status, 200);
    return agent;
  }

  try {
    const buyer = await signedIn('Buyer Person', buyerEmail);
    const admin = await signedIn('Admin Person', adminEmail);
    await ProductSetting.deleteMany({ productId });
    await ProductSetting.create({
      productId,
      accessUrl: 'https://drive.google.com/drive/folders/x',
    });

    // Checkout config: price from the server, only networks with an address.
    const config = await buyer.get(`/api/v1/orders/checkout/${productId}`);
    assert.equal(config.status, 200);
    assert.equal(config.body.data.product.price, 250);
    assert.deepEqual(config.body.data.networks, ['TRC20', 'BEP20']);
    assert.equal((await buyer.get('/api/v1/orders/checkout/nope')).status, 404);

    // Validation: Gmail only, configured network only, unknown fields rejected.
    const base = { productId, network: 'TRC20', buyerName: 'Buyer Person' };
    const post = (body: object) => buyer.post('/api/v1/orders').set('Origin', origin).send(body);
    assert.equal((await post({ ...base, accessEmail: 'someone@yahoo.com' })).status, 422);
    assert.equal(
      (await post({ ...base, network: 'ERC20', accessEmail: 'b@gmail.com' })).status,
      400,
    );
    assert.equal((await post({ ...base, accessEmail: 'b@gmail.com', amount: 1 })).status, 422);

    const created = await post({ ...base, accessEmail: 'Buyer.Access@gmail.com' });
    assert.equal(created.status, 201);
    const order = created.body.data;
    assert.match(order.orderNumber, /^ET-[2-9A-HJ-NP-Z]{8}$/);
    assert.equal(order.amount, 250);
    assert.equal(order.accessEmail, 'buyer.access@gmail.com');
    assert.equal(order.walletAddress, process.env.USDT_TRC20_ADDRESS);
    assert.equal(order.accessUrl, null);
    // Re-checkout with another network updates the same unpaid order.
    const switched = await post({
      ...base,
      network: 'BEP20',
      accessEmail: 'buyer.access@gmail.com',
    });
    assert.equal(switched.body.data.orderNumber, order.orderNumber);
    assert.equal(switched.body.data.network, 'BEP20');
    await post({ ...base, accessEmail: 'buyer.access@gmail.com' }); // back to TRC20

    // Other accounts can't see the order; non-admins can't use the admin API.
    const stranger = await signedIn('Stranger', `stranger-${suffix}@example.com`);
    assert.equal((await stranger.get(`/api/v1/orders/${order.orderNumber}`)).status, 404);
    assert.equal((await buyer.get('/api/v1/admin/stats')).status, 403);
    assert.equal((await request(app).get('/api/v1/admin/orders')).status, 401);

    // Payment submission: format checked per network, then admin + buyer are emailed.
    const pay = (hash: string) =>
      buyer
        .post(`/api/v1/orders/${order.orderNumber}/payment`)
        .set('Origin', origin)
        .send({ txHash: hash });
    assert.equal((await pay('not-a-real-transaction-id')).status, 422);
    const submitted = await pay(tx);
    assert.equal(submitted.status, 200);
    assert.equal(submitted.body.data.status, 'submitted');
    assert.equal(submitted.body.data.explorerUrl, `https://tronscan.org/#/transaction/${tx}`);
    assert.equal((await pay(tx)).status, 409);

    const adminMail = devOutbox.filter((m) => m.to === 'notify@example.com').at(-1)!;
    assert.match(adminMail.subject, new RegExp(order.orderNumber));
    assert.match(adminMail.text, new RegExp(tx));
    assert.match(adminMail.text, /buyer\.access@gmail\.com/);
    const token = adminMail.text.match(/\/admin\/review\/([A-Za-z0-9_-]+)/)![1];
    assert.match(devOutbox.filter((m) => m.to === buyerEmail).at(-1)!.subject, /Payment received/);

    // Admin portal lists it.
    const stats = await admin.get('/api/v1/admin/stats');
    assert.equal(stats.status, 200);
    assert(stats.body.data.orders.submitted >= 1);
    const listed = await admin.get(`/api/v1/admin/orders?status=submitted&q=${order.orderNumber}`);
    assert.equal(listed.body.data.length, 1);
    assert.equal(listed.body.data[0].user.email, buyerEmail);
    const users = await admin.get('/api/v1/admin/users');
    assert(
      users.body.data.some(
        (u: { email: string; orders: number }) => u.email === buyerEmail && u.orders === 1,
      ),
    );

    // Email review link: viewable without login, approve works once.
    const review = await request(app).get(`/api/v1/admin/review/${token}`);
    assert.equal(review.status, 200);
    assert.equal(review.body.data.actionable, true);
    assert.equal(review.body.data.order.txHash, tx);
    assert.equal(
      (
        await request(app)
          .post(`/api/v1/admin/review/${token}`)
          .set('Origin', origin)
          .send({ action: 'nope' })
      ).status,
      422,
    );
    const approved = await request(app)
      .post(`/api/v1/admin/review/${token}`)
      .set('Origin', origin)
      .send({ action: 'approve' });
    assert.equal(approved.status, 200);
    assert.equal(approved.body.data.order.status, 'approved');
    assert.equal(approved.body.data.order.reviewedBy, 'email link');
    assert.equal((await request(app).get(`/api/v1/admin/review/${token}`)).status, 404);
    assert.match(devOutbox.filter((m) => m.to === buyerEmail).at(-1)!.subject, /You're in/);

    // Buyer now sees the access link; revoking hides it again.
    let mine = await buyer.get(`/api/v1/orders/${order.orderNumber}`);
    assert.equal(mine.body.data.accessUrl, 'https://drive.google.com/drive/folders/x');
    assert.equal(
      (await admin.post(`/api/v1/admin/orders/${order.id}/revoke`).set('Origin', origin)).status,
      200,
    );
    mine = await buyer.get(`/api/v1/orders/${order.orderNumber}`);
    assert.equal(mine.body.data.accessUrl, null);
    assert.equal(mine.body.data.accessRevoked, true);
    assert.equal(
      (await admin.post(`/api/v1/admin/orders/${order.id}/restore`).set('Origin', origin)).status,
      200,
    );

    // Can't buy the same product twice; the same transaction can't pay another order.
    assert.equal((await post({ ...base, accessEmail: 'buyer.access@gmail.com' })).status, 409);
    const second = await post({
      ...base,
      productId: 'advanced-to-pro-course',
      accessEmail: 'buyer.access@gmail.com',
    });
    assert.equal(second.body.data.amount, 450);
    assert.equal(
      (
        await buyer
          .post(`/api/v1/orders/${second.body.data.orderNumber}/payment`)
          .set('Origin', origin)
          .send({ txHash: tx })
      ).status,
      409,
    );

    // Admin portal rejection with a reason; the buyer can then resubmit a corrected transaction.
    const tx2 = 'c'.repeat(64);
    await buyer
      .post(`/api/v1/orders/${second.body.data.orderNumber}/payment`)
      .set('Origin', origin)
      .send({ txHash: tx2 });
    assert.equal(
      (
        await admin
          .post(`/api/v1/admin/orders/${second.body.data.id}/reject`)
          .set('Origin', origin)
          .send({ reason: 'x' })
      ).status,
      422,
    );
    const rejected = await admin
      .post(`/api/v1/admin/orders/${second.body.data.id}/reject`)
      .set('Origin', origin)
      .send({ reason: 'Amount received was lower than the price.' });
    assert.equal(rejected.body.data.status, 'rejected');
    assert.match(devOutbox.filter((m) => m.to === buyerEmail).at(-1)!.text, /lower than the price/);
    const resubmitted = await buyer
      .post(`/api/v1/orders/${second.body.data.orderNumber}/payment`)
      .set('Origin', origin)
      .send({ txHash: 'd'.repeat(64) });
    assert.equal(resubmitted.body.data.status, 'submitted');

    // Product settings are admin-managed.
    const saved = await admin
      .put(`/api/v1/admin/products/${productId}`)
      .set('Origin', origin)
      .send({ accessUrl: 'https://drive.google.com/new', accessNote: 'Open with your Gmail' });
    assert.equal(saved.body.data.accessUrl, 'https://drive.google.com/new');
    assert.equal(
      (
        await buyer
          .put(`/api/v1/admin/products/${productId}`)
          .set('Origin', origin)
          .send({ accessUrl: '' })
      ).status,
      403,
    );
  } finally {
    const users = await User.find({ email: { $regex: suffix } });
    const ids = users.map((u) => u._id);
    await Order.deleteMany({ userId: { $in: ids } });
    await Session.deleteMany({ userId: { $in: ids } });
    await EmailChallenge.deleteMany({ userId: { $in: ids } });
    await User.deleteMany({ _id: { $in: ids } });
    await ProductSetting.deleteMany({ productId });
    await mongoose.disconnect();
  }
});
