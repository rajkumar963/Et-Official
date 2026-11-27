import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteNavbar } from '@/features/marketing/components/site-navbar';
import { SiteFooter } from '@/features/marketing/components/site-footer';
import { CourseDetails } from '@/features/marketing/components/course-details';
import { courses, getCourse } from '@/features/marketing/data/courses';
import { site } from '@/config/site';
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
    alternates: { canonical: `/courses/${course.id}` },
  };
}

export default async function CoursePage({ params }: Props) {
  const course = getCourse((await params).slug);
  if (!course) notFound();
  /** Course structured data, so search engines can show provider, level and price. */
  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    url: `${site.url}/courses/${course.id}`,
    inLanguage: ['en', 'hi'],
    educationalLevel: course.level,
    teaches: course.outcomes,
    provider: {
      '@type': 'Organization',
      name: site.name,
      url: site.url,
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      startDate: course.startDate,
      courseWorkload: 'PT10H',
      inLanguage: ['en', 'hi'],
    },
    // Priced in USDT, a 1:1 USD stablecoin, so USD is the closest ISO-4217 representation.
    offers: {
      '@type': 'Offer',
      price: course.price,
      priceCurrency: 'USD',
      category: 'Paid',
      availability: 'https://schema.org/InStock',
      url: `${site.url}/courses/${course.id}`,
    },
  };
  return (
    <div className={home}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
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
