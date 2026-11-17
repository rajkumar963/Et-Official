/** Public (browser-exposed) configuration. Never put secrets in NEXT_PUBLIC_* variables. */
/** Defaults to the same-origin proxy (see next.config.ts rewrites → BACKEND_URL). */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || '';
