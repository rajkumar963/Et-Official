import type { MetadataRoute } from 'next';
import { site } from '@/config/site';
import { courses } from '@/features/marketing/data/courses';

/** Public, indexable pages. Dashboard/admin/checkout are private and intentionally excluded. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPaths = [
    { path: '', priority: 1 },
    { path: '/courses', priority: 0.9 },
    { path: '/ebooks', priority: 0.9 },
    { path: '/brokers/binary', priority: 0.7 },
    { path: '/brokers/forex', priority: 0.7 },
    { path: '/contact', priority: 0.6 },
  ];

  return [
    ...staticPaths.map((entry) => ({
      url: `${site.url}${entry.path}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: entry.priority,
    })),
    ...courses.map((course) => ({
      url: `${site.url}/courses/${course.id}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
