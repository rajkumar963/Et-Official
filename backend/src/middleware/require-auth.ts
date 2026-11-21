import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Session } from '../models/Session';
import { User } from '../models/User';
import { HttpError } from '../utils/http-error';
export type AuthRequest = Request & { userId: string };
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies.tj_access;
    if (!token) throw new Error();
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: ['HS256'],
      issuer: 'et-trader',
      audience: 'et-trader-web',
    }) as jwt.JwtPayload;
    const [session, user] = await Promise.all([
      Session.exists({ _id: payload.sid, userId: payload.sub, expiresAt: { $gt: new Date() } }),
      User.findById(payload.sub).select('blocked'),
    ]);
    if (!session || !user) throw new Error();
    // A suspended account keeps no access: 403 (not 401) so the client shows the reason, not a re-login loop.
    if (user.get('blocked'))
      return next(new HttpError(403, 'Your account has been suspended. Please contact support.'));
    (req as AuthRequest).userId = String(payload.sub);
    next();
  } catch {
    next(new HttpError(401, 'Please sign in to continue'));
  }
}
