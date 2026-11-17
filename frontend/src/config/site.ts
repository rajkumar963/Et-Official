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
  youtube: { label: 'Engineer Trader on YouTube', href: 'https://www.youtube.com/@EngineerTraderofficial' },
  email: { label: 'ettrader@gmail.com', href: 'mailto:techforexvip@gmail.com' },
  location: { label: 'India', href: 'https://maps.google.com/?q=Dubai%2C+U.A.E' },
} as const;
