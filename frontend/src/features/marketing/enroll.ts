import type { Course } from './data/courses';

/** Course details page. */
export const courseDetailsHref = (course: Pick<Course, 'id'>) => `/courses/${course.id}`;

/** Checkout for any product (course or e-book). Signed-out visitors are sent to log in first. */
export const checkoutHref = (product: { id: string }) =>
  `/checkout/${encodeURIComponent(product.id)}`;

/** "Enroll now" on courses. */
export const enrollHref = checkoutHref;

/** "Get e-book" on e-books. */
export const ebookEnquiryHref = checkoutHref;
