import { Schema, model } from 'mongoose';
import { orderStatuses, paymentNetworks } from '@et-trader/shared';

const schema = new Schema(
  {
    /** Human-friendly reference shown to buyers and in emails, e.g. ET-7F3K9QX2. */
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    productId: { type: String, required: true },
    productType: { type: String, enum: ['course', 'ebook'], required: true },
    productTitle: { type: String, required: true },
    /** Price charged in USDT, copied from the catalog when the order was created. */
    amount: { type: Number, required: true },
    originalAmount: { type: Number, default: null },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String, default: null },
    currency: { type: String, default: 'USDT' },
    network: { type: String, enum: paymentNetworks, required: true },
    walletAddress: { type: String, required: true },
    buyerName: { type: String, required: true },
    /** Gmail the course is shared with (may differ from the account email). */
    accessEmail: { type: String, required: true, lowercase: true },
    whatsapp: { type: String, default: '' },
    telegram: { type: String, default: '' },
    txHash: { type: String, default: null },
    status: { type: String, enum: orderStatuses, default: 'awaiting_payment', index: true },
    accessRevoked: { type: Boolean, default: false },
    rejectReason: { type: String, default: null },
    submittedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    /** "email link" or the admin account's email. */
    reviewedBy: { type: String, default: null },
    /** SHA-256 of the one-time review token emailed to the admin. */
    reviewTokenHash: { type: String, default: null, select: false },
    reviewTokenExpiresAt: { type: Date, default: null, select: false },
  },
  { timestamps: true },
);
// The same blockchain transaction can only pay for one order.
schema.index(
  { network: 1, txHash: 1 },
  { unique: true, partialFilterExpression: { txHash: { $type: 'string' } } },
);
schema.index({ reviewTokenHash: 1 }, { sparse: true });

export const Order = model('Order', schema);
