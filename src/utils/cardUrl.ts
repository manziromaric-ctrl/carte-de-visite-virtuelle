/**
 * Helper to determine and configure the public web URL of this digital business card
 * so mobile phone cameras scanning the QR code open it directly and reliably.
 */

const CUSTOM_URL_STORAGE_KEY = 'kdw_custom_card_production_url';

export function getCustomCardUrl(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(CUSTOM_URL_STORAGE_KEY);
    if (saved && saved.trim().startsWith('http')) {
      return saved.trim();
    }
  } catch {
    // ignore
  }
  return null;
}

export function setCustomCardUrl(url: string): void {
  if (typeof window === 'undefined') return;
  try {
    if (!url || !url.trim()) {
      localStorage.removeItem(CUSTOM_URL_STORAGE_KEY);
    } else {
      let cleanUrl = url.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`;
      }
      localStorage.setItem(CUSTOM_URL_STORAGE_KEY, cleanUrl);
    }
  } catch {
    // ignore
  }
}

export function resetCustomCardUrl(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CUSTOM_URL_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function getDigitalCardUrl(): string {
  // 1. User manual override (highest priority, e.g. their specific Netlify or custom domain)
  const customUrl = getCustomCardUrl();
  if (customUrl) {
    return customUrl;
  }

  // 2. Real browser domain detection (Netlify, custom domain, or live server)
  if (typeof window !== 'undefined') {
    const { origin, pathname, hostname } = window.location;

    if (
      origin &&
      origin.startsWith('http') &&
      hostname !== 'localhost' &&
      hostname !== '127.0.0.1' &&
      !hostname.endsWith('.local')
    ) {
      // Remove trailing slash if root
      const cleanPath = pathname === '/' ? '' : pathname;
      return `${origin}${cleanPath}`;
    }
  }

  // 3. Environment or container fallback
  const viteAppUrl = (import.meta.env as Record<string, string | undefined>).VITE_APP_URL;
  if (viteAppUrl && typeof viteAppUrl === 'string' && !viteAppUrl.includes('localhost')) {
    return viteAppUrl;
  }

  return 'https://ais-pre-5y2gapfmtmewltcvbvolpt-222488109584.europe-west1.run.app';
}
