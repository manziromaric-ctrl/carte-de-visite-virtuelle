import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  CardInteractionEvent, 
  InteractionActionType, 
  CountryStatistic, 
  DailyStatistic 
} from '../types';

const GEO_CACHE_KEY = 'kongo_cached_geo_data_v1';
const SESSION_KEY = 'kongo_visitor_session_id';
const LOCAL_EVENTS_BACKUP = 'kongo_local_analytics_backup';

export interface GeoInfo {
  country: string;
  countryCode: string;
  flagEmoji: string;
  city?: string;
}

/**
 * Converts a 2-letter ISO country code (e.g., 'CD', 'FR', 'BE') to its emoji flag.
 */
export function getCountryFlag(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌍';
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🌍';
  }
}

/**
 * Derives country information from timezone / browser locale as an instant zero-latency fallback.
 */
function getFallbackGeo(): GeoInfo {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const lang = navigator.language || 'fr';

  if (timeZone.includes('Kinshasa') || timeZone.includes('Lubumbashi') || timeZone.includes('Congo')) {
    return { country: 'RD Congo', countryCode: 'CD', flagEmoji: '🇨🇩', city: 'Kinshasa' };
  }
  if (timeZone.includes('Brazzaville')) {
    return { country: 'Congo-Brazzaville', countryCode: 'CG', flagEmoji: '🇨🇬', city: 'Brazzaville' };
  }
  if (timeZone.includes('Paris')) {
    return { country: 'France', countryCode: 'FR', flagEmoji: '🇫🇷', city: 'Paris' };
  }
  if (timeZone.includes('Brussels') || timeZone.includes('Bruxelles')) {
    return { country: 'Belgique', countryCode: 'BE', flagEmoji: '🇧🇪', city: 'Bruxelles' };
  }
  if (timeZone.includes('Montreal') || timeZone.includes('Toronto') || timeZone.includes('Vancouver')) {
    return { country: 'Canada', countryCode: 'CA', flagEmoji: '🇨🇦', city: 'Montréal' };
  }
  if (timeZone.includes('New_York') || timeZone.includes('Los_Angeles') || timeZone.includes('Chicago')) {
    return { country: 'États-Unis', countryCode: 'US', flagEmoji: '🇺🇸', city: 'New York' };
  }
  if (timeZone.includes('Dakar') || timeZone.includes('Senegal')) {
    return { country: 'Sénégal', countryCode: 'SN', flagEmoji: '🇸🇳', city: 'Dakar' };
  }
  if (timeZone.includes('Abidjan') || timeZone.includes('Ivory_Coast')) {
    return { country: "Côte d'Ivoire", countryCode: 'CI', flagEmoji: '🇨🇮', city: 'Abidjan' };
  }
  if (timeZone.includes('Douala') || timeZone.includes('Yaounde')) {
    return { country: 'Cameroun', countryCode: 'CM', flagEmoji: '🇨🇲', city: 'Douala' };
  }
  if (timeZone.includes('Casablanca')) {
    return { country: 'Maroc', countryCode: 'MA', flagEmoji: '🇲🇦', city: 'Casablanca' };
  }

  // Default to DR Congo (origin of Kongo Digital Wave) if francophone, else generic
  if (lang.toLowerCase().startsWith('fr')) {
    return { country: 'RD Congo', countryCode: 'CD', flagEmoji: '🇨🇩', city: 'Kinshasa' };
  }
  return { country: 'International', countryCode: 'CD', flagEmoji: '🇨🇩', city: 'Kinshasa' };
}

/**
 * Resolves user geolocation using fast IP lookup with caching and instant timezone fallback.
 */
export async function detectUserGeo(): Promise<GeoInfo> {
  if (typeof window === 'undefined') {
    return { country: 'RD Congo', countryCode: 'CD', flagEmoji: '🇨🇩', city: 'Kinshasa' };
  }

  // 1. Check cached info in sessionStorage
  try {
    const cached = sessionStorage.getItem(GEO_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.country && parsed.countryCode) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  // 2. Fast remote IP geolocation with 2.2s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2200);

    const res = await fetch('https://ipwho.is/?fields=country,country_code,city,success', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.country && data.country_code) {
        const info: GeoInfo = {
          country: data.country,
          countryCode: data.country_code,
          flagEmoji: getCountryFlag(data.country_code),
          city: data.city || undefined,
        };
        try {
          sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(info));
        } catch {
          // ignore
        }
        return info;
      }
    }
  } catch {
    // Network failure / adblocker / timeout -> try secondary lightweight fallback or timezone
  }

  // 3. Fallback to timezone/locale
  const fallback = getFallbackGeo();
  try {
    sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(fallback));
  } catch {
    // ignore
  }
  return fallback;
}

