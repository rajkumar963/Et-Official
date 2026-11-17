import type { Request, Response } from 'express';
import { startingBalanceSchema } from '@et-trader/shared';
import type { AuthRequest } from '../../middleware/require-auth';
import * as service from './users.service';
export async function get(req: Request, res: Response) {
  res.json({ data: await service.get((req as AuthRequest).userId) });
}
export async function update(req: Request, res: Response) {
  res.json({
    data: await service.update((req as AuthRequest).userId, startingBalanceSchema.parse(req.body)),
  });
}
