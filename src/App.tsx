import { useState, useEffect } from 'react';
import { 
  QrCode, 
  Settings2, 
  Share2, 
  Check, 
  MapPin, 
  Sparkles, 
  Download, 
  Globe, 
  Linkedin, 
  Compass, 
  ArrowUpRight, 
  ShieldCheck, 
  Send, 
  Eye,
  Lock
} from 'lucide-react';
import { BusinessCardProfile, ShowcaseVideo } from './types';
import { DEFAULT_PROFILE } from './data/defaultProfile';
import { PhysicalCardPreview } from './components/PhysicalCardPreview';
import { ActionButtons } from './components/ActionButtons';
import { OnlinePresenceSection } from './components/OnlinePresenceSection';
import { GpsLocationSection } from './components/GpsLocationSection';
import { AboutSection } from './components/AboutSection';
import { VideoShowcaseSection } from './components/VideoShowcaseSection';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { QrCodeModal } from './components/QrCodeModal';
import { EditProfileModal } from './components/EditProfileModal';
import { PasswordModal } from './components/PasswordModal';
import { PhotoModal } from './components/PhotoModal';
import { KongoLogo } from './components/KongoLogo';
import { downloadVCard } from './utils/vcard';
import { getDigitalCardUrl } from './utils/cardUrl';
import { getStoredVideoUrl, getStoredVideoRecord } from './utils/videoStorage';
import { uploadVideoToSupabase } from './utils/supabaseStorage';
import {
  subscribeToProfileChanges,
  saveProfileToCloud,
  fetchInitialCloudProfile,
  CloudSyncStatus,
} from './services/cloudSync';

const STORAGE_KEY = 'kongo_digital_wave_profile_v2';
const VIEWS_COUNT_KEY = 'kongo_digital_card_views_count';
const LAST_VIEW_KEY = 'kongo_digital_card_last_view_timestamp';
const VIEW_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes cooldown to prevent double-counting

