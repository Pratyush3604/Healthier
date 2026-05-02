import { forwardRef } from 'react';

export const HealtifyLogo = forwardRef<HTMLImageElement, { size?: number; className?: string }>(
  ({ size = 40, className = '' }, ref) => {
    return (
      <img
        ref={ref}
        src="/healthier-logo.png"
        alt="Healthier logo"
        width={size}
        height={size}
        className={className}
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
    );
  }
);

HealtifyLogo.displayName = 'HealthierLogo';
