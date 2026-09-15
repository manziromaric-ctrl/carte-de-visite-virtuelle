import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Download, 
  Share2, 
  Copy, 
  Check, 
  QrCode as QrIcon, 
  UserCheck, 
  MapPin, 
  Globe, 
  ExternalLink,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { BusinessCardProfile, QrTargetType } from '../types';
import { generateMeCard } from '../utils/vcard';
import { getDigitalCardUrl } from '../utils/cardUrl';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BusinessCardProfile;
}

export function QrCodeModal({ isOpen, onClose, profile }: QrCodeModalProps) {
  const [qrMode, setQrMode] = useState<QrTargetType>('card_url');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Compute what string the QR code encodes based on active mode
  const getEncodedPayload = (): string => {
    switch (qrMode) {
      case 'vcard_contact':
        return generateMeCard(profile);
      case 'google_maps_location':
        return profile.googleMapsShareUrl;
      case 'card_url':
      default:
        return getDigitalCardUrl();
    }
  };

  const payload = getEncodedPayload();

  useEffect(() => {
    if (!isOpen) return;

    // High error-correction level 'H' (30% redundancy) ensures immediate detection by any mobile camera
    QRCode.toDataURL(payload, {
      width: 480,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#022c22', // deep emerald forest
        light: '#ffffff',
      },
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Error generating QR Code', err);
      });
  }, [isOpen, qrMode, profile, payload]);

  if (!isOpen) return null;

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    const modeLabel =
      qrMode === 'vcard_contact'
        ? 'Contact'
        : qrMode === 'google_maps_location'
        ? 'Localisation'
        : 'Carte_Digitale';
    link.download = `QRCode_${profile.name.replace(/\s+/g, '_')}_${modeLabel}.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Carte de visite - ${profile.name} (${profile.company})`,
          text: `Consultez la carte de visite numérique d'${profile.name} :`,
          url: payload,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch {
        // User cancelled or share not supported
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient background glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <QrIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Scanner avec votre Téléphone</h3>
              <p className="text-xs text-slate-400">Ouvre directement la carte sur votre smartphone</p>
            </div>
          </div>

          <button
            id="close-qr-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="mt-4 grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
          <button
            id="qr-mode-card-btn"
            type="button"
            onClick={() => setQrMode('card_url')}
            className={`py-2 px-2 rounded-xl flex flex-col items-center gap-1 font-medium transition-all ${
              qrMode === 'card_url'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="text-[11px] truncate">Cette Carte Web</span>
          </button>

          <button
            id="qr-mode-contact-btn"
            type="button"
            onClick={() => setQrMode('vcard_contact')}
            className={`py-2 px-2 rounded-xl flex flex-col items-center gap-1 font-medium transition-all ${
              qrMode === 'vcard_contact'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="text-[11px] truncate">Fiche Contact</span>
          </button>

          <button
            id="qr-mode-location-btn"
            type="button"
            onClick={() => setQrMode('google_maps_location')}
            className={`py-2 px-2 rounded-xl flex flex-col items-center gap-1 font-medium transition-all ${
              qrMode === 'google_maps_location'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-[11px] truncate">Lieu GPS</span>
          </button>
        </div>

        {/* Mobile Instruction Notice */}
        <div className="mt-3 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {qrMode === 'card_url'
              ? 'Pointez l\'appareil photo de votre smartphone pour ouvrir la carte.'
              : qrMode === 'vcard_contact'
              ? 'Scannez pour ajouter Ange Elenga directement dans vos contacts.'
              : 'Scannez pour ouvrir l\'itinéraire sur Google Maps.'}
          </span>
        </div>

        {/* QR Code Presentation Box */}
        <div className="mt-4 flex flex-col items-center">
          <div className="relative p-3 sm:p-4 bg-white rounded-2xl shadow-2xl shadow-emerald-950/50 border-4 border-emerald-500/30">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Code QR de la carte de visite"
                className="w-52 h-52 sm:w-56 sm:h-56 rounded-lg object-contain block"
              />
            ) : (
              <div className="w-52 h-52 sm:w-56 sm:h-56 flex items-center justify-center text-slate-400 text-xs">
                Génération du QR code...
              </div>
            )}
          </div>

          {/* Active target link preview box */}
          <div className="mt-3.5 w-full bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-left space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>Lien encodé :</span>
              {qrMode === 'card_url' && (
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Redirection active
                </span>
              )}
            </div>

            <div className="font-mono text-xs text-slate-200 truncate select-all py-0.5">
              {payload}
            </div>

            {qrMode !== 'vcard_contact' && (
              <div className="pt-1 flex items-center justify-between">
                <a
                  href={payload}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold hover:underline"
                >
                  <span>Tester le lien dans un nouvel onglet</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="text-[11px] text-slate-400 hover:text-white transition-colors"
                >
                  {copied ? '✓ Copié !' : 'Copier'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            id="download-qr-image-btn"
            type="button"
            onClick={handleDownloadQr}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-100 font-medium text-xs border border-slate-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Télécharger l'image QR</span>
          </button>

          <button
            id="share-native-btn"
            type="button"
            onClick={handleNativeShare}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-950/40 transition-colors"
          >
            {shareSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Partagé !</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Partager l'URL</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
