/**
 * Affiliate broker data for the "Account and Update" pages.
 *
 * ▶ TO GO LIVE: replace every `affiliateUrl` below with YOUR real affiliate /
 *   referral link. They are placeholders right now. You can also edit the broker
 *   names, highlights, min deposit, and the `updates` list — nothing else needs
 *   to change for the pages to render.
 */

export type Broker = {
  name: string;
  /** One-line positioning shown under the name. */
  tagline: string;
  /** 2–3 sentence description. */
  description: string;
  /** Short selling points shown as a checklist. */
  highlights: string[];
  minDeposit: string;
  /** Optional ribbon, e.g. "Most popular" or "Beginner friendly". */
  badge?: string;
  /** ▶ YOUR affiliate / referral link. Replace the placeholder. */
  affiliateUrl: string;
};

export type Update = {
  /** ISO date, e.g. "2026-11-17". */
  date: string;
  title: string;
  text: string;
  /** Visual tone of the tag. */
  tone: 'info' | 'new' | 'alert';
  tag: string;
};

export type BrokerKind = 'binary' | 'forex';

/** Your Telegram channel — shown as a "join for updates" CTA on both pages. */
export const telegram = {
  url: 'https://t.me/ETGOLDKING',
  handle: 'ET GOLD KING',
};

export type BrokerPageData = {
  kind: BrokerKind;
  eyebrow: string;
  title: string;
  titleAccent: string;
  intro: string;
  brokers: Broker[];
  steps: { title: string; text: string }[];
  faqs: { question: string; answer: string }[];
};

const openAccountSteps = [
  {
    title: 'Open your account',
    text: 'Tap "Create account" on a broker below — it opens their official sign-up through our partner link. Register with your email or Google.',
  },
  {
    title: 'Verify & fund',
    text: 'Complete the broker’s verification (KYC) and add funds using any supported method. Start small while you learn the platform.',
  },
  {
    title: 'Journal every trade',
    text: 'Come back to your ET Trader dashboard and log each trade. Your analytics build the discipline that actually moves results.',
  },
];

// ──────────────────────────────────────────────────────────────────────────
// BINARY TRADING
// ──────────────────────────────────────────────────────────────────────────
export const binaryPage: BrokerPageData = {
  kind: 'binary',
  eyebrow: 'BINARY TRADING',
  title: 'Open a binary trading account',
  titleAccent: 'with a broker we trust.',
  intro:
    'Fixed-payout trading on short time frames. Create your account through our partner link below, then track every trade in your ET Trader journal to see what’s really working.',
  brokers: [
    {
      name: 'Quotex',
      tagline: 'Fast, beginner-friendly binary platform',
      description:
        'A clean web platform with a low entry barrier and a free demo. Popular with newer traders for its simple interface and quick deposits/withdrawals.',
      highlights: ['Free unlimited demo', 'Low minimum deposit', 'Web + mobile', 'Fast withdrawals'],
      minDeposit: '$10',
      badge: 'Most popular',
      affiliateUrl: 'https://broker-qx.pro/sign-up/?lid=2427717',
    },
    {
      name: 'Binolla',
      tagline: 'Fixed-time digital options + MT5',
      description:
        'Short-term digital (fixed-time) options across many assets with high payouts, plus forex, metals and energy on MetaTrader 5. Offshore-registered — start small and verify the details yourself before funding.',
      highlights: ['High payout digital options', 'MT5 for forex & metals', 'Many assets', 'Demo account'],
      minDeposit: '$10',
      badge: 'New',
      affiliateUrl: 'https://binolla.com/signup?lid=30080',
    },
  ],
  steps: openAccountSteps,
  faqs: [
    {
      question: 'Is binary trading risky?',
      answer:
        'Yes. Binary options are high-risk and you can lose your whole stake on a single trade. Only trade money you can afford to lose, and use a demo account first to learn the platform.',
    },
    {
      question: 'Why create my account through your link?',
      answer:
        'It’s the same official broker sign-up — the partner link just lets the broker know we referred you, at no extra cost to you. It helps support the free tools and content we build.',
    },
    {
      question: 'Do I need to deposit a lot to start?',
      answer:
        'No. Most binary brokers let you start with a small minimum deposit, and you can practice on a free demo account before risking real money.',
    },
  ],
};

