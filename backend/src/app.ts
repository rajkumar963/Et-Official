import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { env } from './config/env';
import { checkOrigin } from './middleware/check-origin';
import { requireAuth } from './middleware/require-auth';
import { errorHandler } from './middleware/error-handler';
import { authRouter } from './modules/auth/auth.routes';
import { tradesRouter } from './modules/trades/trades.routes';
import { analyticsRouter } from './modules/analytics/analytics.routes';
import { usersRouter } from './modules/users/users.routes';
import { ordersRouter } from './modules/orders/orders.routes';
import { adminRouter } from './modules/admin/admin.routes';
export const app = express();
app.disable('x-powered-by');
// Behind proxies, use X-Forwarded-For so rate limits apply per visitor, not per proxy.
if (env.TRUST_PROXY > 0) app.set('trust proxy', env.TRUST_PROXY);
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_ORIGINS, credentials: true }));
app.use(express.json({ limit: '64kb' }));
app.use(cookieParser());
app.use(checkOrigin);
app.get('/api/v1/health', (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({
    data: {
      status: ready ? 'ok' : 'unavailable',
      database: ready ? 'connected' : 'disconnected',
    },
  });
});
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/trades', requireAuth, tradesRouter);
app.use('/api/v1/analytics', requireAuth, analyticsRouter);
app.use('/api/v1/users', requireAuth, usersRouter);
app.use('/api/v1/orders', requireAuth, ordersRouter);
app.use('/api/v1/admin', adminRouter);
app.use((_req, res) => {
  res.status(404).json({ error: { message: 'Endpoint not found' } });
});
app.use(errorHandler);
