import 'dotenv/config';
import { z } from 'zod';
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().default(4000),
  /** Number of reverse proxies in front of the API (e.g. Vercel rewrite + host load balancer = 2). 0 locally. */
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  /** Canonical frontend URL used in emails and OAuth redirects. */
  FRONTEND_URL: z.url().default('https://www.etofficial.com'),
  /** Allowed browser origins for CORS and the CSRF origin check. */
  FRONTEND_ORIGINS: z
    .string()
    .default('https://www.etofficial.com,https://etofficial.com')
    .transform((value) => value.split(',').map((origin) => new URL(origin.trim()).origin)),
  MONGODB_URI: z.string().startsWith('mongodb').default('mongodb://127.0.0.1:27017/et-trader'),
  JWT_ACCESS_SECRET: z.string().min(32),
  COOKIE_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.url().default('http://localhost:4000/api/v1/auth/google/callback'),
  /** Resend API key (https://resend.com/api-keys). Without it, non-production prints OTP codes to the console. */
  RESEND_API_KEY: z
    .string()
    .startsWith('re_')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  /** Sender shown on verification emails. onboarding@resend.dev only delivers to your own Resend account email. */
  MAIL_FROM: z.string().min(3).default('ET Trader <onboarding@resend.dev>'),
  /** Comma-separated emails that get the admin section (they must sign up and verify first). */
  ADMIN_EMAILS: z
    .string()
    .default('')
    .transform((v) =>
      v
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean),
    ),
  /** Where new-payment notifications (with the review link) are sent. */
  ADMIN_NOTIFY_EMAIL: z.union([z.email(), z.literal('')]).default(''),
  /** USDT receiving addresses. A network without an address is hidden at checkout. */
  USDT_TRC20_ADDRESS: z.string().trim().default(''),
  USDT_BEP20_ADDRESS: z.string().trim().default(''),
  USDT_ERC20_ADDRESS: z.string().trim().default(''),
});
export const env = schema.parse(process.env);
if (env.NODE_ENV === 'production' && !env.COOKIE_SECURE)
  throw new Error('Production requires COOKIE_SECURE=true');
if (env.NODE_ENV === 'production' && !env.RESEND_API_KEY)
  throw new Error('Production requires RESEND_API_KEY so verification codes can be emailed');
