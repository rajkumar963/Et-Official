import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { contactChannels, site } from '@/config/site';
import './globals.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} - ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [...site.keywords],
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  icons: {
    icon: '/brand-logo-violet-cyan.png',
    apple: '/brand-logo-violet-cyan.png',
  },
  // NOTE: no `alternates.canonical` here on purpose. Next.js inherits layout metadata into
  // every child page, so a canonical set here would make each page declare the homepage as its
  // canonical URL and tell Google not to index it. Each page sets its own canonical instead.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: site.url,
    locale: 'en_US',
    images: ['/brand-logo-violet-cyan.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} - ${site.tagline}`,
    description: site.description,
    site: site.twitter,
    creator: site.twitter,
  },
  category: 'finance',
};
export const viewport: Viewport = { themeColor: '#06060b' };

/**
 * Structured data so search engines can identify the brand, its logo and its official
 * profiles, instead of guessing from page text. Rendered once, site-wide.
 */
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${site.url}/#organization`,
      name: site.name,
      url: site.url,
      logo: `${site.url}/brand-logo-violet-cyan.png`,
      description: site.description,
      sameAs: [
        contactChannels.youtube.href,
        contactChannels.instagram.href,
        contactChannels.telegramCommunity.href,
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${site.url}/#website`,
      url: site.url,
      name: site.name,
      description: site.description,
      inLanguage: 'en',
      publisher: { '@id': `${site.url}/#organization` },
    },
  ],
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${display.variable} ${mono.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
