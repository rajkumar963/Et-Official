import type { Course } from './data/courses';

/** Course details page. */
export const courseDetailsHref = (course: Pick<Course, 'id'>) => `/courses/${course.id}`;

/** Checkout for any product (course or e-book). Signed-out visitors are sent to log in first. */
export const checkoutHref = (product: { id: string }) =>
  `/checkout/${encodeURIComponent(product.id)}`;

/** "Enroll now" on courses. */
export const enrollHref = checkoutHref;

/** Upcoming e-books are previewed in the catalogue until orders open. */
export const ebookEnquiryHref = (ebook: { id: string }) =>
  `/ebooks#${encodeURIComponent(ebook.id)}`;
