import { Router } from 'express';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import { env } from '../../config/env';
import { User } from '../../models/User';
import { EmailChallenge } from '../../models/EmailChallenge';
import { HttpError } from '../../utils/http-error';
import { cookieOptions, issueSession } from './auth.tokens';
export const googleRouter = Router();
function client() {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET)
    throw new HttpError(503, 'Google sign-in is not configured. Use email sign-in.');
  return new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_CALLBACK_URL);
}
googleRouter.get('/google', (_req, res) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    res.redirect(`${env.FRONTEND_URL}/login?error=google-unavailable`);
    return;
  }
  const oauth = client();
  const state = randomBytes(32).toString('hex');
  res.cookie('tj_oauth_state', state, { ...cookieOptions, maxAge: 600000 });
  res.redirect(
    oauth.generateAuthUrl({ scope: ['openid', 'email', 'profile'], state, access_type: 'online' }),
  );
});
googleRouter.get('/google/callback', async (req, res) => {
  try {
    const { state, code } = z
      .object({ state: z.string().length(64), code: z.string().min(1) })
      .parse(req.query);
    const expected = req.cookies.tj_oauth_state;
    res.clearCookie('tj_oauth_state', cookieOptions);
    if (
      typeof expected !== 'string' ||
      expected.length !== state.length ||
      !timingSafeEqual(Buffer.from(state), Buffer.from(expected))
    )
      throw new HttpError(403, 'Invalid OAuth state');
    const oauth = client();
    const { tokens } = await oauth.getToken(code);
    if (!tokens.id_token) throw new Error('Missing identity token');
    const ticket = await oauth.verifyIdToken({
      idToken: tokens.id_token,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const identity = ticket.getPayload();
    if (!identity?.email || !identity.email_verified)
      throw new HttpError(403, 'A verified Google email is required');
    let user = await User.findOne({ email: identity.email.toLowerCase() }).select('+googleId');
    if (user && user.googleId && user.googleId !== identity.sub)
      throw new HttpError(409, 'This email is linked to a different Google account.');
    if (user && !user.googleId) {
      if (user.emailVerified === true) {
        // Both we and Google have verified this inbox: same owner, so link Google to the account.
        user.googleId = identity.sub;
        user.providers = [...new Set([...user.providers, 'google'])];
        await user.save();
      } else if (user.emailVerified === false) {
        // Never-verified sign-up: Google proves inbox ownership, so the verified owner claims it and
        // the unproven password is discarded.
        user.googleId = identity.sub;
        user.emailVerified = true;
        user.providers = ['google'];
        user.set('passwordHash', undefined);
        await user.save();
        await EmailChallenge.deleteMany({ userId: user._id });
      } else {
        // Account created before email verification existed: don't link automatically.
        throw new HttpError(409, 'An email account already exists. Sign in with your password.');
      }
    }
    if (!user)
      user = await User.create({
        email: identity.email,
        name: identity.name || identity.email,
        image: identity.picture,
        googleId: identity.sub,
        providers: ['google'],
        emailVerified: true,
      });
    await issueSession(res, String(user._id));
    res.redirect(`${env.FRONTEND_URL}/`);
  } catch {
    res.redirect(`${env.FRONTEND_URL}/login?error=google`);
  }
});
