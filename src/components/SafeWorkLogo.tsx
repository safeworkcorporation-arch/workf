import React from 'react';

interface SafeWorkLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'horizontal' | 'vertical' | 'icon-only';
  inverted?: boolean;
}

export const SafeWorkLogo: React.FC<SafeWorkLogoProps> = ({
  className = '',
  size = 'md',
  layout = 'horizontal',
  inverted = false,
}) => {
  const iconDimensions = {
    xs: { w: 24, h: 24 },
    sm: { w: 36, h: 36 },
    md: { w: 48, h: 48 },
    lg: { w: 64, h: 64 },
    xl: { w: 88, h: 88 },
  }[size];

  const textColor = inverted ? 'text-white' : 'text-slate-900';
  const subtextColor = inverted ? 'text-slate-300' : 'text-slate-500';

  // Vector emblem accurately matching the official Safe Work Corporation logo badge
  const renderEmblem = () => (
    <svg
      viewBox="0 0 120 120"
      width={iconDimensions.w}
      height={iconDimensions.h}
      className="flex-shrink-0 drop-shadow-xs"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Hexagon dark slate badge gradient */}
        <linearGradient id="swBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2c3e55" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        {/* Top facet - Blue */}
        <linearGradient id="swTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>

        {/* Left facet - Purple */}
        <linearGradient id="swLeftGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>

        {/* Right facet - Orange */}
        <linearGradient id="swRightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>

        {/* Bottom facet - Teal */}
        <linearGradient id="swBottomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="swGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. Outer Dark Hexagon / Shield Badge */}
      <polygon
        points="60,6 108,32 108,88 60,114 12,88 12,32"
        fill="url(#swBadgeGrad)"
        stroke="#334155"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* 2. Isometric Cube Faces */}
      {/* Top Face: Blue */}
      <polygon points="60,22 92,40 60,58 28,40" fill="url(#swTopGrad)" />

      {/* Left Face: Purple */}
      <polygon points="28,40 60,58 60,88 28,70" fill="url(#swLeftGrad)" />

      {/* Right Face: Orange */}
      <polygon points="60,58 92,40 92,70 60,88" fill="url(#swRightGrad)" />

      {/* Bottom Triangle/Diamond: Emerald Teal Accent */}
      <polygon points="28,70 60,88 60,98 28,80" fill="url(#swBottomGrad)" opacity="0.9" />
      <polygon points="60,88 92,70 92,80 60,98" fill="url(#swBottomGrad)" />

      {/* 3. Electronic Network Conduits / Connecting Lines */}
      <line x1="38" y1="46" x2="60" y2="58" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.8" />
      <line x1="82" y1="46" x2="60" y2="58" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.8" />
      <line x1="38" y1="72" x2="60" y2="58" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.8" />
      <line x1="82" y1="72" x2="60" y2="58" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.8" />

      {/* Internal diamond wireframe */}
      <polygon
        points="38,46 82,46 82,72 38,72"
        fill="none"
        stroke="#ffffff"
        strokeWidth="0.7"
        strokeOpacity="0.4"
      />

      {/* 4. White Nodes */}
      {/* Top Left Node */}
      <circle cx="38" cy="46" r="3.2" fill="#ffffff" filter="url(#swGlow)" />
      {/* Top Right Node */}
      <circle cx="82" cy="46" r="3.2" fill="#ffffff" filter="url(#swGlow)" />
      {/* Bottom Left Node */}
      <circle cx="38" cy="72" r="3.2" fill="#ffffff" filter="url(#swGlow)" />
      {/* Bottom Right Node */}
      <circle cx="82" cy="72" r="3.2" fill="#ffffff" filter="url(#swGlow)" />

      {/* Central Heart Node */}
      <circle cx="60" cy="58" r="4.5" fill="#ffffff" />
      <circle cx="60" cy="58" r="2" fill="#1e293b" />
    </svg>
  );

  if (layout === 'icon-only') {
    return <div className={`inline-flex items-center ${className}`}>{renderEmblem()}</div>;
  }

  if (layout === 'vertical') {
    return (
      <div className={`inline-flex flex-col items-center text-center ${className}`}>
        {renderEmblem()}
        <div className="mt-1.5">
          <div
            className={`font-black tracking-wider uppercase leading-tight ${textColor} ${
              size === 'xs'
                ? 'text-[11px]'
                : size === 'sm'
                ? 'text-xs'
                : size === 'md'
                ? 'text-sm'
                : size === 'lg'
                ? 'text-base'
                : 'text-lg'
            }`}
          >
            SAFE WORK
          </div>
          <div
            className={`font-bold tracking-[0.22em] uppercase ${subtextColor} ${
              size === 'xs' ? 'text-[7px]' : size === 'sm' ? 'text-[8px]' : 'text-[9px]'
            }`}
          >
            CORPORATION
          </div>
        </div>
      </div>
    );
  }

  // Horizontal layout (default)
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {renderEmblem()}
      <div className="flex flex-col justify-center">
        <div
          className={`font-black tracking-wider uppercase leading-none ${textColor} ${
            size === 'xs'
              ? 'text-xs'
              : size === 'sm'
              ? 'text-sm'
              : size === 'md'
              ? 'text-base'
              : size === 'lg'
              ? 'text-lg'
              : 'text-xl'
          }`}
        >
          SAFE WORK
        </div>
        <div
          className={`font-bold tracking-[0.24em] uppercase leading-tight mt-0.5 ${subtextColor} ${
            size === 'xs' ? 'text-[7px]' : size === 'sm' ? 'text-[8px]' : 'text-[9.5px]'
          }`}
        >
          CORPORATION
        </div>
      </div>
    </div>
  );
};
