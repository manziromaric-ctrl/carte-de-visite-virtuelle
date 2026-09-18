export interface GpsLocation {
  address: string;
  landmark: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  plusCode?: string;
}

export interface ShowcaseVideo {
  id: string; // 'video-1' | 'video-2'
  title: string;
  subtitle?: string;
  description: string;
  client?: string;
  category: string;
  duration?: string;
  videoUrl: string;
  posterUrl?: string;
}

export interface BusinessCardProfile {
  name: string;
  title: string;
  company: string;
  tagline: string;
  bio: string;
  avatarUrl?: string;
  logoUrl?: string;
  emblemUrl?: string;
  email: string;
  phone: string;
  whatsapp: string;
  linkedinUrl: string;
  websiteUrl: string;
  googleMapsShareUrl: string;
  location: GpsLocation;
  services: string[];
  skills: string[];
  showcaseVideos?: ShowcaseVideo[];
}

export type QrTargetType = 'card_url' | 'vcard_contact' | 'google_maps_location';
