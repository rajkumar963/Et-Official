import { createHash, randomBytes } from 'node:crypto';
import {
  getProduct,
  networkInfo,
  paymentNetworks,
  type AdminOrderDto,
  type CheckoutConfig,
  type CreateOrderInput,
  type OrderDto,
  type PaymentNetwork,
} from '@et-trader/shared';
import { env } from '../../config/env';
import { Order } from '../../models/Order';
import { ProductSetting } from '../../models/ProductSetting';
import { User } from '../../models/User';
import { HttpError } from '../../utils/http-error';
import { sendEmail } from '../../services/mailer';
import {
  adminNewPaymentEmail,
  buyerApprovedEmail,
  buyerPaymentReceivedEmail,
  buyerRejectedEmail,
} from '../../services/order-emails';

const REVIEW_TOKEN_DAYS = 14;
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

/** Wallet address per network from the environment; empty means the network is unavailable. */
export function walletAddress(network: PaymentNetwork) {
  return {
    TRC20: env.USDT_TRC20_ADDRESS,
    BEP20: env.USDT_BEP20_ADDRESS,
    ERC20: env.USDT_ERC20_ADDRESS,
  }[network];
}

export const availableNetworks = () => paymentNetworks.filter((network) => walletAddress(network));

function newOrderNumber() {
  // Crockford-style alphabet without look-alike characters (no 0/O, 1/I/L).
  const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  const bytes = randomBytes(8);
  return `ET-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')}`;
}

type OrderDoc = InstanceType<typeof Order>;

async function accessFor(productId: string) {
  const setting = await ProductSetting.findOne({ productId });
  return { url: setting?.accessUrl ?? '', note: setting?.accessNote ?? '' };
}

export function toOrderDto(order: OrderDoc, access?: { url: string; note: string }): OrderDto {
  const hasAccess = order.status === 'approved' && !order.accessRevoked;
  return {
    id: String(order._id),
    orderNumber: order.orderNumber,
    productId: order.productId,
    productType: order.productType as OrderDto['productType'],
    productTitle: order.productTitle,
    amount: order.amount,
    currency: 'USDT',
    network: order.network as PaymentNetwork,
    walletAddress: order.walletAddress,
    buyerName: order.buyerName,
    accessEmail: order.accessEmail,
    whatsapp: order.whatsapp,
    telegram: order.telegram,
    txHash: order.txHash ?? null,
    explorerUrl: order.txHash
      ? networkInfo[order.network as PaymentNetwork].explorerTx(order.txHash)
      : null,
    status: order.status as OrderDto['status'],
    accessRevoked: order.accessRevoked,
    accessUrl: hasAccess ? access?.url || null : null,
    accessNote: hasAccess ? access?.note || null : null,
    rejectReason: order.rejectReason ?? null,
    submittedAt: order.submittedAt?.toISOString() ?? null,
    reviewedAt: order.reviewedAt?.toISOString() ?? null,
    createdAt: new Date(order.get('createdAt')).toISOString(),
  };
}

export async function toAdminOrderDto(order: OrderDoc): Promise<AdminOrderDto> {
  const [user, access] = await Promise.all([
    User.findById(order.userId),
    accessFor(order.productId),
  ]);
  return {
    ...toOrderDto(order, access),
    // Admins always see the configured link so they can check it.
    accessUrl: access.url || null,
    accessNote: access.note || null,
    user: user ? { id: String(user._id), name: user.name, email: user.email } : null,
    reviewedBy: order.reviewedBy ?? null,
  };
}

async function withAccess(order: OrderDoc) {
  return toOrderDto(
    order,
    order.status === 'approved' ? await accessFor(order.productId) : undefined,
  );
}

/* ─────────────── Buyer actions ─────────────── */

const activeStatuses = ['awaiting_payment', 'submitted', 'approved'];

export async function checkoutConfig(userId: string, productId: string): Promise<CheckoutConfig> {
  const product = getProduct(productId);
  if (!product) throw new HttpError(404, 'This product does not exist.');
  const existing = await Order.findOne({
    userId,
    productId,
    status: { $in: activeStatuses },
  }).sort({ createdAt: -1 });
  return {
    product,
    networks: availableNetworks(),
    existingOrder: existing ? await withAccess(existing) : null,
  };
}

/**
 * Creates an order (or updates the buyer's unpaid order for the same product, e.g. to switch
 * network). Price and wallet come from the server, never from the browser.
 */
export async function createOrder(userId: string, input: CreateOrderInput) {
  const product = getProduct(input.productId)!;
  const address = walletAddress(input.network);
  if (!address) throw new HttpError(400, `${input.network} payments are not available right now.`);

  const existing = await Order.findOne({
    userId,
    productId: product.id,
    status: { $in: activeStatuses },
  });
  if (existing && existing.status !== 'awaiting_payment')
    throw new HttpError(
      409,
      existing.status === 'approved'
        ? 'You already own this. Find it in My courses.'
        : 'You already submitted a payment for this. It is being reviewed.',
    );
  const details = {
    network: input.network,
    walletAddress: address,
    amount: product.price,
    buyerName: input.buyerName,
    accessEmail: input.accessEmail,
    whatsapp: input.whatsapp,
    telegram: input.telegram,
  };
  if (existing) {
    existing.set(details);
    return withAccess(await existing.save());
  }
  const order = await Order.create({
    ...details,
    orderNumber: newOrderNumber(),
    userId,
    productId: product.id,
    productType: product.type,
    productTitle: product.title,
  });
  return withAccess(order);
}

