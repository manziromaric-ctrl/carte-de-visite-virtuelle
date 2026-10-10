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
  id: string; // 'video-1' | 'video-2' | 'realisation-2'
  type?: 'video' | 'image';
  title: string;
  subtitle?: string;
  description: string;
  client?: string;
  category: string;
  duration?: string;
  videoUrl?: string;
  posterUrl?: string;
  imageUrl?: string;
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

export type InteractionActionType =
  | 'page_view'
  | 'save_contact'
  | 'qr_view'
  | 'phone_call'
  | 'whatsapp_click'
  | 'email_click'
  | 'share_card'
  | 'video_play'
  | 'realisation_view'
  | 'map_view'
  | 'social_link'
  | 'copy_link';

export interface CardInteractionEvent {
  id?: string;
  sessionId: string;
  actionType: InteractionActionType;
  actionLabel: string;
  timestamp: string; // ISO 8601 string
  country: string;
  countryCode: string;
  flagEmoji: string;
  city?: string;
  device: 'mobile' | 'desktop' | 'tablet';
  browser?: string;
  details?: string;
}

export interface CountryStatistic {
  country: string;
  countryCode: string;
  flagEmoji: string;
  count: number;
  uniqueUsers: number;
  percentage: number;
  lastActive: string;
}

export interface DailyStatistic {
  date: string; // 'YYYY-MM-DD'
  displayDate: string; // '10 Oct'
  totalInteractions: number;
  uniqueUsers: number;
}
