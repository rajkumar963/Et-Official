import bcrypt from 'bcryptjs';
import { User } from '../../models/User';
import { HttpError } from '../../utils/http-error';

/**
 * Creates an unverified account. If the email belongs to an account that was never verified
 * (nobody proved they own the inbox, and it can't have been used), it is reclaimed: the latest
 * sign-up's name and password replace the old ones and a new code is sent.
 */
export async function signup(data: { name: string; email: string; password: string }) {
  const passwordHash = await bcrypt.hash(data.password, 12);
  const existing = await User.findOne({ email: data.email });
  if (existing) {
    if (existing.emailVerified !== false)
      throw new HttpError(409, 'This email is already registered');
    existing.name = data.name;
    existing.set('passwordHash', passwordHash);
    return existing.save();
  }
  return User.create({ name: data.name, email: data.email, passwordHash, emailVerified: false });
}

export async function login(data: { email: string; password: string }) {
  const user = await User.findOne({ email: data.email }).select('+passwordHash');
  const fallback = '$2b$12$zzzzzzzzzzzzzzzzzzzzzuXqk5j2fWoP8fW7fqNIq5HMcXh1rTwxkG';
  const valid = await bcrypt.compare(data.password, user?.passwordHash || fallback);
  if (!user || !valid) throw new HttpError(401, 'Email or password is incorrect');
  return user;
}
