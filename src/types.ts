export interface GpsLocation {
  address: string;
  landmark: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  plusCode?: string;
}

export interface BusinessCardProfile {
  name: string;
  title: string;
  company: string;
  tagline: string;
  bio: string;
  avatarUrl?: string;
  email: string;
  phone: string;
  whatsapp: string;
  linkedinUrl: string;
  websiteUrl: string;
  googleMapsShareUrl: string;
  location: GpsLocation;
  services: string[];
  skills: string[];
}

export type QrTargetType = 'card_url' | 'vcard_contact' | 'google_maps_location';
