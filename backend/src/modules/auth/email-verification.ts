import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import type { Request, Response } from 'express';
import { env } from '../../config/env';
import { EmailChallenge } from '../../models/EmailChallenge';
import { User } from '../../models/User';
import { HttpError } from '../../utils/http-error';
import { sendEmail, verificationEmail } from '../../services/mailer';
import { cookieOptions, hashToken } from './auth.tokens';

export const VERIFY_COOKIE = 'tj_verify';
const CODE_MINUTES = 10;
const CHALLENGE_MINUTES = 30;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60_000;
const MAX_SENDS_PER_HOUR = 5;

const hmac = (value: string) =>
  createHmac('sha256', env.JWT_ACCESS_SECRET).update(`email-otp:${value}`).digest('hex');
const newCode = () => String(randomInt(0, 1_000_000)).padStart(6, '0');
const minutesFromNow = (minutes: number) => new Date(Date.now() + minutes * 60_000);

export function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  const visible = local.length <= 2 ? local[0] : local.slice(0, 2);
  return `${visible}${'•'.repeat(Math.max(1, Math.min(6, local.length - visible.length)))}@${domain}`;
}

function setChallengeCookie(res: Response, token: string) {
  res.cookie(VERIFY_COOKIE, token, { ...cookieOptions, maxAge: CHALLENGE_MINUTES * 60_000 });
}

export function clearChallengeCookie(res: Response) {
  res.clearCookie(VERIFY_COOKIE, cookieOptions);
}

/** Throws 429 if this user may not be sent another code yet. */
function assertCanSend(existing: { lastSentAt: Date; sendCount: number; windowStartedAt: Date }) {
  const wait = existing.lastSentAt.getTime() + RESEND_COOLDOWN_MS - Date.now();
  if (wait > 0)
    throw new HttpError(
      429,
      `Please wait ${Math.ceil(wait / 1000)} seconds before requesting a new code.`,
    );
  const windowOpen = Date.now() - existing.windowStartedAt.getTime() < 3_600_000;
  if (windowOpen && existing.sendCount >= MAX_SENDS_PER_HOUR)
    throw new HttpError(429, 'Too many codes requested. Please try again in an hour.');
}

/**
 * Starts (or restarts) verification for a user from this browser: emails a fresh code and sets the
 * challenge cookie. Any previous challenge for the user stops working.
 */
export async function startVerification(
  res: Response,
  user: { _id: unknown; email: string; name: string },
) {
  const existing = await EmailChallenge.findOne({ userId: user._id });
  if (existing) assertCanSend(existing);
  const windowOpen = existing && Date.now() - existing.windowStartedAt.getTime() < 3_600_000;
  const token = randomBytes(32).toString('hex');
  const code = newCode();
  const now = new Date();
  // Send first: if delivery fails, throw *before* persisting the challenge or starting the cooldown,
  // so no dangling challenge / stale "wait Ns" state is left behind and the user can retry cleanly.
  await sendEmail(verificationEmail(user.email, user.name, code, CODE_MINUTES));
  await EmailChallenge.findOneAndUpdate(
    { userId: user._id },
    {
      userId: user._id,
      email: user.email,
      challengeHash: hashToken(token),
      codeHash: hmac(code),
      codeExpiresAt: minutesFromNow(CODE_MINUTES),
      attempts: 0,
      lastSentAt: now,
      sendCount: windowOpen ? existing.sendCount + 1 : 1,
      windowStartedAt: windowOpen ? existing.windowStartedAt : now,
      expiresAt: minutesFromNow(CHALLENGE_MINUTES),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  setChallengeCookie(res, token);
  return { status: 'verification_required' as const, email: maskEmail(user.email) };
}

async function challengeFrom(req: Request) {
  const token = req.cookies[VERIFY_COOKIE];
  if (typeof token !== 'string' || !token) return null;
  return EmailChallenge.findOne({
    challengeHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  });
}

/** Public status for the verify page: which (masked) address, and when "resend" becomes available. */
export async function verificationStatus(req: Request) {
  const challenge = await challengeFrom(req);
  if (!challenge) throw new HttpError(404, 'No verification in progress. Please sign in again.');
  return {
    email: maskEmail(challenge.email),
    resendAvailableAt: new Date(challenge.lastSentAt.getTime() + RESEND_COOLDOWN_MS).toISOString(),
  };
}

/** Emails a new code for the challenge in this browser's cookie. */
export async function resendCode(req: Request) {
  const challenge = await challengeFrom(req);
  if (!challenge) throw new HttpError(404, 'No verification in progress. Please sign in again.');
  assertCanSend(challenge);
  const user = await User.findById(challenge.userId);
  if (!user) throw new HttpError(404, 'This account no longer exists.');
  const code = newCode();
  // Send before persisting so a failed send doesn't start the cooldown or invalidate the current code.
  await sendEmail(verificationEmail(challenge.email, user.name, code, CODE_MINUTES));
  const windowOpen = Date.now() - challenge.windowStartedAt.getTime() < 3_600_000;
  challenge.codeHash = hmac(code);
  challenge.codeExpiresAt = minutesFromNow(CODE_MINUTES);
  challenge.attempts = 0;
  challenge.lastSentAt = new Date();
  challenge.sendCount = windowOpen ? challenge.sendCount + 1 : 1;
  if (!windowOpen) challenge.windowStartedAt = new Date();
  challenge.expiresAt = minutesFromNow(CHALLENGE_MINUTES);
  await challenge.save();
  return verificationStatus(req);
}

/** Checks a code. Returns the verified user id; the caller marks the user verified and signs in. */
export async function checkCode(req: Request, code: string) {
  const challenge = await challengeFrom(req);
  if (!challenge) throw new HttpError(404, 'This verification has expired. Please sign in again.');
  if (challenge.attempts >= MAX_ATTEMPTS)
    throw new HttpError(429, 'Too many incorrect codes. Request a new code.');
  if (challenge.codeExpiresAt.getTime() < Date.now())
    throw new HttpError(400, 'This code has expired. Request a new code.');
  const expected = Buffer.from(challenge.codeHash, 'hex');
  const given = Buffer.from(hmac(code), 'hex');
  if (!timingSafeEqual(expected, given)) {
    challenge.attempts += 1;
    await challenge.save();
    const left = MAX_ATTEMPTS - challenge.attempts;
    throw new HttpError(
      400,
      left > 0
        ? `That code is incorrect. ${left} attempt${left === 1 ? '' : 's'} left.`
        : 'Too many incorrect codes. Request a new code.',
    );
  }
  await EmailChallenge.deleteOne({ _id: challenge._id });
  return String(challenge.userId);
}
