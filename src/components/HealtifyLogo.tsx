export function HealtifyLogo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle with gradient */}
      <defs>
        <linearGradient id="logoBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="hsl(172, 66%, 50%)" />
          <stop offset="100%" stopColor="hsl(217, 91%, 60%)" />
        </linearGradient>
        <linearGradient id="heartGrad" x1="14" y1="12" x2="34" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#e0f7fa" />
        </linearGradient>
      </defs>
      
      {/* Rounded square background */}
      <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#logoBg)" />
      
      {/* Heart shape */}
      <path
        d="M24 36C24 36 12 28 12 20.5C12 17 14.5 14 18 14C20.5 14 22.5 15.5 24 17.5C25.5 15.5 27.5 14 30 14C33.5 14 36 17 36 20.5C36 28 24 36 24 36Z"
        fill="url(#heartGrad)"
        opacity="0.95"
      />
      
      {/* Pulse line across the heart */}
      <path
        d="M10 24H16L18 20L21 28L24 22L26 26L28 24H38"
        stroke="hsl(172, 66%, 45%)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Small AI dot */}
      <circle cx="38" cy="12" r="5" fill="hsl(280, 65%, 60%)" opacity="0.9" />
      <text x="38" y="15" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="sans-serif">AI</text>
    </svg>
  );
}
