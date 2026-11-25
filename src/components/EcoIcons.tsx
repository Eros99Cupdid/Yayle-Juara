import React from 'react';
import type { EcoCategory } from '../types';

export const YayleLogoSvg: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 460 124"
    className={className}
    role="img"
    aria-label="Yayle Juara"
  >
    <defs>
      <linearGradient id="yjTitleGold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="55%" stopColor="#facc15" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
      <linearGradient id="yjTitleLeaf" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#4ade80" />
        <stop offset="100%" stopColor="#15803d" />
      </linearGradient>
      <filter id="yjDrop" x="-10%" y="-10%" width="120%" height="130%">
        <feDropShadow dx="0" dy="5" stdDeviation="0" floodColor="#143820" floodOpacity="0.92" />
      </filter>
    </defs>

    {/* Leaf Crest Emblem on left */}
    <g transform="translate(18, 14)" filter="url(#yjDrop)">
      <circle cx="46" cy="46" r="42" fill="#fefce8" stroke="#143820" strokeWidth="6" />
      <path
        d="M46 16 C64 24 76 42 72 62 C68 78 55 86 46 90 C37 86 24 78 20 62 C16 42 28 24 46 16 Z"
        fill="url(#yjTitleLeaf)"
        stroke="#143820"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="M46 28 L46 82 M46 50 L60 40 M46 64 L32 54" stroke="#143820" strokeWidth="4" strokeLinecap="round" />
      <polygon
        points="46,4 52,18 67,19 55,28 59,43 46,35 33,43 37,28 25,19 40,18"
        fill="url(#yjTitleGold)"
        stroke="#78350f"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
    </g>

    {/* Bespoke Wordmark */}
    <g filter="url(#yjDrop)">
      <text
        x="118"
        y="66"
        fontFamily="Fredoka, system-ui, sans-serif"
        fontWeight="700"
        fontSize="58"
        letterSpacing="1"
        fill="#fefce8"
        stroke="#143820"
        strokeWidth="10"
        paintOrder="stroke fill"
      >
        YAYLE
      </text>
      <text
        x="122"
        y="108"
        fontFamily="Fredoka, system-ui, sans-serif"
        fontWeight="700"
        fontSize="40"
        letterSpacing="3"
        fill="url(#yjTitleGold)"
        stroke="#143820"
        strokeWidth="8"
        paintOrder="stroke fill"
      >
        JUARA
      </text>
      {/* Decorative sprout accent above A */}
      <path
        d="M318 28 C326 14 344 12 348 24 C338 30 326 32 318 28 Z"
        fill="#4ade80"
        stroke="#143820"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M317 28 C308 16 294 18 294 28 C302 32 310 32 317 28 Z"
        fill="#22c55e"
        stroke="#143820"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

export const CategoryIconSvg: React.FC<{ category: EcoCategory; className?: string }> = ({
  category,
  className = 'w-6 h-6',
}) => {
  if (category === 'organic') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
          d="M12 3C16.8 5 19.5 9.8 18.5 15.2C17.6 19.5 14.5 21 12 21C9.5 21 6.4 19.5 5.5 15.2C4.5 9.8 7.2 5 12 3Z"
          fill="#22c55e"
          stroke="#143820"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M12 7V19M12 12L15.5 9.5M12 15.5L8.5 13" stroke="#143820" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (category === 'plastic') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <rect x="9" y="2.5" width="6" height="3" rx="1" fill="#fde047" stroke="#713f12" strokeWidth="1.8" />
        <path
          d="M8.5 7.5L10 5.5H14L15.5 7.5C16.5 8.5 17 9.8 17 11.2V19C17 20.4 15.9 21.5 14.5 21.5H9.5C8.1 21.5 7 20.4 7 19V11.2C7 9.8 7.5 8.5 8.5 7.5Z"
          fill="#facc15"
          stroke="#713f12"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M9.5 12.5H14.5M9.5 16H14.5" stroke="#713f12" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (category === 'paper') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path
          d="M6 3H14.5L19 7.5V20C19 20.8 18.3 21.5 17.5 21.5H6.5C5.7 21.5 5 20.8 5 20V4.5C5 3.7 5.4 3 6 3Z"
          fill="#38bdf8"
          stroke="#0c4a6e"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M14 3V8H19" fill="#bae6fd" stroke="#0c4a6e" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M8.5 12H15.5M8.5 15.5H14" stroke="#0c4a6e" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="5.5" fill="#fb923c" stroke="#7c2d12" strokeWidth="2" />
      <path
        d="M12 2.5V5M12 19V21.5M2.5 12H5M19 12H21.5M5.3 5.3L7.1 7.1M16.9 16.9L18.7 18.7M18.7 5.3L16.9 7.1M7.1 16.9L5.3 18.7"
        stroke="#7c2d12"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const StarBadgeSvg: React.FC<{ filled: boolean; className?: string }> = ({
  filled,
  className = 'w-6 h-6',
}) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <polygon
      points="12,2.4 15,8.6 21.8,9.5 16.8,14.2 18.1,21 12,17.7 5.9,21 7.2,14.2 2.2,9.5 9,8.6"
      fill={filled ? '#facc15' : '#e7e5e4'}
      stroke={filled ? '#78350f' : '#78716c'}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

export const OrbSocketSvg: React.FC<{ filled: boolean; className?: string }> = ({
  filled,
  className = 'w-5 h-5',
}) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <circle
      cx="12"
      cy="12"
      r="8.5"
      fill={filled ? '#4ade80' : 'rgba(20,56,32,0.22)'}
      stroke="#143820"
      strokeWidth="2.4"
    />
    {filled && <circle cx="9.2" cy="9.2" r="2.4" fill="#dcfce7" />}
  </svg>
);
