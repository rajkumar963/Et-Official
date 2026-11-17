import { Router } from 'express';
import { summary } from './analytics.controller';
export const analyticsRouter = Router();
analyticsRouter.get('/summary', summary);
