import type { Ebook } from '../data/ebooks';

const covers = {
  patterns: {
    accent: '#b48aff',
    glow: '#713bc0',
    title: ['PRICE ACTION', 'PATTERNS 2.0'],
    subtitle: '15 HIGH-PROBABILITY PATTERNS',
  },
  hindi: {
    accent: '#68d7f2',
    glow: '#136786',
    title: ['CANDLESTICK', '& CHART PATTERNS'],
    subtitle: 'HINDI EDITION',
  },
  gold: {
    accent: '#f2c662',
    glow: '#83601e',
    title: ['GOLD', 'STRATEGY'],
    subtitle: 'THE COMPLETE XAUUSD GUIDE',
  },
};

/** Angled hardcover artwork, with a visible spine, page edges and foil accents. */
export function EbookArtwork({ ebook }: { ebook: Ebook }) {
  const cover = covers[ebook.type as keyof typeof covers];
  const id = `ebook-${ebook.id}`;

  return (
    <svg
      viewBox="0 0 360 300"
      role="img"
      aria-label={`${ebook.title} — 3D book cover`}
      className="block h-full w-full"
    >
      <defs>
        <radialGradient id={`${id}-ambient`}>
          <stop stopColor={cover.glow} stopOpacity=".24" />
          <stop offset="1" stopColor={cover.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-cover`} x2=".8" y2="1">
          <stop stopColor="#24252e" />
          <stop offset=".42" stopColor="#101119" />
          <stop offset="1" stopColor="#080a10" />
        </linearGradient>
        <linearGradient id={`${id}-spine`}>
          <stop stopColor="#07080d" />
          <stop offset=".4" stopColor={cover.glow} />
          <stop offset="1" stopColor="#181823" />
        </linearGradient>
        <linearGradient id={`${id}-foil`} x2="1" y2="1">
          <stop stopColor="#fff6cc" />
          <stop offset=".45" stopColor={cover.accent} />
          <stop offset="1" stopColor="#9b6c14" />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop stopColor={cover.glow} stopOpacity=".6" />
          <stop offset="1" stopColor={cover.glow} stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-shadow`} x="-50%" y="-100%" width="200%" height="300%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>
      <ellipse cx="182" cy="163" rx="155" ry="145" fill={`url(#${id}-ambient)`} />
      <ellipse
        cx="181"
        cy="274"
        rx="86"
        ry="9"
        fill="#000"
        opacity=".85"
        filter={`url(#${id}-shadow)`}
      />
      <path d="M103 43 232 26 253 37 125 55Z" fill="#c9c8c8" />
      <path
        d="m108 43 124-15m-117 18 123-15m-116 18 123-15"
        fill="none"
        stroke="#67666d"
        strokeWidth=".7"
      />
      <path d="m101 41 24 12v216l-24-14Z" fill={`url(#${id}-spine)`} stroke="#ffffff20" />
      <path d="m125 53 130-17v216l-130 17Z" fill={`url(#${id}-cover)`} stroke="#ffffff30" />
      <path d="m129 57 122-16v207l-122 16Z" fill="none" stroke={cover.accent} strokeOpacity=".15" />
      <path d="M107 48v204m14-197v206" stroke="#fff" strokeOpacity=".14" />
      <text
        transform="translate(110 94) rotate(90) skewX(7)"
        textLength="145"
        lengthAdjust="spacingAndGlyphs"
        fill="#d9d6df"
        fontSize="6"
        fontWeight="700"
        letterSpacing="1.3"
      >
        ET OFFICIAL · {cover.title.join(' ')}
      </text>
      <g transform="translate(125 53) skewY(-7.45)">
        <ellipse cx="72" cy="157" rx="69" ry="65" fill={`url(#${id}-glow)`} />
        <text x="65" y="20" textAnchor="middle" fill="#b1aeba" fontSize="4.7" letterSpacing="2">
          ET OFFICIAL
        </text>
        <path d="M16 28h98" stroke="#ffffff18" />
        <text
          x="65"
          y="54"
          textAnchor="middle"
          fill={ebook.type === 'gold' ? cover.accent : '#f2f0f7'}
          fontFamily="var(--font-display), sans-serif"
          fontSize={ebook.type === 'gold' ? '26' : '14.5'}
          fontWeight="900"
          letterSpacing="-.7"
        >
          {cover.title[0]}
        </text>
        <text
          x="65"
          y="74"
          textAnchor="middle"
          fill={cover.accent}
          fontFamily="var(--font-display), sans-serif"
          fontSize={ebook.type === 'hindi' ? '11.5' : '20'}
          fontWeight="900"
          letterSpacing="-.7"
        >
          {cover.title[1]}
        </text>
        <text x="65" y="89" textAnchor="middle" fill="#b6b2c2" fontSize="4.6" letterSpacing=".6">
          {cover.subtitle}
        </text>
        {ebook.type === 'gold' ? (
          <g fill={`url(#${id}-foil)`} stroke="#ffe6a5" strokeWidth=".6">
            <path d="M25 164h23v28H25Z" />
            <path d="M54 146h23v46H54Z" />
            <path d="M83 123h23v69H83Z" />
          </g>
        ) : (
          <g fill="none">
            <path
              d="M17 180h98M17 158h98M17 136h98M17 114h98M32 108v79m26-79v79m26-79v79m26-79v79"
              stroke={cover.accent}
              strokeOpacity=".09"
              strokeWidth=".6"
            />
            <path
              d="m17 177 14-17 12 7 16-25 13 10 13-22 14 5 16-21"
              stroke={cover.accent}
              strokeOpacity=".12"
              strokeWidth="7"
            />
            <path
              d="m17 177 14-17 12 7 16-25 13 10 13-22 14 5 16-21"
              stroke={cover.accent}
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </g>
        )}
        <path d="M16 202h98" stroke="#ffffff18" />
        <text x="65" y="211" textAnchor="middle" fill="#95909f" fontSize="4" letterSpacing="1.2">
          LEARN · PRACTICE · EXECUTE
        </text>
      </g>
    </svg>
  );
}