export default function App() {
  const [profile, setProfile] = useState<BusinessCardProfile>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...DEFAULT_PROFILE,
            ...parsed,
            avatarUrl: parsed.avatarUrl || DEFAULT_PROFILE.avatarUrl,
            showcaseVideos:
              parsed.showcaseVideos && parsed.showcaseVideos.length > 0
                ? parsed.showcaseVideos
                : DEFAULT_PROFILE.showcaseVideos,
          };
        } catch {
          // fallback to default
        }
      }
    }
    return DEFAULT_PROFILE;
  });

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return sessionStorage.getItem('kongo_admin_authenticated') === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'videos' | 'links' | 'gps' | 'about'>('all');
  const [cardUrlVersion, setCardUrlVersion] = useState(0);

  // Video Player Modal State
  const [selectedVideo, setSelectedVideo] = useState<ShowcaseVideo | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Cloud Real-time Sync Status
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus | null>(null);

  // Real-time Cloud Synchronization (Firebase Firestore + Supabase)
  useEffect(() => {
    // 1. Fetch initial profile from Cloud
    fetchInitialCloudProfile().then((cloudData) => {
      if (cloudData && Object.keys(cloudData).length > 0) {
        setProfile((prev) => ({
          ...prev,
          ...cloudData,
          showcaseVideos:
            cloudData.showcaseVideos && cloudData.showcaseVideos.length > 0
              ? cloudData.showcaseVideos
              : prev.showcaseVideos,
        }));
      }
    });

    // 2. Subscribe to live real-time updates across readers
    const unsubscribe = subscribeToProfileChanges(
      (cloudUpdate) => {
        if (cloudUpdate && Object.keys(cloudUpdate).length > 0) {
          setProfile((prev) => {
            const merged = {
              ...prev,
              ...cloudUpdate,
              showcaseVideos:
                cloudUpdate.showcaseVideos && cloudUpdate.showcaseVideos.length > 0
                  ? cloudUpdate.showcaseVideos
                  : prev.showcaseVideos,
            };
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            } catch {
              // ignore
            }
            return merged;
          });
        }
      },
      (status) => {
        setSyncStatus(status);
      }
    );

    return () => unsubscribe();
  }, []);

  // Restore uploaded videos from IndexedDB and auto-sync to Cloud for mobile streaming
  useEffect(() => {
    let isMounted = true;

    async function restoreAndSyncVideos() {
      try {
        const storedUrl1 = await getStoredVideoUrl('video-1');
        const storedUrl2 = await getStoredVideoUrl('video-2');
        const record2 = await getStoredVideoRecord('video-2');

        // 1. Only use local blob if there is NO valid remote https URL in profile
        setProfile((prev) => {
          const list = [...(prev.showcaseVideos || DEFAULT_PROFILE.showcaseVideos || [])];
          let changed = false;

          const idx1 = list.findIndex((v) => v.id === 'video-1');
          if (idx1 >= 0 && storedUrl1) {
            const currentUrl = list[idx1].videoUrl || '';
            const isRemoteValid = currentUrl.startsWith('http') && !currentUrl.startsWith('blob:');
            if (!isRemoteValid) {
              list[idx1] = { ...list[idx1], videoUrl: storedUrl1 };
              changed = true;
            }
          }

          const idx2 = list.findIndex((v) => v.id === 'video-2');
          if (idx2 >= 0 && storedUrl2) {
            const currentUrl = list[idx2].videoUrl || '';
            const isRemoteValid = currentUrl.startsWith('http') && !currentUrl.startsWith('blob:');
            if (!isRemoteValid) {
              list[idx2] = { ...list[idx2], videoUrl: storedUrl2 };
              changed = true;
            }
          }

          return changed ? { ...prev, showcaseVideos: list } : prev;
        });

        // 2. Auto-sync video-2 to Supabase Cloud if it's stored in IndexedDB but Cloud URL is a blob or missing
        if (record2 && record2.blob) {
          // Delay briefly to allow initial cloud profile fetch to finish
          setTimeout(async () => {
            if (!isMounted) return;

            setProfile((current) => {
              const currentV2 = current.showcaseVideos?.find((v) => v.id === 'video-2');
              const url = currentV2?.videoUrl || '';
              const needsUpload = !url || url.startsWith('blob:') || !url.startsWith('https://');

              if (needsUpload) {
                console.log('Synchronisation automatique de la vidéo 2 vers Supabase Storage...');
                uploadVideoToSupabase('video-2', record2.blob).then((uploadRes) => {
                  if (uploadRes.success && uploadRes.url && isMounted) {
                    console.log('Vidéo 2 synchronisée avec succès vers Supabase:', uploadRes.url);
                    setProfile((latest) => {
                      const updatedList = [...(latest.showcaseVideos || [])];
                      const targetIdx = updatedList.findIndex((v) => v.id === 'video-2');
                      if (targetIdx >= 0) {
                        updatedList[targetIdx] = {
                          ...updatedList[targetIdx],
                          videoUrl: uploadRes.url!,
                          title: updatedList[targetIdx].title && updatedList[targetIdx].title !== 'Deuxième Réalisation Vidéo (À configurer)'
                            ? updatedList[targetIdx].title
                            : (record2.name ? record2.name.replace(/\.[^/.]+$/, '') : 'Deuxième Réalisation Vidéo'),
                        };
                      }
                      const finalProfile = { ...latest, showcaseVideos: updatedList };
                      saveProfileToCloud(finalProfile);
                      return finalProfile;
                    });
                  }
                });
              }
              return current;
            });
          }, 1200);
        }
      } catch (err) {
        console.warn('Video restore/sync error:', err);
      }
    }

    restoreAndSyncVideos();
    return () => { isMounted = false; };
  }, []);

  // View counter state with localStorage anti-double-counting
  const [viewCount, setViewCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(VIEWS_COUNT_KEY);
        if (stored) {
          const parsed = parseInt(stored, 10);
          if (!isNaN(parsed) && parsed > 0) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return 1;
  });

  // Track access on mount, preventing double-counting via localStorage timestamp check
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const now = Date.now();
      const lastViewTimestamp = localStorage.getItem(LAST_VIEW_KEY);
      const storedCountRaw = localStorage.getItem(VIEWS_COUNT_KEY);
      const storedCount = storedCountRaw ? parseInt(storedCountRaw, 10) : 0;

      // Check if session has already been counted or if cooldown hasn't expired
      const isRecentView = lastViewTimestamp && (now - parseInt(lastViewTimestamp, 10) < VIEW_COOLDOWN_MS);

      if (!isRecentView) {
        // Increment and record this distinct view
        const newCount = (isNaN(storedCount) || storedCount <= 0 ? 0 : storedCount) + 1;
        localStorage.setItem(VIEWS_COUNT_KEY, newCount.toString());
        localStorage.setItem(LAST_VIEW_KEY, now.toString());
        setViewCount(newCount);
      } else if (storedCount > 0) {
        setViewCount(storedCount);
      }
    } catch (e) {
      console.warn('LocalStorage unavailable for view counter', e);
    }
  }, []);

  // Sync with localStorage & Cloud Database (Firestore + Supabase)
  const handleSaveProfile = (updated: BusinessCardProfile) => {
    setProfile(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Persist to Cloud backend in real-time
    saveProfileToCloud(updated).catch((err) => {
      console.warn('Cloud save error:', err);
    });
  };

  const handleResetProfile = () => {
    setProfile(DEFAULT_PROFILE);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }

    // Reset cloud profile to default
    saveProfileToCloud(DEFAULT_PROFILE).catch((err) => {
      console.warn('Cloud reset error:', err);
    });
  };

  const handleOpenEdit = () => {
    if (isAdminAuthenticated) {
      setIsEditModalOpen(true);
    } else {
      setIsPasswordModalOpen(true);
    }
  };

  const handlePasswordSuccess = () => {
    setIsAdminAuthenticated(true);
    try {
      sessionStorage.setItem('kongo_admin_authenticated', 'true');
    } catch {
      // ignore
    }
    setIsPasswordModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleLockAdmin = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('kongo_admin_authenticated');
    } catch {
      // ignore
    }
    setIsEditModalOpen(false);
  };

  const handleCopyCardUrl = () => {
    const cardUrl = getDigitalCardUrl();
    navigator.clipboard.writeText(cardUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 pb-20">
      {/* Background radial glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full"></div>
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-teal-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8 space-y-6">
        {/* Top Header / Bar */}
        <header className="flex items-center justify-between py-2 border-b border-slate-900 pb-4">
          <div className="flex items-center gap-3">
            <KongoLogo variant="emblem" size="md" src={profile.emblemUrl} />
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-white tracking-wide uppercase">
                {profile.company}
              </div>
              <div className="text-[10px] text-emerald-400 font-medium">
                Digital Marketing & Content Creation
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Real-time Cloud Sync Badge */}
            <div
              id="cloud-realtime-badge"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-xs shadow-sm"
              title={
                syncStatus?.isConnected
                  ? 'Synchronisation cloud en temps réel active (Modifications et médias diffusés en direct)'
                  : 'Connexion cloud active'
              }
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-emerald-400 font-medium hidden xs:inline">En direct</span>
            </div>

            {/* View Counter Badge */}
            <div
              id="card-view-counter-header"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-xs shadow-sm"
              title={`Cette carte digitale a été consultée ${viewCount} fois`}
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-bold text-white tracking-tight">{viewCount.toLocaleString('fr-FR')}</span>
              <span className="text-[10px] text-slate-400 hidden xs:inline">{viewCount > 1 ? 'vues' : 'vue'}</span>
            </div>

            <button
              id="share-header-btn"
              type="button"
              onClick={handleCopyCardUrl}
              title="Partager le lien de la carte"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400 font-medium hidden sm:inline">Copié</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-300" />
                  <span className="text-[11px] hidden sm:inline">Partager</span>
                </>
              )}
            </button>

            <button
              id="customize-header-btn"
              type="button"
              onClick={handleOpenEdit}
              title={isAdminAuthenticated ? "Modifier les coordonnées (Session administrateur active)" : "Espace d'administration (Protégé par mot de passe)"}
              className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1.5 ${
                isAdminAuthenticated
                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-300 shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {isAdminAuthenticated ? (
                <Settings2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="text-[11px] hidden sm:inline">
                {isAdminAuthenticated ? 'Modifier' : 'Admin'}
              </span>
            </button>
          </div>
        </header>

        {/* ================= PHYSICAL NFC CARD SIMULATOR ================= */}
        <section id="card-section" aria-label="Carte de visite interactive">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Carte Connectée Kongo Wave</span>
            </span>
            <div className="flex items-center gap-2 text-[11px]">
              <span
                id="card-view-counter-badge"
                className="text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 shadow-sm"
                title={`Cette carte digitale a été consultée ${viewCount} fois au total`}
              >
                <Eye className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{viewCount.toLocaleString('fr-FR')} {viewCount > 1 ? 'consultations' : 'consultation'}</span>
              </span>
              <span className="text-slate-700 hidden sm:inline">•</span>
              <span className="text-slate-400 font-medium hidden sm:inline">
                Tap 3D pour retourner
              </span>
            </div>
          </div>

          <div key={cardUrlVersion}>
            <PhysicalCardPreview
              profile={profile}
              onOpenQr={() => setIsQrModalOpen(true)}
              onOpenPhoto={() => setIsPhotoModalOpen(true)}
              viewCount={viewCount}
            />
          </div>
        </section>

        {/* ================= PRIMARY ACTION BUTTONS ================= */}
        <section id="actions-section" aria-label="Actions rapides">
          <ActionButtons
            profile={profile}
            onOpenQr={() => setIsQrModalOpen(true)}
          />
        </section>

        {/* Navigation Filter Tabs */}
        <div className="flex items-center justify-center p-1 rounded-2xl bg-slate-900/90 border border-slate-800/80 text-xs gap-0.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex-1 min-w-[70px] py-2 px-2 rounded-xl font-medium transition-all text-center ${
              activeTab === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Aperçu
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('videos')}
            className={`flex-1 min-w-[75px] py-2 px-2 rounded-xl font-medium transition-all text-center flex items-center justify-center gap-1 ${
              activeTab === 'videos'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Vidéos</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('links')}
            className={`flex-1 min-w-[65px] py-2 px-2 rounded-xl font-medium transition-all text-center ${
              activeTab === 'links'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Liens
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gps')}
            className={`flex-1 min-w-[60px] py-2 px-2 rounded-xl font-medium transition-all text-center ${
              activeTab === 'gps'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            GPS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`flex-1 min-w-[65px] py-2 px-2 rounded-xl font-medium transition-all text-center ${
              activeTab === 'about'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Profil
          </button>
        </div>

        {/* ================= CONTENT SECTIONS BASED ON TAB ================= */}
        {(activeTab === 'all' || activeTab === 'videos') && (
          <section id="videos-section" aria-label="Réalisations audiovisuelles">
            <VideoShowcaseSection
              profile={profile}
              onPlayVideo={(v) => {
                setSelectedVideo(v);
                setIsVideoModalOpen(true);
              }}
              onOpenAdmin={handleOpenEdit}
            />
          </section>
        )}

        {(activeTab === 'all' || activeTab === 'links') && (
          <section aria-label="Présence en ligne">
            <OnlinePresenceSection profile={profile} />
          </section>
        )}

        {(activeTab === 'all' || activeTab === 'gps') && (
          <section id="location-section" aria-label="Localisation géographique">
            <GpsLocationSection profile={profile} />
          </section>
        )}

        {(activeTab === 'all' || activeTab === 'about') && (
          <section id="about-section" aria-label="Présentation et expertises">
            <AboutSection profile={profile} onOpenPhoto={() => setIsPhotoModalOpen(true)} />
          </section>
        )}

        {/* Quick NFC / Direct Access Footer info */}
        <footer className="pt-6 border-t border-slate-900 text-center space-y-3">
          <div className="flex justify-center">
            <KongoLogo variant="badge" size="md" src={profile.logoUrl} />
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Carte de visite intelligente • Compatible NFC & QR Code</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {profile.name} • {profile.title} • {profile.company}
          </p>
          <p className="text-[10px] text-slate-400">
            Pointe-Noire, République du Congo
          </p>
        </footer>
      </div>

      {/* ================= MODALS ================= */}
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={handlePasswordSuccess}
      />

      <QrCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        profile={profile}
        onUrlChange={() => setCardUrlVersion((v) => v + 1)}
      />

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onSave={handleSaveProfile}
        onReset={handleResetProfile}
        onLock={handleLockAdmin}
        syncStatus={syncStatus}
      />

      <PhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        profile={profile}
      />

      <VideoPlayerModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        video={selectedVideo}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />
    </div>
  );
}
