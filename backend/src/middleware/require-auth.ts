import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Session } from '../models/Session';
import { HttpError } from '../utils/http-error';
export type AuthRequest = Request & { userId: string };
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies.tj_access;
    if (!token) throw new Error();
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: ['HS256'],
      issuer: 'et-trader',
      audience: 'et-trader-web',
    }) as jwt.JwtPayload;
    const session = await Session.exists({
      _id: payload.sid,
      userId: payload.sub,
      expiresAt: { $gt: new Date() },
    });
    if (!session) throw new Error();
    (req as AuthRequest).userId = String(payload.sub);
    next();
  } catch {
    next(new HttpError(401, 'Please sign in to continue'));
  }
}
