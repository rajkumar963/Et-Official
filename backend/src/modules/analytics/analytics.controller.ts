import type { Request, Response } from 'express';
import type { AuthRequest } from '../../middleware/require-auth';
import { getSummary } from './analytics.service';
export async function summary(req: Request, res: Response) {
  res.json({ data: await getSummary((req as AuthRequest).userId) });
}
