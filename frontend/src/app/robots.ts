import type { MetadataRoute } from 'next';
import { site } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      /**
       * Only the sign-in-walled app areas are blocked — crawlers can't read them anyway.
       * /login, /signup, /verify-email and /checkout are deliberately left crawlable so Google
       * can READ their `noindex` tag; blocking them instead lets the bare URL sit in the index
       * as "No information is available for this page".
       */
      disallow: ['/dashboard', '/admin', '/api/'],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
