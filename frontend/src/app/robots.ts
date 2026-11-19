import type { MetadataRoute } from 'next';
import { site } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Private areas should not be crawled or indexed.
      disallow: ['/dashboard', '/admin', '/checkout', '/login', '/signup', '/verify-email'],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
