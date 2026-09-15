import React from 'react';

export interface KongoLogoProps {
  variant?: 'full' | 'emblem' | 'image' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
  src?: string;
  withContainer?: boolean;
}

export function KongoLogo({
  variant = 'full',
  size = 'md',
  className = '',
  src,
  withContainer = false,
}: KongoLogoProps) {
  // Height definitions to preserve aspect ratio perfectly
  const emblemSizes: Record<string, string> = {
    xs: 'h-6 w-auto',
    sm: 'h-8 w-auto',
    md: 'h-11 w-auto',
    lg: 'h-14 w-auto',
    xl: 'h-20 w-auto',
  };

  const fullSizes: Record<string, string> = {
    xs: 'h-7 w-auto',
    sm: 'h-9 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto',
    xl: 'h-24 w-auto',
  };

  // Official logo image paths (transparent, authentic, untouched)
  const fullLogoSrc = src || '/kongo_digital_logo.png';
  const emblemSrc = src || '/kongo_emblem.png';

  // Variant: Emblem only (Africa silhouette with 3 dynamic waves & Madagascar)
  if (variant === 'emblem') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <img
          src={emblemSrc}
          alt="Emblème Kongo Digital Wave"
          referrerPolicy="no-referrer"
          className={`${emblemSizes[size] || emblemSizes.md} object-contain select-none`}
          loading="eager"
        />
      </div>
    );
  }

  // Variant: Badge (Encapsulated on clean white container to guarantee contrast on dark cards/themes)
  if (variant === 'badge' || withContainer) {
    return (
      <div
        className={`inline-flex items-center justify-center bg-white/95 rounded-2xl p-2 px-3 shadow-md border border-white/20 select-none ${className}`}
      >
        <img
          src={fullLogoSrc}
          alt="Logo officiel Kongo Digital Wave"
          referrerPolicy="no-referrer"
          className={`${fullSizes[size] || fullSizes.md} object-contain`}
          loading="eager"
        />
      </div>
    );
  }

  // Variant: Full or Image (The official logo exactly as provided)
  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={fullLogoSrc}
        alt="Logo officiel Kongo Digital Wave"
        referrerPolicy="no-referrer"
        className={`${fullSizes[size] || fullSizes.md} object-contain`}
        loading="eager"
      />
    </div>
  );
}
