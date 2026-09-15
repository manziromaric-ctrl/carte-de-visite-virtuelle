import React from 'react';

interface KongoLogoProps {
  variant?: 'full' | 'emblem' | 'image' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
  lightMode?: boolean;
}

export function KongoLogo({
  variant = 'full',
  size = 'md',
  className = '',
  showTagline = true,
  lightMode = false,
}: KongoLogoProps) {
  // If variant is image, render the official logo image
  if (variant === 'image') {
    const sizeClasses = {
      xs: 'h-6',
      sm: 'h-9',
      md: 'h-12',
      lg: 'h-16',
      xl: 'h-24',
    }[size];

    return (
      <div className={`inline-flex items-center ${className}`}>
        <img
          src="/kongo_digital_logo.jpg"
          alt="Logo Kongo Digital Wave"
          referrerPolicy="no-referrer"
          className={`${sizeClasses} w-auto object-contain rounded-xl`}
        />
      </div>
    );
  }

  // Pure SVG Emblem only (Africa + 3 dynamic waves + Madagascar)
  if (variant === 'emblem') {
    const emblemSizes = {
      xs: 'w-7 h-7',
      sm: 'w-9 h-9',
      md: 'w-12 h-12',
      lg: 'w-16 h-16',
      xl: 'w-20 h-20',
    }[size];

    return (
      <svg
        viewBox="0 0 135 155"
        className={`${emblemSizes} shrink-0 ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="africaGradient" x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#16a34a" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id="waveGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>
          <linearGradient id="waveYellow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="waveRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
        </defs>

        {/* Africa Continent Silhouette */}
        <path
          d="M 45,15 C 55,14 70,18 78,24 C 84,29 88,38 90,44 C 92,52 87,58 84,65 C 80,72 82,78 80,86 C 78,94 72,102 68,110 C 64,118 60,126 56,134 C 54,138 52,142 50,144 C 48,142 46,136 44,130 C 42,122 40,112 38,104 C 36,94 32,86 28,78 C 22,70 16,62 14,54 C 12,46 16,36 22,28 C 28,22 36,16 45,15 Z"
          fill="url(#africaGradient)"
          className="drop-shadow-sm"
        />

        {/* Madagascar */}
        <path
          d="M 88,105 C 92,108 94,118 92,126 C 90,132 86,134 85,128 C 84,122 85,114 88,105 Z"
          fill="#eab308"
        />

        {/* Dynamic Sweeping Congo Waves across the continent */}
        {/* Top Green Ribbon */}
        <path
          d="M 5,64 C 22,66 45,61 68,48 C 85,38 106,26 122,17 C 112,30 94,44 74,56 C 54,67 28,74 7,72 Z"
          fill="url(#waveGreen)"
        />

        {/* Middle Yellow/Gold Ribbon */}
        <path
          d="M 12,74 C 32,76 54,70 76,55 C 96,42 116,29 130,22 C 118,37 98,53 76,66 C 54,78 30,83 14,81 Z"
          fill="url(#waveYellow)"
        />

        {/* Bottom Red/Crimson Ribbon with sharp dynamic wing */}
        <path
          d="M 20,83 C 40,84 62,77 82,62 C 102,48 120,36 133,28 C 122,43 102,60 80,75 C 58,88 34,92 22,90 Z"
          fill="url(#waveRed)"
        />
      </svg>
    );
  }

  // Full Brand Lockup (Emblem + Typography)
  const heightClasses = {
    xs: 'h-7',
    sm: 'h-9',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-20',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 ${className}`}>
      {/* Emblem */}
      <KongoLogo variant="emblem" size={size} />

      {/* Typography */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-baseline gap-1.5">
          <span className="font-black tracking-tight text-emerald-400 font-sans text-sm sm:text-base">
            Kongo
          </span>
          <span className="font-black tracking-tight text-rose-500 font-sans text-sm sm:text-base">
            Digital Wave
          </span>
        </div>
        {showTagline && (
          <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">
            Expert in Digital Marketing & Content Creation
          </span>
        )}
      </div>
    </div>
  );
}
