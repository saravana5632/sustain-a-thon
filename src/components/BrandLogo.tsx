import React from 'react';

interface BrandLogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Original custom vector emblem for PaySure AI
 * Represents: AI signal nodes + financial shield + payment verification checkmark
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'dark',
  size = 'md',
}) => {
  const dimensions =
    size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-9 h-9' : 'w-8 h-8';
  const textClass =
    size === 'sm'
      ? 'text-base'
      : size === 'lg'
      ? 'text-xl'
      : 'text-lg';

  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${dimensions} shrink-0`}
        aria-hidden="true"
      >
        {/* Deep Navy Structural Shield Base */}
        <rect
          x="2"
          y="2"
          width="32"
          height="32"
          rx="8"
          fill={variant === 'light' ? '#0EA5E9' : '#0F172A'}
        />
        <rect
          x="2.75"
          y="2.75"
          width="30.5"
          height="30.5"
          rx="7.25"
          stroke={variant === 'light' ? '#38BDF8' : '#334155'}
          strokeWidth="1.5"
        />
        {/* Inner Shield Contour */}
        <path
          d="M18 7L27 10.5V17.8C27 23.4 23.15 27.95 18 29.5C12.85 27.95 9 23.4 9 17.8V10.5L18 7Z"
          fill={variant === 'light' ? '#0F172A' : '#1E293B'}
          stroke="#38BDF8"
          strokeWidth="1.4"
        />
        {/* AI Signal Nodes + Verified Confidence Check */}
        <path
          d="M14.2 18.3L16.9 21L22.2 15.2"
          stroke="#10B981"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="18" cy="10.5" r="1.3" fill="#38BDF8" />
      </svg>
      <span
        className={`font-bold tracking-tight whitespace-nowrap ${textClass} ${
          variant === 'light' ? 'text-white' : 'text-slate-900'
        }`}
      >
        PaySure <span className="text-sky-600">AI</span>
      </span>
    </span>
  );
};
