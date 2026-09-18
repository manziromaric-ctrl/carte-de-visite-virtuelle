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
import { BusinessCardProfile } from './types';
import { DEFAULT_PROFILE } from './data/defaultProfile';
import { PhysicalCardPreview } from './components/PhysicalCardPreview';
import { ActionButtons } from './components/ActionButtons';
import { OnlinePresenceSection } from './components/OnlinePresenceSection';
import { GpsLocationSection } from './components/GpsLocationSection';
import { AboutSection } from './components/AboutSection';
import { QrCodeModal } from './components/QrCodeModal';
import { EditProfileModal } from './components/EditProfileModal';
import { PasswordModal } from './components/PasswordModal';
import { PhotoModal } from './components/PhotoModal';
import { KongoLogo } from './components/KongoLogo';
import { downloadVCard } from './utils/vcard';
import { getDigitalCardUrl } from './utils/cardUrl';

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
  const [activeTab, setActiveTab] = useState<'all' | 'links' | 'gps' | 'about'>('all');
  const [cardUrlVersion, setCardUrlVersion] = useState(0);

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

  // Sync with localStorage
  const handleSaveProfile = (updated: BusinessCardProfile) => {
    setProfile(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleResetProfile = () => {
    setProfile(DEFAULT_PROFILE);
    localStorage.removeItem(STORAGE_KEY);
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
        <div className="flex items-center justify-center p-1 rounded-2xl bg-slate-900/90 border border-slate-800/80 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 px-3 rounded-xl font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vue d'ensemble
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('links')}
            className={`flex-1 py-2 px-3 rounded-xl font-medium transition-all ${
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
            className={`flex-1 py-2 px-3 rounded-xl font-medium transition-all ${
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
            className={`flex-1 py-2 px-3 rounded-xl font-medium transition-all ${
              activeTab === 'about'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Profil
          </button>
        </div>

        {/* ================= CONTENT SECTIONS BASED ON TAB ================= */}
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
      />

      <PhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        profile={profile}
      />
    </div>
  );
}
