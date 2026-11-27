import { productPrice } from '@et-trader/shared';

/** E-book catalogue shown on /ebooks and the landing page. `id` is used for enquiry links. */
export const ebooks = [
  {
    id: 'price-action-patterns',
    number: '01',
    type: 'patterns',
    title: 'Price Action Patterns 2.0',
    subtitle: '15 high-probability trading patterns',
    features: [
      '15+ chart patterns',
      'Entry and exit rules',
      'Real chart examples',
      'Risk management',
    ],
    price: productPrice('price-action-patterns'),
    oldPrice: 60,
    approximatePrice: 'about \u20B9 3,000',
  },
  {
    id: 'candlestick-chart-patterns-hindi',
    number: '02',
    type: 'hindi',
    title: 'Technical Candlestick & Chart Pattern E-Book',
    subtitle:
      'Hindi edition (\u0939\u093f\u0902\u0926\u0940 \u0938\u0902\u0938\u094d\u0915\u0930\u0923)',
    features: [
      'Candlestick patterns',
      'Chart patterns',
      'Explained in Hindi',
      'Practical examples',
    ],
    price: productPrice('candlestick-chart-patterns-hindi'),
    oldPrice: 60,
    approximatePrice: 'about \u20B9 3,000',
  },
  {
    id: 'gold-strategy-book',
    number: '03',
    type: 'gold',
    title: 'Gold Strategy Book',
    subtitle: 'XAUUSD trading strategy: complete guide',
    features: [
      'Gold strategy fundamentals',
      'Supply & demand zones',
      'Multi-timeframe analysis',
      'Risk management',
    ],
    price: productPrice('gold-strategy-book'),
    oldPrice: 350,
    approximatePrice: 'about \u20B9 17,500',
  },
];

export type Ebook = (typeof ebooks)[number];

export function getEbook(id: string) {
  return ebooks.find((ebook) => ebook.id === id);
}

/** What buying an e-book includes (from the stated delivery plan). */
export const ebookIncludes = [
  'Personalized PDF e-book',
  'Read on phone, tablet or computer',
  'Up to 3 downloads',
  'Chart examples you can revisit anytime',
];

export const ebookSteps = [
  {
    title: 'Choose your e-book',
    text: 'Press “Get e-book”, sign in, and confirm the email the PDF should be sent to.',
  },
  {
    title: 'Pay in USDT',
    text: 'Pick TRC20, BEP20 or ERC20, send the exact amount shown, then paste your transaction ID.',
  },
  {
    title: 'Receive your PDF',
    text: 'Our team verifies the payment. Once approved, your download link is emailed and appears in My courses.',
  },
];

export const ebookFaqs = [
  {
    question: 'When can I buy the e-books?',
    answer:
      'All e-books are coming soon. A launch date has not been announced yet. Follow our Telegram community for updates.',
  },
  {
    question: 'What format are the e-books?',
    answer: 'Each e-book is a personalized PDF that you can read on any phone, tablet or computer.',
  },
  {
    question: 'Can I order an e-book now?',
    answer:
      'Orders are not open yet. Purchase and delivery details will be shared when the e-books launch.',
  },
  {
    question: 'Is there a Hindi edition?',
    answer: 'Yes — the Technical Candlestick & Chart Pattern E-Book is written in Hindi.',
  },
  {
    question: 'How many times can I download it?',
    answer: 'Each purchase includes up to 3 downloads of your personalized PDF.',
  },
];
