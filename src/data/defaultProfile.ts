import { BusinessCardProfile } from '../types';
import defaultAvatar from '../assets/images/kongo_executive_photo_1789477918624.jpg';

export const DEFAULT_PROFILE: BusinessCardProfile = {
  name: 'Ange Elenga',
  title: 'Consultante Digitale & Stratège Médias',
  company: 'Kongo Digital Wave',
  tagline: 'Création de contenus stratégiques, audiovisuels & solutions digitales d\'impact',
  bio: 'Passionnée par l\'innovation technologique et la communication de marque en Afrique centrale. Nous accompagnons les entreprises, institutions et porteurs de projets dans leur visibilité et leur croissance numérique.',
  avatarUrl: defaultAvatar,
  email: 'congodigitalwave@gmail.com',
  phone: '+242 05 377 06 06',
  whatsapp: '+242053770606',
  linkedinUrl: 'https://www.linkedin.com/in/ange-elenga-4a37b0385/',
  websiteUrl: 'https://kongodigitalwave.netlify.app/',
  googleMapsShareUrl: 'https://share.google/zLH09B7lbmuFmabrn',
  location: {
    address: 'Avenue de la Paix, Centre-Ville',
    landmark: 'Bureaux Kongo Digital Wave',
    city: 'Pointe-Noire',
    country: 'République du Congo',
    latitude: -4.7774,
    longitude: 11.8635,
    plusCode: '6FV7+F8 Pointe-Noire',
  },
  services: [
    'Stratégie de communication digitale',
    'Production audiovisuelle & vidéo corporate',
    'Développement Web & Solutions digitales',
    'Campagnes d\'attraction d\'investisseurs',
  ],
  skills: [
    'Digital Transformation',
    'Content Strategy',
    'Branding & Video',
    'Project Management',
    'Tech & Web Solutions',
  ],
};
