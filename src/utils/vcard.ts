import { BusinessCardProfile } from '../types';

/**
 * Generate standard vCard 3.0 text
 */
export function generateVCardString(profile: BusinessCardProfile): string {
  const parts = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${profile.name}`,
    `N:${profile.name.split(' ').slice(1).join(' ') || profile.name};${profile.name.split(' ')[0] || ''};;;`,
    `ORG:${profile.company}`,
    `TITLE:${profile.title}`,
    `TEL;TYPE=CELL,VOICE:${profile.phone.replace(/\s+/g, '')}`,
    `EMAIL;TYPE=INTERNET,PREF:${profile.email}`,
    `URL;TYPE=WORK:${profile.websiteUrl}`,
    `URL;TYPE=LINKEDIN:${profile.linkedinUrl}`,
    `URL;TYPE=MAPS:${profile.googleMapsShareUrl}`,
    `ADR;TYPE=WORK:;;${profile.location.address};${profile.location.city};;${profile.location.country}`,
    `GEO:${profile.location.latitude};${profile.location.longitude}`,
    `NOTE:${profile.tagline}\\nLocalisation GPS: ${profile.googleMapsShareUrl}\\nSite web: ${profile.websiteUrl}`,
    'END:VCARD',
  ];

  return parts.join('\r\n');
}

/**
 * Generate compact MECARD string optimized for camera QR code contact import
 */
export function generateMeCard(profile: BusinessCardProfile): string {
  const nameParts = profile.name.split(' ');
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : profile.name;
  const firstName = nameParts.length > 1 ? nameParts[0] : '';
  const cleanPhone = profile.phone.replace(/[^0-9+]/g, '');

  return `MECARD:N:${lastName},${firstName};ORG:${profile.company};TEL:${cleanPhone};EMAIL:${profile.email};URL:${profile.websiteUrl};ADR:,,${profile.location.city},,,${profile.location.country};NOTE:${profile.title} - ${profile.googleMapsShareUrl};;`;
}

/**
 * Triggers direct browser download of the .vcf contact card
 */
export function downloadVCard(profile: BusinessCardProfile): void {
  const vcardText = generateVCardString(profile);
  const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const filename = `${profile.name.replace(/\s+/g, '_')}_KongoDigitalWave.vcf`;
  
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Calculate distance between two GPS coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
