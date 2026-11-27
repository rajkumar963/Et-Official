import { productPrice } from '@et-trader/shared';

/** Course catalogue shown on /courses, the landing page and /courses/[slug]. */
export type CourseDirection = 'BASIC' | 'ADVANCED' | 'GOLD';

export interface CourseModule {
  title: string;
  summary: string;
  points: string[];
}

export interface Course {
  /** URL slug: /courses/<id>. Also used as the in-page anchor id on course cards. */
  id: string;
  number: string;
  level: string;
  title: string;
  description: string;
  direction: CourseDirection;
  artworkTitle: string;
  price: number;
  oldPrice: number | null;
  topics: string[];
  bestValue: boolean;
  tagline: string;
  overview: string[];
  outcomes: string[];
  modules: CourseModule[];
  audience: string[];
  requirements: string[];
}

const sharedRequirements = [
  'A trading platform and charts for following the lessons',
  'A Gmail account to receive Google Drive access',
  'A demo account is recommended for practising before trading real money',
];

/** Product IDs stay stable so existing purchases retain their access. */
export const courses: Course[] = [
  {
    id: 'basic-to-advanced-course',
    number: '01',
    level: 'ET STRATEGIES',
    title: 'Binary ET Strategies',
    description: 'ET live and OTC market strategies, money management, and trading psychology.',
    direction: 'BASIC',
    artworkTitle: 'BINARY MARKET',
    price: productPrice('basic-to-advanced-course'),
    oldPrice: null,
    topics: [
      'Introduction & building your trading plan',
      'ET money management',
      'ET live market strategy',
      'ET OTC market strategy',
      'Emotion control & trading psychology',
      'Personal experience & practical lessons',
    ],
    bestValue: false,
    tagline:
      'Build a trading plan around ET strategies, money management, and emotional discipline.',
    overview: [
      'Binary ET Strategies introduces the course, a structured trading plan, and the money-management principles used throughout the lessons.',
      'Study ET live-market and OTC-market strategies, then work on emotional control and trading psychology. Personal experience and practical lessons connect the topics to a repeatable process.',
    ],
    outcomes: [
      'Build a trading plan before entering a session',
      'Understand ET money-management principles',
      'Study the ET live-market strategy',
      'Study the ET OTC-market strategy',
      'Recognize emotional habits and develop trading discipline',
      'Reflect on practical lessons and personal experience',
    ],
    modules: [
      {
        title: 'Introduction & your trading plan',
        summary: 'Understand the course and put a plan around your trading.',
        points: ['Course introduction', 'How to build a trading plan', 'Preparing for a session'],
      },
      {
        title: 'ET money management',
        summary: 'Make money management part of the plan.',
        points: [
          'ET money-management approach',
          'Managing exposure',
          'Reviewing your risk decisions',
        ],
      },
      {
        title: 'ET live market strategy',
        summary: 'Study the ET approach to live-market trading.',
        points: ['Live-market strategy concepts', 'Reading the setup', 'Applying the trading plan'],
      },
      {
        title: 'ET OTC market strategy',
        summary: 'Study the ET approach to OTC-market trading.',
        points: [
          'OTC-market strategy concepts',
          'Recognizing trading conditions',
          'Reviewing your decisions',
        ],
      },
      {
        title: 'Emotion control & psychology',
        summary: 'Develop habits for calmer trading decisions.',
        points: [
          'Emotional control',
          'Trading psychology',
          'Avoiding impulsive decisions and overtrading',
        ],
      },
      {
        title: 'Personal experience & practical lessons',
        summary: 'Connect the strategy lessons with personal trading experience.',
        points: [
          'Lessons from personal experience',
          'Common trading mistakes',
          'Using your journal to reflect and improve',
        ],
      },
    ],
    audience: [
      'Binary traders interested in ET strategies',
      'Traders working on money management and psychology',
      'Learners looking for a structured live-market and OTC-market approach',
    ],
    requirements: sharedRequirements,
  },
  {
    id: 'advanced-to-pro-course',
    number: '02',
    level: 'BASIC TO ADVANCED',
    title: 'Basic to Advanced Binary Trading',
    description:
      'A complete learning path from chart basics to advanced tools and market analysis.',
    direction: 'ADVANCED',
    artworkTitle: 'BINARY TRADING',
    price: productPrice('advanced-to-pro-course'),
    oldPrice: null,
    topics: [
      'Candlestick types, patterns & psychology',
      'Support, resistance, trend lines & zones',
      'Market behavior, gaps & retests',
      'Indicators, tools & money management',
      'News reading & advanced order blocks',
      'Gann Box, oscillators, RSI & Fibonacci',
      'FVG & ETC on 1, 5 and 15 minute charts',
      'Trading psychology & emotional control',
    ],
    bestValue: true,
    tagline:
      'Learn binary trading step by step, from candlestick foundations to advanced chart concepts.',
    overview: [
      'Start with candle types, candlestick patterns and psychology. Build on those foundations with support and resistance, trend lines, zones, market behavior, gaps, and retests.',
      'Progress into news reading, advanced order blocks, Gann Box, oscillators, RSI, Fibonacci, FVG, and ETC across multiple timeframes. Money management and emotional discipline run throughout the course.',
    ],
    outcomes: [
      'Read candle types and common candlestick patterns',
      'Mark support, resistance, trend lines and chart zones',
      'Understand market behavior, gaps and retest concepts',
      'Study tools, indicators and money management',
      'Explore news reading, advanced order blocks and Gann Box',
      'Work with advanced RSI, Fibonacci, FVG and ETC concepts',
      'Develop trading discipline and emotional control',
    ],
    modules: [
      {
        title: 'Candlesticks & chart foundations',
        summary: 'Build the foundations for reading a trading chart.',
        points: ['Candle types', 'Candlestick patterns', 'Candlestick psychology'],
      },
      {
        title: 'Support, resistance & zones',
        summary: 'Understand key levels and the way price reacts around them.',
        points: ['Support and resistance', 'Trend lines', 'Zone marking and retest zones'],
      },
      {
        title: 'Market behavior, gaps & retests',
        summary: 'Study common market conditions and price reactions.',
        points: [
          'Bullish, bearish and sideways markets',
          'Gap-up and gap-down concepts',
          'Retest candles and retest zones',
        ],
      },
      {
        title: 'Tools & money management',
        summary: 'Bring chart tools together with risk awareness.',
        points: ['Indicators, tools, tips and tricks', 'Money management', 'Compounding concepts'],
      },
      {
        title: 'News reading & advanced chart tools',
        summary: 'Progress into the advanced analysis topics.',
        points: ['News reading', 'Advanced order blocks', 'Gann Box and oscillators'],
      },
      {
        title: 'RSI, Fibonacci & FVG',
        summary: 'Study advanced versions of familiar chart concepts.',
        points: ['Advanced RSI', 'Advanced Fibonacci', 'Fair value gap concepts'],
      },
      {
        title: 'ETC & multiple timeframes',
        summary: 'Study the ETC approach across the course timeframes.',
        points: ['ETC on 1 minute charts', 'ETC on 5 minute charts', 'ETC on 15 minute charts'],
      },
      {
        title: 'Psychology & personal experience',
        summary: 'Build discipline into your trading process.',
        points: [
          'Emotional control',
          'Avoiding overtrading and knowing when not to trade',
          'Practical lessons from personal experience',
        ],
      },
    ],
    audience: [
      'Beginners who want a complete binary-trading foundation',
      'Traders ready to progress from basic to advanced chart concepts',
      'Learners working on money management and trading discipline',
    ],
    requirements: sharedRequirements,
  },
];

