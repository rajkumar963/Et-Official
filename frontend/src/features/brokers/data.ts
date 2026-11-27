/** Broker identities and account links for the Account and Update pages. */

export type Broker = {
  id: 'quotex' | 'binolla' | 'xm' | 'elefin';
  name: string;
  logo?: string;
  domain: string;
  linkType: 'partner' | 'official';
  /** One-line positioning shown under the name. */
  tagline: string;
  /** 2–3 sentence description. */
  description: string;
  /** Short selling points shown as a checklist. */
  highlights: string[];
  minDeposit: string;
  /** Existing referral URL, or the broker's own registration URL for an official link. */
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

export const binaryTelegram = {
  url: 'https://t.me/tradewithet',
  handle: '@tradewithet',
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
    text: 'Choose "Visit broker" to open the broker’s registration page. The card identifies whether you are using a partner link or an official account link.',
  },
  {
    title: 'Verify & fund',
    text: 'Complete the broker’s verification (KYC) and add funds using any supported method. Start small while you learn the platform.',
  },
  {
    title: 'Journal every trade',
    text: 'Come back to your ET Official dashboard and log each trade. Your analytics build the discipline that actually moves results.',
  },
];

// ──────────────────────────────────────────────────────────────────────────
// BINARY TRADING
// ──────────────────────────────────────────────────────────────────────────
export const binaryPage: BrokerPageData = {
  kind: 'binary',
  eyebrow: 'BINARY TRADING',
  title: 'Compare binary brokers.',
  titleAccent: 'Explore your options.',
  intro:
    'Fixed-payout trading on short time frames. Create your account through our partner link below, then track every trade in your ET Official journal to see what’s really working.',
  brokers: [
    {
      id: 'quotex',
      name: 'Quotex',
      domain: 'quotex.com',
      linkType: 'partner',
      tagline: 'Digital options on web and mobile',
      description:
        'Explore the trading platform with a demo account, review its terms, and use the partner registration link when you are ready to create an account.',
      highlights: ['Demo account', 'Digital options', 'Web platform', 'Mobile access'],
      minDeposit: '$10',
      affiliateUrl: 'https://broker-qx.pro/sign-up/?lid=2427717',
    },
    {
      id: 'binolla',
      name: 'Binolla',
      logo: '/brokers/binolla.png',
      domain: 'binolla.com',
      linkType: 'partner',
      tagline: 'Digital options and charting tools',
      description:
        'Access a digital-options platform with demo and real accounts. Review the available markets and the account conditions on Binolla before signing up.',
      highlights: ['Demo account', 'Digital options', 'Charting tools', 'Web and mobile'],
      minDeposit: 'See broker terms',
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
  title: 'Compare forex brokers.',
  titleAccent: 'Find your platform.',
  intro:
    'Compare XM, and Elefin, review their account terms, then open the broker’s registration page. Log your positions in ET Official to keep track of your trading process.',
  brokers: [
    {
      id: 'xm',
      name: 'XM Forex Broker',
      logo: '/brokers/xm.svg',
      domain: 'xm.com',
      linkType: 'partner',
      tagline: 'Forex and CFD trading platforms',
      description:
        'Explore XM’s forex and CFD markets, trading platforms, and account options. Our existing referral link opens XM’s account registration page.',
      highlights: ['Forex & CFDs', 'MetaTrader platforms', 'Demo accounts', 'Mobile access'],
      minDeposit: 'See broker terms',
      affiliateUrl: 'https://affs.click/iX8vA',
    },
    {
      id: 'elefin',
      name: 'Elefin Forex Broker',
      domain: 'elefin.com',
      linkType: 'partner',
      tagline: 'Open an account through ETTRADER',
      description:
        'Register with Elefin through the ETTRADER partner link. Review the available account options and broker terms before funding your account.',
      highlights: [
        'ETTRADER partner link',
        'Online registration',
        'Account options',
        'Client portal',
      ],
      minDeposit: 'See broker terms',
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
    text: 'Never risk more than a small percentage of your capital on a single trade. Use the ET Official journal to review your discipline every week.',
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