async function findMine(userId: string, orderNumber: string) {
  const order = await Order.findOne({ userId, orderNumber });
  if (!order) throw new HttpError(404, 'Order not found.');
  return order;
}

export async function listMine(userId: string) {
  const orders = await Order.find({ userId }).sort({ createdAt: -1 });
  return Promise.all(orders.map(withAccess));
}

export async function getMine(userId: string, orderNumber: string) {
  return withAccess(await findMine(userId, orderNumber));
}

/** Buyer submits the blockchain transaction ID; the admin is emailed a one-time review link. */
export async function submitPayment(userId: string, orderNumber: string, rawTxHash: string) {
  const order = await findMine(userId, orderNumber);
  if (order.status !== 'awaiting_payment' && order.status !== 'rejected')
    throw new HttpError(409, 'A payment has already been submitted for this order.');
  const network = order.network as PaymentNetwork;
  const txHash = network === 'TRC20' ? rawTxHash.replace(/^0x/i, '') : rawTxHash;
  if (!networkInfo[network].txPattern.test(txHash))
    throw new HttpError(
      422,
      network === 'TRC20'
        ? 'Enter the 64-character TRC20 transaction ID (hash) from your wallet or exchange.'
        : `Enter the ${network} transaction hash: 0x followed by 64 characters.`,
    );
  const reused = await Order.exists({ network, txHash, _id: { $ne: order._id } });
  if (reused) throw new HttpError(409, 'This transaction ID was already used for another order.');

  const token = randomBytes(32).toString('base64url');
  order.set({
    txHash,
    status: 'submitted',
    submittedAt: new Date(),
    rejectReason: null,
    reviewedAt: null,
    reviewedBy: null,
    reviewTokenHash: hashToken(token),
    reviewTokenExpiresAt: new Date(Date.now() + REVIEW_TOKEN_DAYS * 86_400_000),
  });
  await order.save();

  const user = await User.findById(userId);
  const account = { name: user?.name ?? order.buyerName, email: user?.email ?? order.accessEmail };
  // Emails are best-effort: the order is saved even if a provider hiccups; admins also see it in the portal.
  const results = await Promise.allSettled([
    env.ADMIN_NOTIFY_EMAIL
      ? sendEmail(adminNewPaymentEmail(order, account, token))
      : Promise.resolve(),
    sendEmail(buyerPaymentReceivedEmail(order, account.email)),
  ]);
  for (const result of results)
    if (result.status === 'rejected') console.error('Order email failed:', result.reason);
  return withAccess(order);
}

/* ─────────────── Admin actions ─────────────── */

async function notifyBuyer(
  order: OrderDoc,
  build: (to: string) => Parameters<typeof sendEmail>[0],
) {
  const user = await User.findById(order.userId);
  try {
    await sendEmail(build(user?.email ?? order.accessEmail));
  } catch (error) {
    console.error('Buyer email failed:', error);
  }
}

export async function approveOrder(order: OrderDoc, reviewer: string) {
  if (order.status !== 'submitted')
    throw new HttpError(
      409,
      `Only submitted payments can be approved (this one is ${order.status}).`,
    );
  order.set({
    status: 'approved',
    accessRevoked: false,
    reviewedAt: new Date(),
    reviewedBy: reviewer,
    reviewTokenHash: null,
    reviewTokenExpiresAt: null,
  });
  await order.save();
  const access = await accessFor(order.productId);
  await notifyBuyer(order, (to) => buyerApprovedEmail(order, to, access));
  return order;
}

export async function rejectOrder(order: OrderDoc, reason: string, reviewer: string) {
  if (order.status !== 'submitted')
    throw new HttpError(
      409,
      `Only submitted payments can be rejected (this one is ${order.status}).`,
    );
  order.set({
    status: 'rejected',
    rejectReason: reason,
    reviewedAt: new Date(),
    reviewedBy: reviewer,
    reviewTokenHash: null,
    reviewTokenExpiresAt: null,
  });
  await order.save();
  await notifyBuyer(order, (to) => buyerRejectedEmail(order, to, reason));
  return order;
}

export async function setAccessRevoked(order: OrderDoc, revoked: boolean) {
  if (order.status !== 'approved') throw new HttpError(409, 'Only approved orders have access.');
  order.accessRevoked = revoked;
  return order.save();
}

/** Finds the order for an emailed review token (null if unknown or expired). */
export async function findByReviewToken(token: string) {
  return Order.findOne({ reviewTokenHash: hashToken(token) }).select(
    '+reviewTokenHash +reviewTokenExpiresAt',
  );
}

export const reviewTokenUsable = (order: OrderDoc) =>
  Boolean(order.get('reviewTokenExpiresAt')) &&
  (order.get('reviewTokenExpiresAt') as Date).getTime() > Date.now() &&
  order.status === 'submitted';
