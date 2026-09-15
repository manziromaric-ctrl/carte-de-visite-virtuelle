import { useState } from 'react';
import { 
  UserPlus, 
  QrCode, 
  Phone, 
  Mail, 
  Globe, 
  Linkedin, 
  Navigation, 
  Check, 
  Share2,
  MessageSquare
} from 'lucide-react';
import { BusinessCardProfile } from '../types';
import { downloadVCard } from '../utils/vcard';

interface ActionButtonsProps {
  profile: BusinessCardProfile;
  onOpenQr: () => void;
}

export function ActionButtons({ profile, onOpenQr }: ActionButtonsProps) {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadContact = () => {
    downloadVCard(profile);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const scrollToLocation = () => {
    const el = document.getElementById('location-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Primary Key Action Bar: Save Contact & QR Share */}
      <div className="grid grid-cols-2 gap-3">
        <button
          id="save-vcard-btn"
          type="button"
          onClick={handleDownloadContact}
          className="relative group flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all duration-200 active:scale-95"
        >
          {downloaded ? (
            <>
              <Check className="w-5 h-5 text-slate-950" />
              <span>Contact Enregistré !</span>
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5 text-slate-950 transition-transform group-hover:scale-110" />
              <span>Enregistrer Contact</span>
            </>
          )}
        </button>

        <button
          id="open-qr-code-btn"
          type="button"
          onClick={onOpenQr}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-850 text-white font-bold text-sm border border-emerald-500/40 shadow-lg shadow-black/40 transition-all duration-200 hover:border-emerald-400 active:scale-95"
        >
          <QrCode className="w-5 h-5 text-emerald-400" />
          <span>Code QR</span>
        </button>
      </div>

      {/* Quick Direct Communication Grid */}
      <div className="grid grid-cols-4 gap-2.5">
        {/* Call */}
        <a
          id="quick-call-btn"
          href={`tel:${profile.phone.replace(/\s+/g, '')}`}
          className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 transition-all hover:scale-[1.03] active:scale-95 text-center"
          title={`Appeler ${profile.name}`}
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <Phone className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium">Appel</span>
        </a>

        {/* WhatsApp */}
        <a
          id="quick-whatsapp-btn"
          href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}?text=Bonjour%20${encodeURIComponent(profile.name)}%2C%20je%20vous%20contacte%20via%20votre%20carte%20de%20visite%20digitale.`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 transition-all hover:scale-[1.03] active:scale-95 text-center"
          title="Discuter sur WhatsApp"
        >
          <div className="w-9 h-9 rounded-xl bg-green-500/15 text-green-400 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium">WhatsApp</span>
        </a>

        {/* Email */}
        <a
          id="quick-email-btn"
          href={`mailto:${profile.email}?subject=Prise%20de%20contact%20-%20Kongo%20Digital%20Wave`}
          className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 transition-all hover:scale-[1.03] active:scale-95 text-center"
          title="Envoyer un email"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium">Email</span>
        </a>

        {/* Localisation */}
        <button
          id="quick-location-scroll-btn"
          type="button"
          onClick={scrollToLocation}
          className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 transition-all hover:scale-[1.03] active:scale-95 text-center"
          title="Voir la localisation GPS"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <Navigation className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-medium">GPS</span>
        </button>
      </div>
    </div>
  );
}
