import { Schema, model } from 'mongoose';

/**
 * A single video lesson in a course. Videos stay on Google Drive or YouTube; we store only the
 * provider and its id, and always embed a view-only player (no download control).
 */
const schema = new Schema(
  {
    /** The course product id this lesson belongs to (see shared product catalogue). */
    productId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    /** 'drive' | 'youtube' — which player to embed. */
    provider: { type: String, required: true, enum: ['drive', 'youtube'], default: 'drive' },
    /** Google Drive file id or YouTube video id. */
    sourceId: { type: String, required: true },
    /** Sequence position within the course (ascending). */
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Lesson = model('Lesson', schema);
