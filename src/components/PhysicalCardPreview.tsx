import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { RotateCw, ShieldCheck, Sparkles, MapPin, Phone, Mail, Globe, ExternalLink, QrCode, Eye, Maximize2 } from 'lucide-react';
import { BusinessCardProfile } from '../types';
import { getDigitalCardUrl } from '../utils/cardUrl';
import { KongoLogo } from './KongoLogo';

interface PhysicalCardPreviewProps {
  profile: BusinessCardProfile;
  onOpenQr: () => void;
  onOpenPhoto?: () => void;
  viewCount?: number;
}

export function PhysicalCardPreview({ profile, onOpenQr, onOpenPhoto, viewCount }: PhysicalCardPreviewProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardQrUrl, setCardQrUrl] = useState('');
  const [targetCardUrl, setTargetCardUrl] = useState('');

  useEffect(() => {
    // Generate high-clarity QR code that points directly to this digital card's public URL
    const publicUrl = getDigitalCardUrl();
    setTargetCardUrl(publicUrl);

    QRCode.toDataURL(publicUrl, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#022c22', // deep emerald contrast
        light: '#ffffff',
      },
    })
      .then((url) => setCardQrUrl(url))
      .catch((err) => console.error('Error generating card QR:', err));
  }, [profile]);

  return (
    <div className="w-full max-w-md mx-auto perspective-1000">
      {/* Interactive Card */}
      <div
        className={`relative w-full aspect-[1.7/1] sm:aspect-[1.75/1] rounded-3xl transition-transform duration-700 preserve-3d cursor-pointer select-none shadow-2xl shadow-emerald-950/50 ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* ================= RECTO (FRONT) ================= */}
        <div className="absolute inset-0 w-full h-full rounded-3xl p-5 sm:p-7 backface-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 border border-emerald-500/30 flex flex-col justify-between overflow-hidden">
          {/* Subtle decorative geometric watermarks */}
          <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none"></div>
          <div className="absolute -left-12 -bottom-12 w-44 h-44 rounded-full bg-teal-500/10 blur-2xl pointer-events-none"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#10b98115_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

          {/* Top Row: Company Logo & NFC Icon */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KongoLogo variant="emblem" size="sm" />
              <div>
                <span className="font-extrabold text-xs sm:text-sm tracking-wide text-white uppercase font-sans">
                  {profile.company}
                </span>
                <span className="block text-[9px] tracking-wider text-emerald-400 font-medium">
                  DIGITAL MARKETING & CONTENT
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                NFC / SMART
              </span>
              <div className="w-7 h-7 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
                <RotateCw className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Middle: Profile Identification with Enlarged Avatar / Portrait */}
          <div className="relative z-10 my-auto py-1 flex items-center gap-3.5 sm:gap-4">
            {profile.avatarUrl ? (
              <div 
                className="relative shrink-0 group/avatar cursor-pointer"
                onClick={(e) => {
                  if (onOpenPhoto) {
                    e.stopPropagation();
                    onOpenPhoto();
                  }
                }}
                title="Cliquer pour voir la photo en grand"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-xl shadow-emerald-950/80 bg-slate-900 ring-4 ring-emerald-500/20 relative transition-transform group-hover/avatar:scale-105">
                  <img
                    src={profile.avatarUrl}
                    alt={`Portrait professionnel de ${profile.name}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback gracefully if image URL is broken
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Zoom hint on hover */}
                  <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
                    <Maximize2 className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <div 
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-slate-950 shadow-sm" 
                  title="Profil vérifié"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                </div>
              </div>
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/30 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-base sm:text-lg shadow-md shrink-0">
                {profile.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                  {profile.name}
                </h2>
                {!profile.avatarUrl && <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />}
              </div>
              <p className="text-xs sm:text-sm font-semibold text-emerald-300 mt-0.5 truncate">
                {profile.title}
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-300 line-clamp-2 mt-1 leading-snug font-normal opacity-90">
                {profile.tagline}
              </p>
            </div>
          </div>

          {/* Bottom: Contact Pill Preview */}
          <div className="relative z-10 flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate max-w-[150px] sm:max-w-[200px]">{profile.location.city}, {profile.location.country}</span>
            </div>

            <div className="flex items-center gap-1 text-emerald-400 font-medium text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span>Cliquer pour tourner</span>
              <RotateCw className="w-2.5 h-2.5" />
            </div>
          </div>
        </div>

        {/* ================= VERSO (BACK) ================= */}
        <div className="absolute inset-0 w-full h-full rounded-3xl p-6 sm:p-7 rotate-y-180 backface-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/40 flex flex-col justify-between overflow-hidden">
          <div className="absolute -left-10 -top-10 w-36 h-36 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none"></div>

          {/* Top row */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <KongoLogo variant="emblem" size="xs" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5" />
                Scan Instantané
              </span>
            </div>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>Verso</span>
              <RotateCw className="w-3 h-3 text-slate-500" />
            </span>
          </div>

          {/* Content: QR and details */}
          <div className="flex items-center gap-4 sm:gap-5 my-auto relative z-10">
            {/* Direct miniature QR - click to zoom */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onOpenQr();
              }}
              title="Cliquer pour agrandir le QR Code"
              className="relative group/qr w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white p-1.5 sm:p-2 shrink-0 shadow-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
            >
              {cardQrUrl ? (
                <img
                  src={cardQrUrl}
                  alt={`QR Code vers la carte de ${profile.name}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-[10px] text-slate-500">QR Code</div>
              )}
              <div className="absolute inset-0 bg-slate-950/70 rounded-2xl opacity-0 group-hover/qr:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity text-white text-[10px] font-semibold">
                <Maximize2 className="w-4 h-4 text-emerald-400" />
                <span>Agrandir</span>
              </div>
            </div>

            <div className="space-y-1.5 min-w-0 flex-1 text-xs">
              <div className="text-slate-100 font-bold text-sm truncate">
                {profile.company}
              </div>
              <div className="text-[11px] text-slate-300 flex items-center gap-1.5 truncate">
                <Globe className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">{targetCardUrl ? new URL(targetCardUrl).hostname : 'kongodigitalwave.netlify.app'}</span>
              </div>
              <div className="text-[11px] text-slate-300 flex items-center gap-1.5 truncate">
                <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">GPS: {profile.location.latitude.toFixed(4)}, {profile.location.longitude.toFixed(4)}</span>
              </div>
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenQr();
                  }}
                  className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25 px-2 py-0.5 rounded-full font-medium transition-colors border border-emerald-500/30"
                >
                  <QrCode className="w-3 h-3" />
                  <span>Ouvrir sur mobile</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-400 relative z-10">
            <span>Tapez pour revenir au recto</span>
            {viewCount !== undefined ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <Eye className="w-3 h-3 text-emerald-400" />
                <span>{viewCount} {viewCount > 1 ? 'vues' : 'vue'}</span>
              </span>
            ) : (
              <span className="text-emerald-400 font-mono">share.google/zLH09B7lbmuFmabrn</span>
            )}
          </div>
        </div>
      </div>

      {/* Helpful Hint beneath card */}
      <div className="flex items-center justify-center gap-3 mt-3 text-xs text-slate-400">
        <button
          type="button"
          onClick={() => setIsFlipped(!isFlipped)}
          className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>{isFlipped ? 'Afficher le recto' : 'Retourner la carte (verso)'}</span>
        </button>
        <span>•</span>
        <button
          type="button"
          onClick={onOpenQr}
          className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Agrandir le QR Code</span>
        </button>
      </div>
    </div>
  );
}
