import { Schema, model } from 'mongoose';
import { env } from '../config/env';
const schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, select: false },
    googleId: { type: String, select: false },
    image: String,
    providers: { type: [String], default: ['credentials'] },
    /**
     * false = signed up but email not confirmed yet (cannot sign in until verified).
     * Accounts created before email verification existed have no value and are treated as verified.
     */
    emailVerified: { type: Boolean },
    startingBalance: { type: Number, default: 10000 },
  },
  { timestamps: true },
);
export const User = model('User', schema);
export function userDto(user: any) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    image: user.image,
    providers: user.providers,
    startingBalance: user.startingBalance,
    isAdmin: isAdmin(user),
  };
}

/** Admins are configured by email (ADMIN_EMAILS) and must have a verified address. */
export function isAdmin(user: { email: string; emailVerified?: boolean | null }) {
  return user.emailVerified !== false && env.ADMIN_EMAILS.includes(user.email.toLowerCase());
}
