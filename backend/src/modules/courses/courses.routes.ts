import { Router, type Request, type Response } from 'express';
import {
  getProduct,
  lessonEmbedUrl,
  type CourseContentDto,
  type LessonDto,
  type LessonProvider,
} from '@et-trader/shared';
import type { AuthRequest } from '../../middleware/require-auth';
import { Lesson } from '../../models/Lesson';
import { Order } from '../../models/Order';
import { HttpError } from '../../utils/http-error';

export const coursesRouter = Router();

/** True when the user has an approved, non-revoked order for this course. */
async function ownsCourse(userId: string, productId: string) {
  return Boolean(
    await Order.exists({ userId, productId, status: 'approved', accessRevoked: { $ne: true } }),
  );
}

/** Study material for a purchased course. Blocked users never reach here (requireAuth stops them). */
coursesRouter.get('/:productId/content', async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).userId;
  const product = getProduct(String(req.params.productId));
  if (!product || product.type !== 'course') throw new HttpError(404, 'Course not found.');
  if (!(await ownsCourse(userId, product.id)))
    throw new HttpError(403, 'Buy this course to open its lessons.');
  const lessons = await Lesson.find({ productId: product.id }).sort({ order: 1, createdAt: 1 });
  const data: CourseContentDto = {
    productId: product.id,
    title: product.title,
    lessons: lessons.map((lesson, index): LessonDto => {
      const provider = lesson.get('provider') as LessonProvider;
      return {
        id: String(lesson._id),
        title: lesson.get('title'),
        order: index,
        provider,
        embedUrl: lessonEmbedUrl(provider, lesson.get('sourceId')),
      };
    }),
  };
  res.json({ data });
});
