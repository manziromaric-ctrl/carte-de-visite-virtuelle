import React, { useState } from 'react';
import { 
   X, 
   ZoomIn, 
   ZoomOut, 
   Download, 
   Share2, 
   Sparkles, 
   Building2, 
   CheckCircle2, 
   ExternalLink,
   Camera,
   Info
 } from 'lucide-react';
import { ShowcaseVideo } from '../types';

interface RealisationImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: ShowcaseVideo | null;
  companyName?: string;
}

export function RealisationImageModal({
  isOpen,
  onClose,
  media,
  companyName = 'Kongo Digital Wave',
}: RealisationImageModalProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!isOpen || !media) return null;

  const imageUrl = media.imageUrl || media.posterUrl || '/kongo_realisation_shoot.jpg';
  const displayTitle = (!media.title || media.title.toLowerCase().includes('configurer') || media.title.includes('Deuxième Réalisation'))
    ? 'Voici une autre de nos réalisations'
    : media.title;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: media.title,
          text: `${media.title} - Réalisation par ${media.client || companyName}`,
          url: window.location.href,
        });
        return;
      } catch (e) {
        // Fallback to copy link
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{media.category || 'Réalisation Kongo Digital Wave'}</span>
              </span>
              <h3 className="text-white font-bold text-sm sm:text-base leading-tight">
                {displayTitle}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsZoomed((prev) => !prev)}
              className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700/60"
              title={isZoomed ? "Réduire l'image" : "Agrandir l'image"}
            >
              {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700/60"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Showcase Display */}
        <div className="relative bg-slate-950 flex items-center justify-center overflow-hidden min-h-[260px] max-h-[65vh]">
          <img
            src={imageUrl}
            alt={media.title}
            className={`w-full h-auto max-h-[65vh] object-contain transition-transform duration-300 select-none ${
              isZoomed ? 'scale-125 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed((prev) => !prev)}
          />

          {/* Watermark badge on image */}
          <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/50 flex items-center gap-1.5 text-xs text-white shadow-lg pointer-events-none">
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-semibold">{media.client || companyName}</span>
          </div>
        </div>

        {/* Details & Actions Footer */}
        <div className="p-5 bg-slate-900 space-y-4">
          {media.subtitle && (
            <p className="text-xs sm:text-sm text-teal-300 font-medium">
              {media.subtitle}
            </p>
          )}

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {media.description}
          </p>

          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Production certifiée {companyName}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-teal-400" />
                <span>{copiedShare ? 'Lien copié !' : 'Partager'}</span>
              </button>

              <a
                href={imageUrl}
                download={`${media.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.jpg`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger HD</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