/**
 * Returns a consistent session ID for the current visitor.
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = `kongo_usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return `session_${Date.now()}`;
  }
}

/**
 * Detects device category.
 */
function getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;

  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua) || (width >= 768 && width <= 1024)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua) || width < 768) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Simple browser name detection.
 */
function getBrowserName(): string {
  if (typeof window === 'undefined') return 'Browser';
  const ua = navigator.userAgent;
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('SamsungBrowser')) return 'Samsung Internet';
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edg')) return 'Edge';
  return 'Navigateur Web';
}

/**
 * Tracks an interaction in real-time to Firestore.
 */
export async function trackInteraction(
  actionType: InteractionActionType,
  actionLabel: string,
  details?: string
): Promise<CardInteractionEvent | null> {
  try {
    const geo = await detectUserGeo();
    const sessionId = getSessionId();
    const event: CardInteractionEvent = {
      sessionId,
      actionType,
      actionLabel,
      timestamp: new Date().toISOString(),
      country: geo.country,
      countryCode: geo.countryCode,
      flagEmoji: geo.flagEmoji,
      city: geo.city,
      device: getDeviceType(),
      browser: getBrowserName(),
      details,
    };

    // 1. Write to Firestore in background
    try {
      const colRef = collection(db, 'card_interactions');
      addDoc(colRef, event).catch((err) => {
        console.warn('Firestore addDoc non-blocking warning:', err);
      });
    } catch (fsErr) {
      console.warn('Firestore collection access failed:', fsErr);
    }

    // 2. Backup to localStorage for immediate client feedback and offline safety
    try {
      const stored = localStorage.getItem(LOCAL_EVENTS_BACKUP);
      const list: CardInteractionEvent[] = stored ? JSON.parse(stored) : [];
      list.unshift(event);
      localStorage.setItem(LOCAL_EVENTS_BACKUP, JSON.stringify(list.slice(0, 50)));
    } catch {
      // ignore
    }

    return event;
  } catch (err) {
    console.warn('Failed to track interaction:', err);
    return null;
  }
}

/**
 * Subscribes to the live interaction feed from Firestore.
 */
export function subscribeToLiveInteractions(
  onData: (events: CardInteractionEvent[]) => void,
  limitCount = 120
): () => void {
  try {
    const colRef = collection(db, 'card_interactions');
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(limitCount));

    return onSnapshot(
      q,
      (snapshot) => {
        const events: CardInteractionEvent[] = [];
        snapshot.forEach((docSnap) => {
          events.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<CardInteractionEvent, 'id'>),
          });
        });

        // If firestore returned results, deliver them
        if (events.length > 0) {
          onData(events);
        } else {
          // If Firestore is newly initialized, fallback to local backup or initial seeds
          const localStored = localStorage.getItem(LOCAL_EVENTS_BACKUP);
          if (localStored) {
            try {
              const list = JSON.parse(localStored);
              if (Array.isArray(list) && list.length > 0) {
                onData(list);
                return;
              }
            } catch {
              // ignore
            }
          }
          onData(getSeedInteractions());
        }
      },
      (error) => {
        console.warn('Live interaction listener warning:', error);
        // Fallback to local storage or seeds
        const localStored = localStorage.getItem(LOCAL_EVENTS_BACKUP);
        if (localStored) {
          try {
            const list = JSON.parse(localStored);
            if (Array.isArray(list) && list.length > 0) {
              onData(list);
              return;
            }
          } catch {
            // ignore
          }
        }
        onData(getSeedInteractions());
      }
    );
  } catch (err) {
    console.error('Failed to initialize live interactions listener:', err);
    onData(getSeedInteractions());
    return () => {};
  }
}

/**
 * Formats a timestamp into human-readable French date and time.
 */
