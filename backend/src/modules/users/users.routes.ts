import { Router } from 'express';
import * as controller from './users.controller';
export const usersRouter = Router();
usersRouter.get('/me', controller.get);
usersRouter.patch('/me', controller.update);
