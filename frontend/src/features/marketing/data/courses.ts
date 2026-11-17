import { productPrice } from '@et-trader/shared';

/** Course catalogue shown on /courses, the landing page and /courses/[slug]. */
export type CourseDirection = 'BASIC' | 'ADVANCED';

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

export const courses: Course[] = [
  {
    id: 'basic-to-advanced-course',
    number: '01',
    level: 'BASIC TO ADVANCED',
    title: 'Basic to Advanced Trading Course',
    description: 'Build chart reading, strategy, risk management and trading discipline.',
    direction: 'BASIC',
    price: productPrice('basic-to-advanced-course'),
    oldPrice: null,
    topics: [
      'Candlestick types and patterns',
      'Support, resistance and trend lines',
      'Market behavior and zones',
      'Gaps and retests',
      'Money management and psychology',
    ],
    bestValue: false,
    tagline: 'Start with chart basics and build toward a structured trading process.',
    overview: [
      'This course covers the foundations shown in the course outline, from candles, support and resistance, and trend lines to chart patterns, market behavior, and risk management.',
      'It also covers trading psychology, emotional control, avoiding overtrading, and situations when it may be better not to trade.',
    ],
    outcomes: [
      'Identify candle types and common candlestick patterns',
      'Mark support, resistance, trend lines, and chart zones',
      'Understand gap-up and gap-down moves and retest concepts',
      'Recognize bullish, bearish, and sideways market behavior',
      'Apply money management and work on emotional discipline',
    ],
    modules: [
      {
        title: 'Candles and chart patterns',
        summary: 'Read candles and recognize the patterns highlighted in the course outline.',
        points: ['Candle types', 'Candlestick patterns', 'Candlestick psychology'],
      },
      {
        title: 'Levels, trend lines and zones',
        summary: 'Build a chart with key levels and areas to watch.',
        points: ['Support and resistance', 'Trend lines', 'Zone marking and retest zones'],
      },
      {
        title: 'Price behavior',
        summary: 'Study common market conditions and price reactions.',
        points: [
          'Gap-up and gap-down trading',
          'Retest candle and retest-zone concepts',
          'Bullish, bearish, and sideways market behavior',
        ],
      },
      {
        title: 'Tools and risk management',
        summary: 'Use chart tools with a focus on managing risk.',
        points: ['Indicators, tools, tips, and tricks', 'Money management', 'Compounding concepts'],
      },
      {
        title: 'Psychology and discipline',
        summary: 'Build habits for making more deliberate trading decisions.',
        points: [
          'Psychology and emotional control',
          'How to stop overtrading',
          'When not to trade and lessons from personal experience',
        ],
      },
    ],
    audience: [
      'Newer traders who want a structured foundation',
      'Traders who want to improve chart reading and risk habits',
      'Learners who want to study market behavior and trading psychology',
    ],
    requirements: sharedRequirements,
  },
  {
    id: 'advanced-to-pro-course',
    number: '02',
    level: 'ADVANCED TO PRO',
    title: 'Advanced to Pro Trading Course',
    description: 'Explore advanced tools, indicators, and concepts for chart analysis.',
    direction: 'ADVANCED',
    price: productPrice('advanced-to-pro-course'),
    oldPrice: null,
    topics: [
      'News reading',
      'Advanced order blocks',
      'Gann Box and oscillators',
      'Advanced RSI and Fibonacci',
      'FVG and ETC advanced timeframes',
    ],
    bestValue: true,
    tagline: 'Take your existing chart skills further with the advanced topics in the course outline.',
    overview: [
      'This course covers advanced chart tools and concepts listed in the provided outline, including news reading, advanced order blocks, Gann Box, and advanced oscillators.',
      'It also introduces advanced RSI and Fibonacci, the FVG concept, and ETC advanced charting on 1, 5, and 15 minute timeframes.',
    ],
    outcomes: [
      'Read news as part of market analysis',
      'Study advanced order blocks and Gann Box tools',
      'Explore advanced oscillator, RSI, and Fibonacci concepts',
      'Understand the FVG concept',
      'Apply ETC advanced concepts across 1, 5, and 15 minute charts',
    ],
    modules: [
      {
        title: 'News reading',
        summary: 'Include news reading in your trading analysis.',
        points: ['News reading concepts and context'],
      },
      {
        title: 'Advanced chart tools',
        summary: 'Explore the advanced tools named in the course outline.',
        points: ['Advanced order blocks', 'Advanced Gann Box', 'Advanced oscillator'],
      },
      {
        title: 'Advanced indicators',
        summary: 'Study advanced versions of familiar technical tools.',
        points: ['Advanced RSI', 'Advanced Fibonacci'],
      },
      {
        title: 'FVG and ETC advanced',
        summary: 'Explore the FVG concept and ETC advanced timeframes.',
        points: ['FVG concept', 'ETC advanced on 1 minute charts', 'ETC advanced on 5 and 15 minute charts'],
      },
    ],
    audience: [
      'Traders already comfortable reading charts',
      'Learners who want to explore advanced indicators and chart concepts',
      'Traders interested in the tools and timeframes covered in the outline',
    ],
    requirements: [
      'Basic familiarity with charts and trading concepts',
      'A Gmail account to receive Google Drive access',
      'A demo account is recommended for practising before trading real money',
    ],
  },
];

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
      'The Basic to Advanced course starts with foundational topics. Practise new ideas on a demo account before trading real money.',
  },
  {
    question: 'Will this course make me profitable?',
    answer:
      'No course can promise results. These lessons teach methods and a process; how you apply them, and the risk you take, is your decision.',
  },
];
