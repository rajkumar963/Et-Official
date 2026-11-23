import { Router, type Request, type Response } from 'express';
import { withdrawalCreateSchema, type WithdrawalDto } from '@et-trader/shared';
import type { AuthRequest } from '../../middleware/require-auth';
import { Withdrawal } from '../../models/Withdrawal';
import { HttpError } from '../../utils/http-error';

export const withdrawalsRouter = Router();

const idPattern = /^[a-f0-9]{24}$/i;
type WithdrawalDoc = InstanceType<typeof Withdrawal>;

const toDto = (w: WithdrawalDoc): WithdrawalDto => ({
  id: String(w._id),
  amount: w.get('amount'),
  date: w.get('date'),
  note: w.get('note') ?? '',
  createdAt: new Date(w.get('createdAt')).toISOString(),
});

withdrawalsRouter.get('/', async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).userId;
  const list = await Withdrawal.find({ userId }).sort({ date: -1, createdAt: -1 }).limit(500);
  res.json({ data: list.map(toDto) });
});

withdrawalsRouter.post('/', async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).userId;
  const values = withdrawalCreateSchema.parse(req.body);
  const created = await Withdrawal.create({ ...values, userId });
  res.status(201).json({ data: toDto(created) });
});

withdrawalsRouter.delete('/:id', async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).userId;
  const id = String(req.params.id);
  if (!idPattern.test(id)) throw new HttpError(404, 'Withdrawal not found.');
  // Scope the delete to the owner so one account can never remove another's record.
  const deleted = await Withdrawal.findOneAndDelete({ _id: id, userId });
  if (!deleted) throw new HttpError(404, 'Withdrawal not found.');
  res.json({ data: { id } });
});