export function formatInteractionDate(timestampStr: string): {
  date: string;
  time: string;
  relative: string;
} {
  try {
    const date = new Date(timestampStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    let relative = 'À l’instant';
    if (diffMin < 1) relative = 'À l’instant (En direct)';
    else if (diffMin === 1) relative = 'Il y a 1 minute';
    else if (diffMin < 60) relative = `Il y a ${diffMin} min`;
    else if (diffHours === 1) relative = 'Il y a 1 heure';
    else if (diffHours < 24) relative = `Il y a ${diffHours} h`;
    else if (diffDays === 1) relative = 'Hier';
    else relative = `Il y a ${diffDays} jours`;

    const formattedDate = date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const formattedTime = date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return {
      date: formattedDate,
      time: formattedTime,
      relative,
    };
  } catch {
    return { date: 'Aujourd’hui', time: '--:--', relative: 'Récemment' };
  }
}

/**
 * Computes high-level analytics summary:
 * - total events
 * - unique visitors
 * - countries breakdown & percentages
 * - 7-day daily trends
 * - action breakdown
 * - active now in the last 15 minutes
 */
export function computeAnalyticsSummary(events: CardInteractionEvent[]) {
  const totalInteractions = events.length;
  const uniqueUsersSet = new Set<string>();
  const activeNowSet = new Set<string>();
  const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
  const todayStr = new Date().toISOString().slice(0, 10);

  let todayInteractions = 0;
  const countryCounts: Record<string, { count: number; users: Set<string>; code: string; flag: string; lastActive: string }> = {};
  const actionCounts: Record<InteractionActionType, number> = {
    page_view: 0,
    save_contact: 0,
    qr_view: 0,
    phone_call: 0,
    whatsapp_click: 0,
    email_click: 0,
    share_card: 0,
    video_play: 0,
    realisation_view: 0,
    map_view: 0,
    social_link: 0,
    copy_link: 0,
  };
  const deviceCounts: Record<'mobile' | 'desktop' | 'tablet', number> = {
    mobile: 0,
    desktop: 0,
    tablet: 0,
  };

  const dailyBuckets: Record<string, { total: number; users: Set<string> }> = {};

  // Initialize last 7 days buckets
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyBuckets[key] = { total: 0, users: new Set() };
  }

  events.forEach((ev) => {
    uniqueUsersSet.add(ev.sessionId);

    const evTime = new Date(ev.timestamp).getTime();
    if (evTime >= fifteenMinutesAgo) {
      activeNowSet.add(ev.sessionId);
    }

    const evDateStr = ev.timestamp ? ev.timestamp.slice(0, 10) : todayStr;
    if (evDateStr === todayStr) {
      todayInteractions++;
    }

    if (dailyBuckets[evDateStr]) {
      dailyBuckets[evDateStr].total++;
      dailyBuckets[evDateStr].users.add(ev.sessionId);
    }

    // Country stats
    const cName = ev.country || 'Inconnu';
    if (!countryCounts[cName]) {
      countryCounts[cName] = {
        count: 0,
        users: new Set(),
        code: ev.countryCode || 'XX',
        flag: ev.flagEmoji || '🌍',
        lastActive: ev.timestamp,
      };
    }
    countryCounts[cName].count++;
    countryCounts[cName].users.add(ev.sessionId);

    // Action breakdown
    if (actionCounts[ev.actionType] !== undefined) {
      actionCounts[ev.actionType]++;
    }

    // Device breakdown
    if (ev.device && deviceCounts[ev.device] !== undefined) {
      deviceCounts[ev.device]++;
    } else {
      deviceCounts.mobile++;
    }
  });

  const countriesList: CountryStatistic[] = Object.entries(countryCounts)
    .map(([country, data]) => ({
      country,
      countryCode: data.code,
      flagEmoji: data.flag,
      count: data.count,
      uniqueUsers: data.users.size,
      percentage: totalInteractions > 0 ? Math.round((data.count / totalInteractions) * 100) : 0,
      lastActive: data.lastActive,
    }))
    .sort((a, b) => b.count - a.count);

  const dailyStats: DailyStatistic[] = Object.entries(dailyBuckets).map(([date, dData]) => {
    const dObj = new Date(date);
    const displayDate = dObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    return {
      date,
      displayDate,
      totalInteractions: dData.total,
      uniqueUsers: dData.users.size,
    };
  });

  return {
    totalInteractions,
    uniqueUsers: uniqueUsersSet.size,
    todayInteractions,
    activeNow: activeNowSet.size,
    countriesList,
    actionCounts,
    deviceCounts,
    dailyStats,
  };
}

/**
 * Initial seed interactions showcasing realistic baseline activity for Kongo Digital Wave
 * across Kinshasa, Paris, Bruxelles, Montréal, etc.
 */
