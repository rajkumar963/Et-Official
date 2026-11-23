import { z } from 'zod';
export const daySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a valid date')
  .refine(
    (value) =>
      !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value,
    'Enter a valid calendar date',
  );
export const signupSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.email().trim().toLowerCase(),
    password: z.string().min(10).max(72),
  })
  .strict();
export const loginSchema = signupSchema.pick({ email: true, password: true });
export const verifyEmailSchema = z
  .object({
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, 'Enter the 6-digit code from your email'),
  })
  .strict();
const tradeFields = {
  date: daySchema,
  symbol: z
    .string()
    .trim()
    .min(1, 'Enter the symbol you traded')
    .max(20, 'Use at most 20 characters')
    // Real tickers include spaces and punctuation (BANK NIFTY, S&P 500, GOLD (XAUUSD), EUR/USD),
    // so the set is permissive; the message names the allowed characters instead of dumping a regex.
    .regex(
      /^[A-Za-z0-9 .\-/:&_()#]+$/,
      'Use letters, numbers, spaces and . - / : & _ ( ) #',
    )
    // Collapse repeated spaces so "BANK   NIFTY" and "BANK NIFTY" are the same symbol.
    .transform((v) => v.replace(/\s+/g, ' ').toUpperCase()),
  side: z.enum(['long', 'short']),
  pnl: z.number().finite().min(-1e12).max(1e12),
  entryPrice: z.number().nonnegative().optional(),
  exitPrice: z.number().nonnegative().optional(),
  quantity: z.number().positive().optional(),
  strategy: z.string().trim().max(100),
  notes: z.string().max(5000),
  tags: z.array(z.string().max(40)).max(10),
};
export const tradeCreateSchema = z
  .object({
    ...tradeFields,
    strategy: tradeFields.strategy.default(''),
    notes: tradeFields.notes.default(''),
    tags: tradeFields.tags.default([]),
  })
  .strict();
// Built from the default-free fields: Zod 4 applies .default() even inside .partial(),
// which would silently overwrite strategy/notes/tags on every partial update.
export const tradePatchSchema = z
  .object(tradeFields)
  .partial()
  .strict()
  .refine((v) => Object.keys(v).length > 0, 'Supply at least one field');
export const tradeQuerySchema = z
  .object({
    month: z.coerce.number().int().min(0).max(11).optional(),
    year: z.coerce.number().int().min(1970).max(2200).optional(),
  })
  .strict()
  .refine(
    (v) => (v.month === undefined) === (v.year === undefined),
    'Supply month and year together',
  );
/**
 * Profile photo: a small, client-resized data URL (data:image/...;base64,...), or an empty
 * string to remove it. Images are resized on the client before upload, so the cap is generous.
 */
export const profileImageSchema = z
  .string()
  .max(2_000_000, 'Image is too large — pick a smaller photo')
  .refine(
    (v) => v === '' || /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(v),
    'Unsupported image format',
  );
export const profileUpdateSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    startingBalance: z.number().finite().min(0).max(1e12).optional(),
    image: profileImageSchema.optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, 'Supply at least one field');
/** @deprecated use profileUpdateSchema */
export const startingBalanceSchema = profileUpdateSchema;
export const idSchema = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid record ID');
export type TradeInput = z.infer<typeof tradeCreateSchema>;
export type TradePatch = z.infer<typeof tradePatchSchema>;

/* ───────────────────────── Withdrawals ─────────────────────────
 * Cash the trader takes out of the account. Recorded separately from trades so trading
 * performance (P&L, equity curve) stays untouched while the cash balance drops. */
export const withdrawalCreateSchema = z
  .object({
    amount: z
      .number()
      .positive('Enter an amount greater than zero')
      .max(1e12, 'That amount is too large'),
    date: daySchema,
    note: z.string().trim().max(200).default(''),
  })
  .strict();
export type WithdrawalCreateInput = z.infer<typeof withdrawalCreateSchema>;
