import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../utils/http-error';

function statusOf(error: any): number {
  if (error instanceof ZodError) return 422;
  if (error instanceof HttpError) return error.status;
  if (error?.code === 11000) return 409;
  if (error?.type === 'entity.parse.failed') return 400;
  if (error?.type === 'entity.too.large') return 413;
  return 500;
}

function messageOf(error: any, status: number): string {
  if (error instanceof ZodError)
    return error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  if (status === 409 && error?.code === 11000)
    return error.keyPattern?.email ? 'This email is already registered' : 'Record already exists';
  // Never leak internal error details; HttpErrors carry intentionally public messages.
  if (status >= 500 && !(error instanceof HttpError)) return 'An unexpected error occurred';
  return error?.message || 'Request failed';
}

export function errorHandler(error: any, _req: Request, res: Response, _next: NextFunction) {
  const status = statusOf(error);
  if (status >= 500) console.error(error);
  res.status(status).json({ error: { message: messageOf(error, status) } });
}
