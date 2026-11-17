import type { Request, Response, NextFunction } from 'express';
import { User, isAdmin } from '../models/User';
import { HttpError } from '../utils/http-error';
import type { AuthRequest } from './require-auth';

/** Use after requireAuth. Admins are the verified accounts listed in ADMIN_EMAILS. */
export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    const user = await User.findById((req as AuthRequest).userId);
    if (!user || !isAdmin(user)) throw new HttpError(403, 'Admins only.');
    (req as AuthRequest & { adminEmail: string }).adminEmail = user.email;
    next();
  } catch (error) {
    next(error);
  }
}
