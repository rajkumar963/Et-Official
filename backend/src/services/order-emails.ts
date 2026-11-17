import { networkInfo, type PaymentNetwork } from '@et-trader/shared';
import { env } from '../config/env';
import type { OutgoingEmail } from './mailer';

interface OrderForEmail {
  orderNumber: string;
  productTitle: string;
  amount: number;
  network: string;
  walletAddress: string;
  buyerName: string;
  accessEmail: string;
  whatsapp: string;
  telegram: string;
  txHash?: string | null;
  submittedAt?: Date | null;
}

const esc = (value: string) => value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function layout(title: string, bodyHtml: string) {
  return `<!doctype html><html><body style="margin:0;background:#06060b;font-family:Inter,Segoe UI,Arial,sans-serif;color:#f4f3f8">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#11111b;border:1px solid #2a2840;border-radius:16px;padding:32px">
<tr><td style="font-size:18px;font-weight:700;color:#c4b5fd">ET Trader</td></tr>
<tr><td style="padding-top:18px;font-size:20px;font-weight:700;color:#ffffff">${esc(title)}</td></tr>
<tr><td style="padding-top:14px;font-size:14px;line-height:1.65;color:#d6d3e4">${bodyHtml}</td></tr>
</table></td></tr></table></body></html>`;
}

const button = (href: string, label: string) =>
  `<p style="padding-top:8px"><a href="${esc(href)}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:10px">${esc(label)}</a></p>`;

function detailsTable(rows: [string, string][]) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:12px 0;border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:7px 10px 7px 0;color:#9a98ad;font-size:13px;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:7px 0;font-size:13px;color:#ffffff;word-break:break-all">${v}</td></tr>`,
    )
    .join('')}</table>`;
}

const textRows = (rows: [string, string][]) => rows.map(([k, v]) => `${k}: ${v}`).join('\n');

/** To the admin: a payment was submitted and needs review. */
export function adminNewPaymentEmail(
  order: OrderForEmail,
  account: { name: string; email: string },
  reviewToken: string,
): OutgoingEmail {
  const reviewUrl = `${env.FRONTEND_URL}/admin/review/${reviewToken}`;
  const explorer = order.txHash
    ? networkInfo[order.network as PaymentNetwork].explorerTx(order.txHash)
    : '';
  const rows: [string, string][] = [
    ['Order', order.orderNumber],
    ['Product', order.productTitle],
    ['Amount', `${order.amount} USDT (${order.network})`],
    ['Transaction ID', order.txHash ?? '—'],
    ['Paid to', order.walletAddress],
    ['Buyer name', order.buyerName],
    ['Account email', account.email],
    ['Gmail for access', order.accessEmail],
    ['WhatsApp', order.whatsapp || '—'],
    ['Telegram', order.telegram || '—'],
  ];
  const htmlRows: [string, string][] = rows.map(([k, v]) => [
    k,
    k === 'Transaction ID' && explorer
      ? `<a href="${esc(explorer)}" style="color:#c4b5fd">${esc(v)}</a>`
      : esc(v),
  ]);
  return {
    to: env.ADMIN_NOTIFY_EMAIL,
    subject: `New payment to review: ${order.productTitle} · ${order.amount} USDT · ${order.orderNumber}`,
    text: `A payment was submitted and needs your review.\n\n${textRows(rows)}\n\nCheck the transaction: ${explorer}\n\nApprove or reject: ${reviewUrl}\n(The link works once and expires in 14 days. You can also review it in the admin section.)`,
    html: layout(
      'New payment to review',
      `A buyer submitted a payment. Check the transaction on the blockchain, then approve or reject it.${detailsTable(htmlRows)}${explorer ? `<p><a href="${esc(explorer)}" style="color:#c4b5fd">View transaction on ${esc(networkInfo[order.network as PaymentNetwork].chain)} explorer →</a></p>` : ''}${button(reviewUrl, 'Review payment')}<p style="font-size:12px;color:#9a98ad">The review link works once and expires in 14 days. You can also approve it from the admin section.</p>`,
    ),
  };
}

/** To the buyer: we received your transaction ID. */
export function buyerPaymentReceivedEmail(order: OrderForEmail, to: string): OutgoingEmail {
  const rows: [string, string][] = [
    ['Order', order.orderNumber],
    ['Product', order.productTitle],
    ['Amount', `${order.amount} USDT (${order.network})`],
    ['Transaction ID', order.txHash ?? '—'],
    ['Access will be shared with', order.accessEmail],
  ];
  return {
    to,
    subject: `Payment received – ${order.productTitle} (${order.orderNumber})`,
    text: `Hi ${order.buyerName},\n\nThanks! We received your payment details and our team is verifying the transaction.\n\n${textRows(rows)}\n\nYou'll get another email as soon as it's approved. You can follow the status in your ET Trader dashboard under "My courses": ${env.FRONTEND_URL}/dashboard/courses\n\nPlease don't pay again for this order.`,
    html: layout(
      'Payment received – under review',
      `Hi ${esc(order.buyerName)},<br>Thanks! We received your payment details and our team is verifying the transaction.${detailsTable(rows.map(([k, v]) => [k, esc(v)]))}You'll get another email as soon as it's approved. Please don't pay again for this order.${button(`${env.FRONTEND_URL}/dashboard/courses`, 'Track your order')}`,
    ),
  };
}

