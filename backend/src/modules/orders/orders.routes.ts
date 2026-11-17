import { Router, type Request, type Response } from 'express';
import { createOrderSchema, submitPaymentSchema } from '@et-trader/shared';
import type { AuthRequest } from '../../middleware/require-auth';
import * as service from './orders.service';

const owner = (req: Request) => (req as AuthRequest).userId;
const orderNumber = (req: Request) => String(req.params.orderNumber).toUpperCase();

export const ordersRouter = Router();

/** Checkout data for a product: price, available networks and any order already in progress. */
ordersRouter.get('/checkout/:productId', async (req: Request, res: Response) => {
  res.json({ data: await service.checkoutConfig(owner(req), String(req.params.productId)) });
});

ordersRouter.get('/', async (req: Request, res: Response) => {
  res.json({ data: await service.listMine(owner(req)) });
});

ordersRouter.post('/', async (req: Request, res: Response) => {
  res.status(201).json({
    data: await service.createOrder(owner(req), createOrderSchema.parse(req.body)),
  });
});

ordersRouter.get('/:orderNumber', async (req: Request, res: Response) => {
  res.json({ data: await service.getMine(owner(req), orderNumber(req)) });
});

ordersRouter.post('/:orderNumber/payment', async (req: Request, res: Response) => {
  const { txHash } = submitPaymentSchema.parse(req.body);
  res.json({ data: await service.submitPayment(owner(req), orderNumber(req), txHash) });
});