/** A launch preview only: no checkout product or price until enrollment opens. */
export const forexMasterclass = {
  id: 'forex-gold-masterclass',
  title: 'Forex Gold Masterclass',
  direction: 'GOLD' as const,
  level: 'GOLD MASTERCLASS',
  artworkTitle: 'FOREX TRAINING',
  bestValue: false,
  description:
    'Dedicated forex training focused on gold (XAUUSD). Enrollment and the full course outline will be announced at launch.',
  topics: [
    'Forex & gold (XAUUSD)',
    'Trading plans & market analysis',
    'Risk management & trading discipline',
  ],
};
export function getCourse(slug: string) {
  return courses.find((course) => course.id === slug);
}

/** What every course includes (facts stated on the existing course cards). */
export const courseIncludes = [
  'Recorded video lessons',
  'Lifetime access',
  'Hindi & English',
  'Delivered on Google Drive to your Gmail',
];

/** How buying a course works. */
export const enrollmentSteps = [
  {
    title: 'Choose your course',
    text: 'Press “Enroll now”, sign in, and enter the Gmail address the course should be shared with.',
  },
  {
    title: 'Pay in USDT',
    text: 'Pick TRC20, BEP20 or ERC20, send the exact amount to the address shown, then paste your transaction ID.',
  },
  {
    title: 'Get lifetime access',
    text: 'Our team verifies the payment. Once approved, the course is shared to your Gmail and appears in My courses.',
  },
];

export const courseFaqs = [
  {
    question: 'How do I receive the course?',
    answer:
      'Course lessons are provided in a Google Drive folder. After our team approves your payment, access is shared to the Gmail address you entered at checkout and the link appears in My courses.',
  },
  {
    question: 'How do I pay?',
    answer:
      'Payment is in USDT on TRC20, BEP20 or ERC20. Checkout shows the exact amount, the wallet address and a QR code. Always send on the same network you selected.',
  },
  {
    question: 'Which language are the lessons in?',
    answer: 'The courses are taught in Hindi and English.',
  },
  {
    question: 'How long does approval take?',
    answer:
      'Every payment is checked by our team on the blockchain. You get an email as soon as it is approved, and you can follow the status in My courses.',
  },
  {
    question: 'Do I need to be an experienced trader?',
    answer:
      'Basic to Advanced Binary Trading starts with foundational topics. Practise new ideas on a demo account before trading real money.',
  },
  {
    question: 'Will this course make me profitable?',
    answer:
      'No course can promise results. These lessons teach methods and a process; how you apply them, and the risk you take, is your decision.',
  },
];
