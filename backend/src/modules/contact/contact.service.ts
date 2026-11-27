import { readFile } from 'node:fs/promises';
import { JWT } from 'google-auth-library';
import { z } from 'zod';
import { env } from '../../config/env';
import { HttpError } from '../../utils/http-error';
import type { ContactMessage } from './contact.schema';

const serviceAccountSchema = z.object({
  type: z.literal('service_account'),
  client_email: z.email(),
  private_key: z.string().startsWith('-----BEGIN PRIVATE KEY-----'),
});

let client: JWT | undefined;

export async function appendContactMessage(message: ContactMessage): Promise<void> {
  if (env.GOOGLE_SHEETS_WEB_APP_URL) return appendContactUsingWebApp(message);
  return appendContactUsingServiceAccount(message);
}

async function appendContactUsingWebApp(message: ContactMessage): Promise<void> {
  try {
    const response = await fetch(env.GOOGLE_SHEETS_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...(env.GOOGLE_SHEETS_WEB_APP_SECRET ? { secret: env.GOOGLE_SHEETS_WEB_APP_SECRET } : {}),
        name: message.name,
        email: message.email,
        topic: message.topic,
        help: message.topic,
        message: message.message,
      }),
      redirect: 'follow',
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error('Apps Script request failed');
    const result: unknown = await response.json();
    const saved = z
      .object({
        ok: z.literal(true),
        spreadsheetId: z.literal(env.GOOGLE_SHEETS_SPREADSHEET_ID).optional(),
        row: z.number().int().min(2).optional(),
      })
      .safeParse(result);
    if (!saved.success) throw new Error('Apps Script did not confirm the destination and row');
  } catch {
    throw new HttpError(
      502,
      'We could not confirm delivery. Please try again later or use the contact links on this page.',
    );
  }
}

async function appendContactUsingServiceAccount(message: ContactMessage): Promise<void> {
  if (!env.GOOGLE_SHEETS_SPREADSHEET_ID || !env.GOOGLE_APPLICATION_CREDENTIALS)
    throw new HttpError(
      503,
      'Message delivery is temporarily unavailable. Please contact us using the links on this page.',
    );

  try {
    if (!client) {
      const account = serviceAccountSchema.parse(
        JSON.parse(await readFile(env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8')),
      );
      client = new JWT({
        email: account.client_email,
        key: account.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
    }
    const range = env.GOOGLE_SHEETS_TAB
      ? `'${env.GOOGLE_SHEETS_TAB.replace(/'/g, "''")}'!A:E`
      : 'A:E';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEETS_SPREADSHEET_ID}/values/${encodeURIComponent(range)}:append`;
    const response = await client.request<{ updates?: { updatedRows?: number } }>({
      url,
      method: 'POST',
      params: { valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS' },
      data: {
        majorDimension: 'ROWS',
        values: [
          [new Date().toISOString(), message.name, message.email, message.topic, message.message],
        ],
      },
      timeout: 15000,
      // An append must not be replayed automatically after an uncertain response.
      retry: false,
    });
    if (response.data.updates?.updatedRows !== 1) throw new Error('Sheet did not confirm the row');
  } catch {
    // Google errors can contain credentials and the sender's message; never log them verbatim.
    throw new HttpError(
      502,
      'We could not confirm delivery. Please try again later or use the contact links on this page.',
    );
  }
}
