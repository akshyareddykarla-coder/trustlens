import React from 'react';

interface TrustLensLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  className?: string;
  tagline?: boolean;
  variant?: 'lockup' | 'fullImage' | 'emblemOnly';
}

export const TrustLensLogo: React.FC<TrustLensLogoProps> = ({
  size = 'md',
  showWordmark = true,
  className = '',
  tagline = false,
  variant = 'lockup',
}) => {
  const sizeMap = {
    sm: {
      emblem: 'w-7 h-7',
      text: 'text-base',
      sub: 'text-[9px]',
      imgHeight: 'h-8',
    },
    md: {
      emblem: 'w-8 h-8',
      text: 'text-lg',
      sub: 'text-[10px]',
      imgHeight: 'h-10',
    },
    lg: {
      emblem: 'w-11 h-11',
      text: 'text-2xl',
      sub: 'text-xs',
      imgHeight: 'h-14',
    },
    xl: {
      emblem: 'w-16 h-16',
      text: 'text-3xl',
      sub: 'text-sm',
      imgHeight: 'h-20',
    },
  };

  const { emblem, text, sub, imgHeight } = sizeMap[size];

  if (variant === 'fullImage') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <img
          src="/branding/trustlens-logo.png"
          alt="TrustLens"
          className={`${imgHeight} w-auto object-contain drop-shadow-sm`}
        />
      </div>
    );
  }

  if (variant === 'emblemOnly') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <img
          src="/branding/trustlens-emblem.png"
          alt="TrustLens Emblem"
          className={`${emblem} object-contain drop-shadow-sm`}
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Official Emblem: Shield + Magnifying Glass + Verification Checkmark + Data Visualization Bars */}
      <div className={`${emblem} flex-shrink-0 relative flex items-center justify-center`}>
        <img
          src="/branding/trustlens-emblem.png"
          alt="TrustLens Symbol"
          className="w-full h-full object-contain drop-shadow-sm"
        />
      </div>

      {/* Single-Color Wordmark without extra color on Lens */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className={`font-black tracking-tight text-[#0B1220] dark:text-white ${text}`}>
            TrustLens
          </span>
          {tagline && (
            <span className={`font-medium text-slate-500 dark:text-slate-400 tracking-normal mt-0.5 ${sub}`}>
              Verify Before You Trust.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
