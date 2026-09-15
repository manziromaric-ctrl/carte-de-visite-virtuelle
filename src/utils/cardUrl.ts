/**
 * Helper to determine the public web URL of this digital business card
 * so mobile phone cameras scanning the QR code can open it directly.
 */

const FALLBACK_PUBLIC_URL = 'https://ais-pre-5y2gapfmtmewltcvbvolpt-222488109584.europe-west1.run.app';

export function getDigitalCardUrl(): string {
  if (typeof window !== 'undefined') {
    const { origin, pathname, hostname } = window.location;

    // Check if user is browsing on a real domain (not localhost)
    if (
      origin &&
      origin.startsWith('http') &&
      hostname !== 'localhost' &&
      hostname !== '127.0.0.1' &&
      !hostname.endsWith('.local')
    ) {
      // Return clean public URL without tracking or temporary search params
      return `${origin}${pathname}`;
    }
  }

  // If in localhost or iframe sandbox, use the injected public cloud URL
  const viteAppUrl = import.meta.env.VITE_APP_URL;
  if (viteAppUrl && typeof viteAppUrl === 'string' && !viteAppUrl.includes('localhost')) {
    return viteAppUrl;
  }

  return FALLBACK_PUBLIC_URL;
}
