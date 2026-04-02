import { forwardRef } from 'react';

export const HealtifyLogo = forwardRef<SVGSVGElement, { size?: number; className?: string }>(
  ({ size = 40, className = '' }, ref) => {
    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="logoBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2CA3BF" />
            <stop offset="100%" stopColor="#ACF9FD" />
          </linearGradient>
          <linearGradient id="heartGrad" x1="14" y1="12" x2="34" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="100%" stopColor="#e0f7fa" />
          </linearGradient>
        </defs>

        <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#logoBg)" />

        <path
          d="M24 36C24 36 12 28 12 20.5C12 17 14.5 14 18 14C20.5 14 22.5 15.5 24 17.5C25.5 15.5 27.5 14 30 14C33.5 14 36 17 36 20.5C36 28 24 36 24 36Z"
          fill="url(#heartGrad)"
          opacity="0.95"
        />

        <path
          d="M10 24H16L18 20L21 28L24 22L26 26L28 24H38"
          stroke="#2CA3BF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        <circle cx="38" cy="12" r="5" fill="#0e7490" opacity="0.9" />
        <text x="38" y="15" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif">AI</text>
      </svg>
    );
  }
);

HealtifyLogo.displayName = 'HealthierLogo';
