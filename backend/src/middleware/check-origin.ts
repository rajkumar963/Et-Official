import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { HttpError } from '../utils/http-error';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const allowedOrigins = new Set(env.FRONTEND_ORIGINS);

/** CSRF defence: state-changing requests must come from the configured frontend origin. */
export function checkOrigin(req: Request, _res: Response, next: NextFunction) {
  if (!SAFE_METHODS.has(req.method) && !allowedOrigins.has(req.get('origin') ?? ''))
    return next(new HttpError(403, 'Request origin is not allowed'));
  next();
}
