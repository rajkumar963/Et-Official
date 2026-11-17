import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import * as controller from './auth.controller';
import { googleRouter } from './oauth.google';
import { requireAuth } from '../../middleware/require-auth';
export const authRouter = Router();
const limiter = rateLimit({
  windowMs: 15 * 60000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: { message: 'Too many attempts. Try again later.' } },
});
authRouter.post('/signup', limiter, controller.signup);
authRouter.post('/login', limiter, controller.login);
authRouter.get('/me', requireAuth, controller.me);
authRouter.post('/refresh', limiter, controller.refresh);
// Email verification (one-time code). Codes are also limited per account inside the service.
const verifyLimiter = rateLimit({
  windowMs: 15 * 60000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: { message: 'Too many attempts. Try again later.' } },
});
authRouter.get('/verification', controller.verification);
authRouter.post('/verify-email', verifyLimiter, controller.verifyEmail);
authRouter.post('/resend-verification', verifyLimiter, controller.resendVerification);
authRouter.post('/logout', controller.logout);
authRouter.use(googleRouter);
