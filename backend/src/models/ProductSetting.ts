import { Schema, model } from 'mongoose';

/** Per-product delivery settings managed in the admin section (e.g. the course's Google Drive link). */
const schema = new Schema(
  {
    productId: { type: String, required: true, unique: true },
    /** Link given to buyers after approval (Google Drive folder, PDF link, ...). */
    accessUrl: { type: String, default: '' },
    /** Optional instructions shown with the link. */
    accessNote: { type: String, default: '' },
  },
  { timestamps: true },
);

export const ProductSetting = model('ProductSetting', schema);
