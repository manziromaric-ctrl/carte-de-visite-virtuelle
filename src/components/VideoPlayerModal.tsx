import { useEffect, useRef } from 'react';
import { X, Film, Play, ExternalLink, MessageSquare, Sparkles, Building2, Clock, ShieldCheck } from 'lucide-react';
import { ShowcaseVideo, BusinessCardProfile } from '../types';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: ShowcaseVideo | null;
  profile: BusinessCardProfile;
}

export function VideoPlayerModal({ isOpen, onClose, video, profile }: VideoPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay may be blocked by browser policy without user gesture
      });
    } else if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen, video]);

  if (!isOpen || !video) return null;

  // Check if the URL is a YouTube/Vimeo embed
  const isYouTube = video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be');
  const isVimeo = video.videoUrl.includes('vimeo.com');

  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1]?.split('&')[0] || '';
    } else if (url.includes('embed/')) {
      return url;
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  };

  const handleContactWhatsApp = () => {
    const text = encodeURIComponent(
      `Bonjour Ange, j'ai visionné votre réalisation vidéo "${video.title}" sur votre carte digitale. J'aimerais échanger avec vous sur un projet de production audiovisuelle pour notre entreprise.`
    );
    window.open(`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <Film className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                {video.title}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                {video.client || profile.company} • {video.category}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0 ml-2"
            aria-label="Fermer la vidéo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="relative w-full bg-black aspect-video flex items-center justify-center overflow-hidden">
          {isYouTube ? (
            <iframe
              src={getYouTubeEmbedUrl(video.videoUrl)}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : isVimeo ? (
            <iframe
              src={video.videoUrl}
              title={video.title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <video
              ref={videoRef}
              src={video.videoUrl}
              poster={video.posterUrl}
              controls
              playsInline
              controlsList="nodownload"
              className="w-full h-full object-contain max-h-[60vh]"
            >
              Votre navigateur ne supporte pas la lecture de cette vidéo.
            </video>
          )}
        </div>

        {/* Video Details & Call to Action Footer */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-900/95 border-t border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{video.category}</span>
              </span>
              {video.duration && (
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Durée : {video.duration}</span>
                </span>
              )}
              {video.client && (
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-emerald-400" />
                  <span>Client : {video.client}</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleContactWhatsApp}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all ml-auto"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Contacter pour un projet similaire</span>
            </button>
          </div>

          {video.subtitle && (
            <p className="text-xs sm:text-sm font-semibold text-emerald-400">
              {video.subtitle}
            </p>
          )}

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {video.description}
          </p>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Réalisation officielle certifiée • Kongo Digital Wave</span>
            </div>
            <span>Pointe-Noire, Congo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