/** To the buyer: approved, here is your access. */
export function buyerApprovedEmail(
  order: OrderForEmail,
  to: string,
  access: { url: string; note: string },
): OutgoingEmail {
  const accessText = access.url
    ? `Open your ${order.productTitle}: ${access.url}`
    : `We are sharing the material with ${order.accessEmail} on Google Drive now.`;
  return {
    to,
    subject: `You're in! Access to ${order.productTitle}`,
    text: `Hi ${order.buyerName},\n\nYour payment for order ${order.orderNumber} is confirmed.\n\n${accessText}\n${access.note ? `\n${access.note}\n` : ''}\nIf the link asks for permission, make sure you're signed in to Google with ${order.accessEmail}.\n\nYou can always find your access in your dashboard: ${env.FRONTEND_URL}/dashboard/courses`,
    html: layout(
      `You're in – ${order.productTitle}`,
      `Hi ${esc(order.buyerName)},<br>Your payment for order <strong>${esc(order.orderNumber)}</strong> is confirmed. Thank you!${access.url ? button(access.url, `Open ${order.productTitle}`) : `<p>We are sharing the material with <strong>${esc(order.accessEmail)}</strong> on Google Drive now.</p>`}${access.note ? `<p>${esc(access.note)}</p>` : ''}<p style="font-size:13px;color:#9a98ad">If the link asks for permission, sign in to Google with ${esc(order.accessEmail)}. You can always find your access in <a href="${esc(`${env.FRONTEND_URL}/dashboard/courses`)}" style="color:#c4b5fd">My courses</a>. Access is personal; please don't share it.</p>`,
    ),
  };
}

/** To the buyer: we couldn't confirm the payment. */
export function buyerRejectedEmail(
  order: OrderForEmail,
  to: string,
  reason: string,
): OutgoingEmail {
  return {
    to,
    subject: `We couldn't confirm your payment (${order.orderNumber})`,
    text: `Hi ${order.buyerName},\n\nWe couldn't confirm the payment for order ${order.orderNumber} (${order.productTitle}).\n\nReason: ${reason}\n\nIf you believe this is a mistake, reply with your order ID and transaction ID, or submit the correct transaction ID in your dashboard: ${env.FRONTEND_URL}/dashboard/courses`,
    html: layout(
      "We couldn't confirm your payment",
      `Hi ${esc(order.buyerName)},<br>We couldn't confirm the payment for order <strong>${esc(order.orderNumber)}</strong> (${esc(order.productTitle)}).<p style="background:#1d1424;border:1px solid #ff5c6c55;border-radius:10px;padding:12px;color:#ffadb5">${esc(reason)}</p>If you believe this is a mistake, contact us with your order ID and transaction ID, or submit the correct transaction ID in your dashboard.${button(`${env.FRONTEND_URL}/dashboard/courses`, 'Open My courses')}`,
    ),
  };
}
