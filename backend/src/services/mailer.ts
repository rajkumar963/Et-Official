import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { env } from '../config/env';
import { HttpError } from '../utils/http-error';

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Development/test only: emails that were "sent" without a Resend key. Tests read codes from here;
 * the latest message is also written to .runtime/outbox/latest.json (and <recipient>.json) for
 * manual or E2E testing.
 */
export const devOutbox: OutgoingEmail[] = [];

async function sendWithResend(email: OutgoingEmail) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: env.MAIL_FROM, ...email, to: [email.to] }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    // Log Resend's reason server-side (e.g. unverified domain); never expose it to the browser.
    console.error('Resend rejected the email:', response.status, await response.text());
    throw new HttpError(502, 'We could not send the verification email. Please try again shortly.');
  }
}

function sendToDevOutbox(email: OutgoingEmail) {
  devOutbox.push(email);
  if (devOutbox.length > 50) devOutbox.shift();
  if (env.NODE_ENV === 'test') return;
  console.log(`\n[mail:dev] To: ${email.to}\n[mail:dev] ${email.subject}\n${email.text}\n`);
  try {
    const dir = join(process.cwd(), '..', '.runtime', 'outbox');
    mkdirSync(dir, { recursive: true });
    const record = JSON.stringify({ ...email, sentAt: new Date() }, null, 2);
    writeFileSync(join(dir, 'latest.json'), record);
    // One file per recipient so parallel E2E tests each read their own code.
    writeFileSync(
      join(dir, `${email.to.toLowerCase().replace(/[^a-z0-9@._-]/g, '_')}.json`),
      record,
    );
  } catch {
    /* The console copy is enough. */
  }
}

export async function sendEmail(email: OutgoingEmail) {
  if (env.RESEND_API_KEY) return sendWithResend(email);
  return sendToDevOutbox(email); // env.ts guarantees a key in production
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function verificationEmail(to: string, name: string, code: string, minutes: number) {
  const safeName = escapeHtml(name);
  return {
    to,
    subject: `${code} is your ET Trader verification code`,
    text: `Hi ${name},\n\nYour ET Trader verification code is ${code}.\nIt expires in ${minutes} minutes.\n\nIf you didn't create an ET Trader account, you can ignore this email.`,
    html: `<!doctype html><html><body style="margin:0;background:#06060b;font-family:Inter,Segoe UI,Arial,sans-serif;color:#f4f3f8">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#11111b;border:1px solid #2a2840;border-radius:16px;padding:32px">
<tr><td style="font-size:18px;font-weight:700;color:#c4b5fd">ET Trader</td></tr>
<tr><td style="padding-top:20px;font-size:15px;line-height:1.6">Hi ${safeName},<br>Use this code to verify your email address:</td></tr>
<tr><td style="padding:24px 0"><div style="font-family:'JetBrains Mono',Consolas,monospace;font-size:34px;font-weight:700;letter-spacing:10px;text-align:center;background:#1a1730;border:1px solid #8b5cf655;border-radius:12px;padding:16px;color:#ffffff">${code}</div></td></tr>
<tr><td style="font-size:13px;line-height:1.6;color:#9a98ad">The code expires in ${minutes} minutes. If you didn't create an ET Trader account, you can ignore this email.</td></tr>
</table></td></tr></table></body></html>`,
  };
}
