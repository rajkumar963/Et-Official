import { Router } from 'express';
import * as controller from './trades.controller';
export const tradesRouter = Router();
tradesRouter.route('/').get(controller.list).post(controller.create);
tradesRouter.route('/:id').get(controller.get).patch(controller.update).delete(controller.remove);
