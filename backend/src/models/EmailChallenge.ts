import { Schema, model } from 'mongoose';

/**
 * A pending email-verification attempt. The browser that started it holds a random token in an
 * HttpOnly cookie (only its hash is stored), so a code is only usable from that browser.
 * One active challenge per user: starting a new one replaces the old one.
 */
const schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    email: { type: String, required: true },
    challengeHash: { type: String, required: true, unique: true },
    codeHash: { type: String, required: true },
    /** When the current code stops working. */
    codeExpiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, required: true },
    /** Rolling send limit: number of codes sent since windowStartedAt. */
    sendCount: { type: Number, default: 1 },
    windowStartedAt: { type: Date, required: true },
    /** Whole challenge expiry; MongoDB's TTL index deletes it afterwards. */
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const EmailChallenge = model('EmailChallenge', schema);