// ──────────────────────────────────────────────────────────────────────────
// FOREX TRADING
// ──────────────────────────────────────────────────────────────────────────
export const forexPage: BrokerPageData = {
  kind: 'forex',
  eyebrow: 'FOREX TRADING',
  title: 'Open a forex trading account',
  titleAccent: 'with our partner brokers.',
  intro:
    'Trade currency pairs, metals and more. Create your account through our partner link below, then log every position in your ET Trader journal to sharpen your edge over time.',
  brokers: [
    {
      // ▶ TODO: confirm the broker name for the affs.click link (tell Claude / edit here).
      name: 'Partner Forex Broker',
      tagline: 'Our recommended forex partner',
      description:
        'Our featured forex partner — open your account through the link, then track every position in your ET Trader journal. Always verify the broker’s terms and your local regulations before funding.',
      highlights: ['Forex & CFDs', 'Partner sign-up link', 'Demo to practice', 'Trade from mobile'],
      minDeposit: '—',
      badge: 'Recommended',
      affiliateUrl: 'https://affs.click/iX8vA',
    },
    {
      name: 'Elefin',
      tagline: 'MT5 forex & CFD trading',
      description:
        'Forex and CFD trading on MetaTrader 5 with Standard and PRO account options. Offshore-registered, so trade responsibly and verify the details before funding.',
      highlights: ['MetaTrader 5', 'Forex & CFDs', 'Standard & PRO accounts', 'Demo available'],
      minDeposit: '$50',
      badge: 'Partner',
      affiliateUrl: 'https://partners.elefin.com/go/ETTRADER',
    },
  ],
  steps: openAccountSteps,
  faqs: [
    {
      question: 'Is forex trading risky?',
      answer:
        'Yes. Forex and leveraged products carry a high risk of losing money quickly. Trade only with capital you can afford to lose and manage your risk on every position.',
    },
    {
      question: 'Which broker should I choose?',
      answer:
        'Pick one that is well-regulated, supports your country and payment methods, and offers a platform you’re comfortable with. Try the demo account first before funding.',
    },
    {
      question: 'Why create my account through your link?',
      answer:
        'It’s the same official broker sign-up — the partner link simply credits the referral to us at no extra cost to you, which helps support the free tools and content we build.',
    },
  ],
};

// ──────────────────────────────────────────────────────────────────────────
// IMPORTANT UPDATES & INFORMATION (shown on both pages)
//   ▶ Edit / add entries here whenever you have news for your users.
// ──────────────────────────────────────────────────────────────────────────
export const updates: Update[] = [
  {
    date: '2026-11-17',
    title: 'New partner brokers added',
    text: 'We’ve added fresh binary and forex brokers you can open an account with directly from these pages. Check the highlights before you sign up.',
    tone: 'new',
    tag: 'New',
  },
  {
    date: '2026-11-10',
    title: 'Always trade with risk management',
    text: 'Never risk more than a small percentage of your capital on a single trade. Use the ET Trader journal to review your discipline every week.',
    tone: 'info',
    tag: 'Tip',
  },
  {
    date: '2026-11-01',
    title: 'Beware of fake "signal" scams',
    text: 'We never ask for your broker password and we don’t guarantee profits. Ignore anyone promising fixed returns in our name.',
    tone: 'alert',
    tag: 'Alert',
  },
];

export function getBrokerPage(kind: BrokerKind): BrokerPageData {
  return kind === 'binary' ? binaryPage : forexPage;
}
