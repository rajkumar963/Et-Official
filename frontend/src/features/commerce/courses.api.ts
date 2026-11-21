import type { CourseContentDto } from '@et-trader/shared';
import { api } from '@/lib/api-client';

/** Study material for a course the signed-in user has purchased (403 otherwise). */
export const coursesApi = {
  content: (productId: string) =>
    api<CourseContentDto>(`/courses/${encodeURIComponent(productId)}/content`),
};
