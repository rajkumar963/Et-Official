/** Central brand + site configuration. Keep user-facing name and domain in one place. */
export const site = {
  name: 'ET Official',
  /** Production domain. Used for canonical URLs, Open Graph, sitemap and robots.
   *  Must be the SAME origin the site is actually served from. The apex (etofficial.com)
   *  permanently redirects to www, so www is the canonical host — keep this in sync or
   *  Google sees conflicting canonical/redirect signals and won't index pages cleanly. */
  url: 'https://www.etofficial.com',
  tagline: 'Journal your trades. See your edge.',
  description:
    'ET Official is a focused trading journal to track your performance, understand your behavior, and build a better process — plus trading courses and e-books to sharpen your edge.',
  /** Used for Twitter/X cards. Update if you create a handle. */
  twitter: '@etofficial',
  keywords: [
    'trading journal',
    'trade tracker',
    'forex journal',
    'binary trading',
    'trading analytics',
    'trading courses',
    'trading e-books',
    'ET Official',
  ],
} as const;

/**
 * Public business/contact details shown on marketing pages.
 * Keep these in one place so links and displayed labels can't drift apart.
 *
 * TODO(owner): the values below were carried over unchanged and look inconsistent —
 *  - whatsapp: displayed "+91 1234567890" but the link is wa.me/1234567890 (placeholder, no country code)
 *  - email: displayed "ettrader@gmail.com" but the link mails techforexvip@gmail.com
 *  - location: displayed "India" but the map link points to Dubai, U.A.E.
 */
export const contactChannels = {
  whatsapp: { label: '+91 1234567890', href: 'https://wa.me/1234567890' },
  telegramCommunity: { label: 'Telegram Community', href: 'https://t.me/tradewithet' },
  telegramPersonal: { label: '@EngineerTrader84', href: 'https://t.me/EngineerTrader84' },
  youtube: {
    label: 'Engineer Trader on YouTube',
    href: 'https://www.youtube.com/@EngineerTraderofficial',
  },
  instagram: { label: '@officialetzone', href: 'https://www.instagram.com/officialetzone' },
  email: { label: 'ettrader@gmail.com', href: 'mailto:techforexvip@gmail.com' },
  location: { label: 'India', href: 'https://maps.google.com/?q=Dubai%2C+U.A.E' },
} as const;
