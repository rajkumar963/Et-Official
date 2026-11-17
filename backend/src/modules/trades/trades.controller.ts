import type { Request, Response } from 'express';
import type { AuthRequest } from '../../middleware/require-auth';
import * as schema from './trades.validation';
import * as service from './trades.service';
const owner = (req: Request) => (req as AuthRequest).userId;
export async function list(req: Request, res: Response) {
  const q = schema.tradeQuerySchema.parse(req.query);
  res.json({ data: await service.list(owner(req), q.month, q.year) });
}
export async function create(req: Request, res: Response) {
  res.status(201).json({
    data: await service.create(owner(req), schema.tradeCreateSchema.parse(req.body)),
  });
}
export async function get(req: Request, res: Response) {
  res.json({
    data: await service.get(owner(req), schema.idSchema.parse(req.params.id)),
  });
}
export async function update(req: Request, res: Response) {
  res.json({
    data: await service.update(
      owner(req),
      schema.idSchema.parse(req.params.id),
      schema.tradePatchSchema.parse(req.body),
    ),
  });
}
export async function remove(req: Request, res: Response) {
  await service.remove(owner(req), schema.idSchema.parse(req.params.id));
  res.json({ data: { deleted: true } });
}
