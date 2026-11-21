import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { Lesson } from '../models/Lesson';

/**
 * Inserts a few sample lessons so the in-app study section shows populated and actually plays.
 * These use public Blender open-movie clips on YouTube purely as placeholders — swap each one for
 * your real Google Drive or YouTube link in Admin → Course lessons.
 * Run with: npm run seed:lessons
 */
type Sample = { title: string; provider: 'drive' | 'youtube'; sourceId: string };

const byCourse: Record<string, Sample[]> = {
  'basic-to-advanced-course': [
    { title: 'Lesson 1 · Introduction & how to use this course', provider: 'youtube', sourceId: 'aqz-KE-bpKQ' },
    { title: 'Lesson 2 · Candle types and candlestick patterns', provider: 'youtube', sourceId: 'eRsGyueVLvQ' },
    { title: 'Lesson 3 · Support, resistance and trend lines', provider: 'youtube', sourceId: 'R6MlUcmOul8' },
    { title: 'Lesson 4 · Money management and psychology', provider: 'youtube', sourceId: 'TLkA0RELQ1g' },
  ],
  'advanced-to-pro-course': [
    { title: 'Lesson 1 · News reading in your analysis', provider: 'youtube', sourceId: 'aqz-KE-bpKQ' },
    { title: 'Lesson 2 · Advanced order blocks & Gann Box', provider: 'youtube', sourceId: 'eRsGyueVLvQ' },
    { title: 'Lesson 3 · Advanced RSI and Fibonacci', provider: 'youtube', sourceId: 'R6MlUcmOul8' },
    { title: 'Lesson 4 · FVG concept and ETC timeframes', provider: 'youtube', sourceId: 'TLkA0RELQ1g' },
  ],
};

async function main() {
  await connectDatabase();
  for (const [productId, samples] of Object.entries(byCourse)) {
    const existing = await Lesson.countDocuments({ productId });
    if (existing > 0) {
      console.log(`"${productId}" already has ${existing} lesson(s); skipped.`);
      continue;
    }
    await Lesson.insertMany(samples.map((lesson, order) => ({ ...lesson, productId, order })));
    console.log(`Added ${samples.length} sample lessons to "${productId}".`);
  }
  console.log('\nThese are placeholder clips. Open Admin → Course lessons to replace each link with');
  console.log('your own Google Drive video (shared "Anyone with the link · Viewer") or YouTube link.');
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
