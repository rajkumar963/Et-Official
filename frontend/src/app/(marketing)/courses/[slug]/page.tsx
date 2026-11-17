import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteNavbar } from '@/features/marketing/components/site-navbar';
import { SiteFooter } from '@/features/marketing/components/site-footer';
import { CourseDetails } from '@/features/marketing/components/course-details';
import { courses, getCourse } from '@/features/marketing/data/courses';
import { home } from '@/features/marketing/marketing-styles';

type Props = { params: Promise<{ slug: string }> };

/** Every course page is pre-rendered at build time; unknown slugs return 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = getCourse((await params).slug);
  if (!course) return {};
  return {
    title: course.title,
    description: `${course.tagline} ${course.price} USDT · recorded video course with lifetime access.`,
  };
}

export default async function CoursePage({ params }: Props) {
  const course = getCourse((await params).slug);
  if (!course) notFound();
  return (
    <div className={home}>
      <SiteNavbar />
      <main className="min-h-screen px-6 pt-[132px] pb-[100px] max-[560px]:px-[18px] max-[560px]:pt-[116px] max-[560px]:pb-[70px]">
        <div className="mx-auto max-w-[1192px]">
          <CourseDetails course={course} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
