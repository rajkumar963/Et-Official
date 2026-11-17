import type { Request, Response } from 'express';
import { signupSchema, loginSchema, verifyEmailSchema } from '@et-trader/shared';
import * as service from './auth.service';
import { issueSession, clearSession, hashToken } from './auth.tokens';
import {
  checkCode,
  clearChallengeCookie,
  resendCode,
  startVerification,
  verificationStatus,
} from './email-verification';
import { Session } from '../../models/Session';
import { User, userDto } from '../../models/User';
import type { AuthRequest } from '../../middleware/require-auth';
import { HttpError } from '../../utils/http-error';

/** Sign-up never signs in directly: it emails a code first (202 + verification_required). */
export async function signup(req: Request, res: Response) {
  const user = await service.signup(signupSchema.parse(req.body));
  res.status(202).json({ data: await startVerification(res, user) });
}

export async function login(req: Request, res: Response) {
  const user = await service.login(loginSchema.parse(req.body));
  if (user.emailVerified === false) {
    res.status(202).json({ data: await startVerification(res, user) });
    return;
  }
  await issueSession(res, String(user._id));
  res.json({ data: { status: 'authenticated', user: userDto(user) } });
}

export async function verification(req: Request, res: Response) {
  res.json({ data: await verificationStatus(req) });
}

export async function verifyEmail(req: Request, res: Response) {
  const { code } = verifyEmailSchema.parse(req.body);
  const userId = await checkCode(req, code);
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { emailVerified: true } },
    { new: true },
  );
  if (!user) throw new HttpError(404, 'This account no longer exists.');
  clearChallengeCookie(res);
  await issueSession(res, userId);
  res.json({ data: { status: 'authenticated', user: userDto(user) } });
}

export async function resendVerification(req: Request, res: Response) {
  res.json({ data: await resendCode(req) });
}

export async function me(req: Request, res: Response) {
  const user = await User.findById((req as AuthRequest).userId);
  if (!user) throw new HttpError(401, 'Account no longer exists');
  res.json({ data: userDto(user) });
}

export async function refresh(req: Request, res: Response) {
  if (!req.cookies.tj_refresh) throw new HttpError(401, 'Session expired');
  const old = await Session.findOneAndDelete({
    tokenHash: hashToken(req.cookies.tj_refresh),
    expiresAt: { $gt: new Date() },
  });
  if (!old) throw new HttpError(401, 'Session expired');
  await issueSession(res, String(old.userId));
  res.json({ data: { refreshed: true } });
}

export async function logout(req: Request, res: Response) {
  if (req.cookies.tj_refresh)
    await Session.deleteOne({ tokenHash: hashToken(req.cookies.tj_refresh) });
  clearSession(res);
  res.json({ data: { loggedOut: true } });
}
