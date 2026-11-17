import type { Metadata } from 'next';
import { MyCourses } from '@/features/commerce/components/my-courses';

export const metadata: Metadata = { title: 'My courses' };

export default function Page() {
  return <MyCourses />;
}
