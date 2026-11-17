import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { Response } from 'express';
import { env } from '../../config/env';
import { Session } from '../../models/Session';
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
export const cookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: 'lax' as const,
  path: '/',
};
export async function issueSession(res: Response, userId: string) {
  const refresh = randomBytes(48).toString('hex');
  const session = await Session.create({
    userId,
    tokenHash: hashToken(refresh),
    expiresAt: new Date(Date.now() + 7 * 86400000),
  });
  const access = jwt.sign({ sid: String(session._id) }, env.JWT_ACCESS_SECRET, {
    subject: userId,
    expiresIn: '15m',
    issuer: 'et-trader',
    audience: 'et-trader-web',
  });
  res.cookie('tj_access', access, { ...cookieOptions, maxAge: 15 * 60000 });
  res.cookie('tj_refresh', refresh, { ...cookieOptions, maxAge: 7 * 86400000 });
}
export function clearSession(res: Response) {
  res.clearCookie('tj_access', cookieOptions);
  res.clearCookie('tj_refresh', cookieOptions);
}