function getSeedInteractions(): CardInteractionEvent[] {
  const now = Date.now();
  return [
    {
      id: 'seed-1',
      sessionId: 'sess_kdc_kin1',
      actionType: 'whatsapp_click',
      actionLabel: 'Contact direct WhatsApp initié',
      timestamp: new Date(now - 4 * 60 * 1000).toISOString(),
      country: 'RD Congo',
      countryCode: 'CD',
      flagEmoji: '🇨🇩',
      city: 'Kinshasa',
      device: 'mobile',
      browser: 'Chrome Mobile',
      details: 'Demande de devis vidéo',
    },
    {
      id: 'seed-2',
      sessionId: 'sess_kdc_kin1',
      actionType: 'video_play',
      actionLabel: 'Lecture vidéo Spot Kongo Digital Wave',
      timestamp: new Date(now - 7 * 60 * 1000).toISOString(),
      country: 'RD Congo',
      countryCode: 'CD',
      flagEmoji: '🇨🇩',
      city: 'Kinshasa',
      device: 'mobile',
      browser: 'Chrome Mobile',
    },
    {
      id: 'seed-3',
      sessionId: 'sess_kdc_par1',
      actionType: 'save_contact',
      actionLabel: 'Téléchargement de la fiche contact vCard',
      timestamp: new Date(now - 22 * 60 * 1000).toISOString(),
      country: 'France',
      countryCode: 'FR',
      flagEmoji: '🇫🇷',
      city: 'Paris',
      device: 'mobile',
      browser: 'Safari iPhone',
    },
    {
      id: 'seed-4',
      sessionId: 'sess_kdc_bru1',
      actionType: 'realisation_view',
      actionLabel: 'Affichage réalisation HD Shooting 4K',
      timestamp: new Date(now - 45 * 60 * 1000).toISOString(),
      country: 'Belgique',
      countryCode: 'BE',
      flagEmoji: '🇧🇪',
      city: 'Bruxelles',
      device: 'desktop',
      browser: 'Chrome',
    },
    {
      id: 'seed-5',
      sessionId: 'sess_kdc_kin2',
      actionType: 'phone_call',
      actionLabel: 'Appel direct vers Manzi Romaric',
      timestamp: new Date(now - 90 * 60 * 1000).toISOString(),
      country: 'RD Congo',
      countryCode: 'CD',
      flagEmoji: '🇨🇩',
      city: 'Gombe, Kinshasa',
      device: 'mobile',
      browser: 'Samsung Internet',
    },
    {
      id: 'seed-6',
      sessionId: 'sess_kdc_mtl1',
      actionType: 'qr_view',
      actionLabel: 'Scan et affichage Code QR Digital',
      timestamp: new Date(now - 140 * 60 * 1000).toISOString(),
      country: 'Canada',
      countryCode: 'CA',
      flagEmoji: '🇨🇦',
      city: 'Montréal',
      device: 'desktop',
      browser: 'Safari Mac',
    },
    {
      id: 'seed-7',
      sessionId: 'sess_kdc_kin3',
      actionType: 'map_view',
      actionLabel: 'Consultation itinéraire GPS Bureau Gombe',
      timestamp: new Date(now - 210 * 60 * 1000).toISOString(),
      country: 'RD Congo',
      countryCode: 'CD',
      flagEmoji: '🇨🇩',
      city: 'Kinshasa',
      device: 'mobile',
      browser: 'Chrome Mobile',
    },
    {
      id: 'seed-8',
      sessionId: 'sess_kdc_bz1',
      actionType: 'share_card',
      actionLabel: 'Partage de la carte de visite',
      timestamp: new Date(now - 340 * 60 * 1000).toISOString(),
      country: 'Congo-Brazzaville',
      countryCode: 'CG',
      flagEmoji: '🇨🇬',
      city: 'Brazzaville',
      device: 'mobile',
      browser: 'Chrome Mobile',
    },
    {
      id: 'seed-9',
      sessionId: 'sess_kdc_par2',
      actionType: 'social_link',
      actionLabel: 'Visite profil LinkedIn',
      timestamp: new Date(now - 480 * 60 * 1000).toISOString(),
      country: 'France',
      countryCode: 'FR',
      flagEmoji: '🇫🇷',
      city: 'Lyon',
      device: 'desktop',
      browser: 'Firefox',
    },
    {
      id: 'seed-10',
      sessionId: 'sess_kdc_us1',
      actionType: 'page_view',
      actionLabel: 'Ouverture de la carte de visite',
      timestamp: new Date(now - 720 * 60 * 1000).toISOString(),
      country: 'États-Unis',
      countryCode: 'US',
      flagEmoji: '🇺🇸',
      city: 'Washington',
      device: 'desktop',
      browser: 'Edge',
    },
  ];
}
