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

/* ───────── Payment QR ─────────
 * USDT is a token, so only EVM chains have a widely-read "transfer with amount" URI (EIP-681).
 * Supported wallets (MetaMask, Trust, …) prefill the amount from it; Tron wallets and most
 * exchanges read only the address, so TRC20 stays address-only and the UI keeps the manual note. */
const usdtToken: Record<PaymentNetwork, { contract: string; decimals: number; chainId: number } | null> =
  {
    ERC20: { contract: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, chainId: 1 },
    BEP20: { contract: '0x55d398326f99059fF775485246999027B3197955', decimals: 18, chainId: 56 },
    TRC20: null,
  };

/** Amount (e.g. 199 or 199.5) → integer token base units as a string, without floating-point error. */
function toTokenUnits(amount: number, decimals: number): string {
  const [whole, frac = ''] = amount.toString().split('.');
  const fracPadded = (frac + '0'.repeat(decimals)).slice(0, decimals);
  return (BigInt(whole || '0') * 10n ** BigInt(decimals) + BigInt(fracPadded || '0')).toString();
}

/** True when scanning the QR for this network can prefill the amount in supported wallets. */
export const qrCarriesAmount = (network: PaymentNetwork) => usdtToken[network] !== null;

/** QR payload: an EIP-681 token-transfer URI (with amount) on EVM chains, else the bare address. */
export function paymentQrValue(network: PaymentNetwork, address: string, amount: number): string {
  const token = usdtToken[network];
  if (!token) return address;
  return `ethereum:${token.contract}@${token.chainId}/transfer?address=${address}&uint256=${toTokenUnits(amount, token.decimals)}`;
}

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
  blocked: boolean;
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

/* ───────────────────────── Course lessons (video) ───────────────────────── */

/** Where a lesson video is hosted. Both embed view-only (no download button in the player). */
export const lessonProviders = ['drive', 'youtube'] as const;
export type LessonProvider = (typeof lessonProviders)[number];

/**
 * Detects a Google Drive or YouTube video from a pasted link (or bare id) and returns the
 * provider + stable id. Returns null if it isn't a recognisable Drive/YouTube video.
 */
export function lessonSource(input: string): { provider: LessonProvider; id: string } | null {
  const s = input.trim();
  const youtube = s.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  if (youtube) return { provider: 'youtube', id: youtube[1] };
  const drivePath = s.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/);
  if (drivePath) return { provider: 'drive', id: drivePath[1] };
  const driveQuery = s.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (driveQuery) return { provider: 'drive', id: driveQuery[1] };
  // A link that is clearly one of the two but didn't match above is invalid, not a bare id.
  if (/youtube\.com|youtu\.be|drive\.google|docs\.google/i.test(s)) return null;
  // Bare id fallback: YouTube ids are exactly 11 chars; Drive ids are longer.
  if (/^[a-zA-Z0-9_-]{11}$/.test(s)) return { provider: 'youtube', id: s };
  if (/^[a-zA-Z0-9_-]{12,}$/.test(s)) return { provider: 'drive', id: s };
  return null;
}

/** View-only player URL embedded in an iframe (no download control for either provider). */
export function lessonEmbedUrl(provider: LessonProvider, id: string): string {
  return provider === 'youtube'
    ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`
    : `https://drive.google.com/file/d/${id}/preview`;
}

/** Canonical link, reconstructed for admin display/editing. */
export function lessonWatchUrl(provider: LessonProvider, id: string): string {
  return provider === 'youtube'
    ? `https://youtu.be/${id}`
    : `https://drive.google.com/file/d/${id}/view`;
}

export const lessonInputSchema = z
  .object({
    title: z.string().trim().min(1, 'Add a lesson title').max(200),
    videoUrl: z
      .string()
      .trim()
      .min(5)
      .max(500)
      .refine((v) => lessonSource(v) !== null, 'Paste a Google Drive or YouTube video link'),
  })
  .strict();
export type LessonInput = z.infer<typeof lessonInputSchema>;

export const lessonReorderSchema = z.object({ ids: z.array(z.string().min(1)).min(1) }).strict();

/** A lesson as the learner sees it: an embeddable, view-only player URL. */
export interface LessonDto {
  id: string;
  title: string;
  order: number;
  provider: LessonProvider;
  embedUrl: string;
}

/** Admin view of a lesson: includes the source link for editing. */
export interface AdminLessonDto {
  id: string;
  productId: string;
  title: string;
  order: number;
  provider: LessonProvider;
  videoUrl: string;
}

/** A purchased course's study material, returned to the in-app viewer. */
export interface CourseContentDto {
  productId: string;
  title: string;
  lessons: LessonDto[];
}
