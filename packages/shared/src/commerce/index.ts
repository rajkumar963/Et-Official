import { z } from 'zod';

/* ───────────────────────── Product catalog ─────────────────────────
 * The single source of truth for what can be bought and its price (USDT). The backend charges
 * these prices; the frontend shows them. Marketing copy lives in the frontend data files. */

export type ProductType = 'course' | 'ebook';

export interface Product {
  id: string;
  type: ProductType;
  title: string;
  price: number;
}

export const products: Product[] = [
  { id: 'basic-to-advanced-course', type: 'course', title: 'Basic to Advanced Trading Course', price: 199 },
  { id: 'advanced-to-pro-course', type: 'course', title: 'Advanced to Pro Trading Course', price: 319 },
  { id: 'price-action-patterns', type: 'ebook', title: 'Price Action Patterns 2.0', price: 30 },
  {
    id: 'candlestick-chart-patterns-hindi',
    type: 'ebook',
    title: 'Technical Candlestick & Chart Pattern E-Book',
    price: 30,
  },
  { id: 'gold-strategy-book', type: 'ebook', title: 'Gold Strategy Book', price: 175 },
];

export function getProduct(id: string) {
  return products.find((product) => product.id === id);
}

/** Price in USDT for a product id (throws for unknown ids so typos fail loudly). */
export function productPrice(id: string) {
  const product = getProduct(id);
  if (!product) throw new Error(`Unknown product: ${id}`);
  return product.price;
}

/* ───────────────────────── Payment networks ───────────────────────── */

export const paymentNetworks = ['TRC20', 'BEP20', 'ERC20'] as const;
export type PaymentNetwork = (typeof paymentNetworks)[number];

export const networkInfo: Record<
  PaymentNetwork,
  { label: string; chain: string; explorerTx: (hash: string) => string; txPattern: RegExp }
> = {
  TRC20: {
    label: 'TRC20',
    chain: 'Tron',
    explorerTx: (hash) => `https://tronscan.org/#/transaction/${hash}`,
    txPattern: /^[a-fA-F0-9]{64}$/,
  },
  BEP20: {
    label: 'BEP20',
    chain: 'BNB Smart Chain',
    explorerTx: (hash) => `https://bscscan.com/tx/${hash}`,
    txPattern: /^0x[a-fA-F0-9]{64}$/,
  },
  ERC20: {
    label: 'ERC20',
    chain: 'Ethereum',
    explorerTx: (hash) => `https://etherscan.io/tx/${hash}`,
    txPattern: /^0x[a-fA-F0-9]{64}$/,
  },
};

/* ───────────────────────── Orders ───────────────────────── */

/**
 * awaiting_payment → buyer created the order and sees payment details
 * submitted        → buyer entered a transaction ID; waiting for an admin
 * approved         → admin confirmed the payment; buyer has access
 * rejected         → admin could not confirm the payment
 */
export const orderStatuses = ['awaiting_payment', 'submitted', 'approved', 'rejected'] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export const createOrderSchema = z
  .object({
    productId: z.string().refine((id) => Boolean(getProduct(id)), 'Unknown product'),
    network: z.enum(paymentNetworks),
    buyerName: z.string().trim().min(2).max(80),
    accessEmail: z
      .email('Enter a valid Gmail address')
      .trim()
      .toLowerCase()
      .refine(
        (email) => email.endsWith('@gmail.com'),
        'Use a Gmail address (ends with @gmail.com)',
      ),
    whatsapp: z.string().trim().max(30).optional().default(''),
    telegram: z.string().trim().max(40).optional().default(''),
  })
  .strict();
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const submitPaymentSchema = z
  .object({ txHash: z.string().trim().min(10).max(100) })
  .strict();

export const rejectOrderSchema = z
  .object({ reason: z.string().trim().min(3, 'Give the buyer a short reason').max(500) })
  .strict();

export const reviewActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('approve') }).strict(),
  z.object({ action: z.literal('reject'), reason: z.string().trim().min(3).max(500) }).strict(),
]);

export const productSettingSchema = z
  .object({
    accessUrl: z.union([z.url().max(500), z.literal('')]),
    accessNote: z.string().trim().max(500).optional().default(''),
  })
  .strict();

export interface OrderDto {
  id: string;
  orderNumber: string;
  productId: string;
  productType: ProductType;
  productTitle: string;
  amount: number;
  currency: 'USDT';
  network: PaymentNetwork;
  walletAddress: string;
  buyerName: string;
  accessEmail: string;
  whatsapp: string;
  telegram: string;
  txHash: string | null;
  explorerUrl: string | null;
  status: OrderStatus;
  accessRevoked: boolean;
  /** Only present once the order is approved and access has not been revoked. */
  accessUrl: string | null;
  accessNote: string | null;
  rejectReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

/** Admin view of an order: adds the account it belongs to and who reviewed it. */
export interface AdminOrderDto extends OrderDto {
  user: { id: string; name: string; email: string } | null;
  reviewedBy: string | null;
}

export interface AdminUserDto {
  id: string;
  name: string;
  email: string;
  providers: string[];
  emailVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
  orders: number;
  approvedOrders: number;
  totalSpent: number;
}

export interface AdminStats {
  users: number;
  verifiedUsers: number;
  orders: Record<OrderStatus, number>;
  revenue: number;
  revenueLast30Days: number;
  recentOrders: AdminOrderDto[];
}

export interface CheckoutConfig {
  product: Product;
  /** Networks that have a wallet address configured. */
  networks: PaymentNetwork[];
  /** True when this account already has an order for the product that isn't rejected. */
  existingOrder: OrderDto | null;
}

export interface ProductSettingDto {
  productId: string;
  title: string;
  type: ProductType;
  price: number;
  accessUrl: string;
  accessNote: string;
}

/** Public data for the email review page (opened from the admin notification email). */
export interface ReviewDto {
  order: AdminOrderDto;
  /** Whether the review link can still be used. */
  actionable: boolean;
}
