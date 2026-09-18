import { useEffect, useRef, useState, ChangeEvent } from 'react';
import { 
  X, 
  Film, 
  Play, 
  ExternalLink, 
  MessageSquare, 
  Sparkles, 
  Building2, 
  Clock, 
  ShieldCheck,
  AlertCircle,
  Upload,
  Loader2,
  Link2,
  Smartphone,
  CheckCircle2,
  Maximize2,
  RefreshCw
} from 'lucide-react';
import { ShowcaseVideo, BusinessCardProfile } from '../types';
import { uploadVideoToSupabase } from '../utils/supabaseStorage';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: ShowcaseVideo | null;
  profile: BusinessCardProfile;
  onSaveProfile?: (updatedProfile: BusinessCardProfile) => void;
}

export function VideoPlayerModal({ 
  isOpen, 
  onClose, 
  video, 
  profile,
  onSaveProfile 
}: VideoPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeVideo, setActiveVideo] = useState<ShowcaseVideo | null>(video);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  // Sync activeVideo with incoming prop
  useEffect(() => {
    setActiveVideo(video);
    setHasPlaybackError(false);
    setUploadError(null);
    setUploadStatus(null);
    setShowUrlInput(false);
    setManualUrl(video?.videoUrl || '');
  }, [video, isOpen]);

  useEffect(() => {
    if (isOpen && videoRef.current && !hasPlaybackError) {
      videoRef.current.play().catch(() => {
        // Autoplay may be blocked by mobile browser policy without user gesture
      });
    } else if (!isOpen && videoRef.current) {
      videoRef.current.pause();
    }
  }, [isOpen, activeVideo, hasPlaybackError]);

  if (!isOpen || !activeVideo) return null;

  const currentUrl = activeVideo.videoUrl || '';
  // Check if current URL is a local blob (which cannot be read by another device like a mobile phone)
  const isLocalBlob = currentUrl.startsWith('blob:');

  // Check if the URL is a YouTube/Vimeo/Google Drive embed
  const isYouTube = currentUrl.includes('youtube.com') || currentUrl.includes('youtu.be');
  const isVimeo = currentUrl.includes('vimeo.com');
  const isGoogleDrive = currentUrl.includes('drive.google.com');

  const getYouTubeEmbedUrl = (url: string) => {
    let ytId = '';
    if (url.includes('youtu.be/')) {
      ytId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('watch?v=')) {
      ytId = url.split('watch?v=')[1]?.split('&')[0] || '';
    } else if (url.includes('embed/')) {
      return url;
    }
    return `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;
  };

  const getGoogleDriveEmbedUrl = (url: string) => {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return url;
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    const el = videoRef.current as any;
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.webkitEnterFullscreen) {
      el.webkitEnterFullscreen(); // iOS Safari native player
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
  };

  const handleContactWhatsApp = () => {
    const text = encodeURIComponent(
      `Bonjour Ange, j'ai visionné votre réalisation vidéo "${activeVideo.title}" sur votre carte digitale. J'aimerais échanger avec vous sur un projet de production audiovisuelle pour notre entreprise.`
    );
    window.open(`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}?text=${text}`, '_blank');
  };

  // Handle direct upload from mobile / browser
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadStatus('Téléversement vers votre Cloud Supabase Storage en cours...');

    try {
      const videoId = (activeVideo.id === 'video-1' ? 'video-1' : 'video-2') as 'video-1' | 'video-2';
      const res = await uploadVideoToSupabase(videoId, file, (p) => {
        if (p.message) setUploadStatus(p.message);
      });

      if (res.success && res.url) {
        const updatedVideo: ShowcaseVideo = {
          ...activeVideo,
          videoUrl: res.url,
          title: activeVideo.title && activeVideo.title !== 'Deuxième Réalisation Vidéo (À configurer)'
            ? activeVideo.title
            : file.name.replace(/\.[^/.]+$/, ''),
        };

        setActiveVideo(updatedVideo);
        setHasPlaybackError(false);
        setUploadStatus('Vidéo synchronisée avec succès sur le Cloud Supabase !');

        if (onSaveProfile) {
          const list = [...(profile.showcaseVideos || [])];
          const idx = list.findIndex((v) => v.id === videoId);
          if (idx >= 0) list[idx] = updatedVideo;
          else list.push(updatedVideo);
          onSaveProfile({ ...profile, showcaseVideos: list });
        }
      } else {
        setUploadError(res.error || 'Échec du téléversement vers le Cloud Supabase.');
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Une erreur est survenue lors de l\'envoi.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle manual URL update (YouTube, Google Drive, direct MP4)
  const handleSaveManualUrl = () => {
    if (!manualUrl.trim()) return;
    const videoId = activeVideo.id;
    const updatedVideo: ShowcaseVideo = {
      ...activeVideo,
      videoUrl: manualUrl.trim(),
    };

    setActiveVideo(updatedVideo);
    setHasPlaybackError(false);
    setShowUrlInput(false);

    if (onSaveProfile) {
      const list = [...(profile.showcaseVideos || [])];
      const idx = list.findIndex((v) => v.id === videoId);
      if (idx >= 0) list[idx] = updatedVideo;
      else list.push(updatedVideo);
      onSaveProfile({ ...profile, showcaseVideos: list });
    }
  };

  const shouldShowRescueFallback = hasPlaybackError || (isLocalBlob && typeof window !== 'undefined');

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
                {activeVideo.title}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                {activeVideo.client || profile.company} • {activeVideo.category}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {!shouldShowRescueFallback && !isYouTube && !isVimeo && !isGoogleDrive && (
              <button
                onClick={handleFullscreen}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                title="Plein écran"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Fermer la vidéo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="relative w-full bg-black aspect-video flex items-center justify-center overflow-hidden">
          {shouldShowRescueFallback ? (
            /* ================= RESCUE FALLBACK FOR MOBILE PLAYBACK ================= */
            <div className="w-full h-full p-5 sm:p-8 flex flex-col items-center justify-center text-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200 space-y-3.5 overflow-y-auto">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div className="max-w-md space-y-1">
                <h4 className="text-sm sm:text-base font-bold text-white flex items-center justify-center gap-1.5">
                  <span>Synchronisation Cloud requise pour smartphone</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isLocalBlob
                    ? 'Cette vidéo a été importée sur un ordinateur sous forme locale temporaire (blob:). Pour être lue en continu sur votre smartphone, elle doit être hébergée sur votre serveur Cloud Supabase ou via un lien direct.'
                    : 'Le flux vidéo n\'a pas pu être chargé sur cet appareil. Vous pouvez la réimporter directement depuis ce téléphone ou utiliser un lien vidéo.'}
                </p>
              </div>

              {uploadStatus && (
                <div className="px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
                  <span>{uploadStatus}</span>
                </div>
              )}

              {uploadError && (
                <div className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs max-w-sm">
                  {uploadError}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="video/mp4,video/quicktime,video/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Téléversement en cours...</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4" />
                      <span>Téléverser depuis ce smartphone</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Link2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Coller un lien vidéo (YouTube / Drive)</span>
                </button>
              </div>

              {showUrlInput && (
                <div className="w-full max-w-md pt-2 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={manualUrl}
                      onChange={(e) => setManualUrl(e.target.value)}
                      placeholder="https://youtu.be/... ou https://drive.google.com/..."
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleSaveManualUrl}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0"
                    >
                      Enregistrer
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 text-left">
                    Compatible avec YouTube, Vimeo, Google Drive public et liens directs MP4.
                  </p>
                </div>
              )}
            </div>
          ) : isYouTube ? (
            <iframe
              src={getYouTubeEmbedUrl(currentUrl)}
              title={activeVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : isVimeo ? (
            <iframe
              src={currentUrl}
              title={activeVideo.title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : isGoogleDrive ? (
            <iframe
              src={getGoogleDriveEmbedUrl(currentUrl)}
              title={activeVideo.title}
              allow="autoplay"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <video
              ref={videoRef}
              key={currentUrl}
              src={currentUrl}
              poster={activeVideo.posterUrl}
              controls
              playsInline
              webkit-playsinline="true"
              x5-playsinline="true"
              preload="metadata"
              controlsList="nodownload"
              className="w-full h-full object-contain max-h-[60vh]"
              onError={(e) => {
                console.warn('Video playback error encountered:', e);
                setHasPlaybackError(true);
              }}
              onCanPlay={() => {
                setHasPlaybackError(false);
              }}
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
                <span>{activeVideo.category}</span>
              </span>
              {activeVideo.duration && (
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Durée : {activeVideo.duration}</span>
                </span>
              )}
              {activeVideo.client && (
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-emerald-400" />
                  <span>Client : {activeVideo.client}</span>
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

          {activeVideo.subtitle && (
            <p className="text-xs sm:text-sm font-semibold text-emerald-400">
              {activeVideo.subtitle}
            </p>
          )}

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {activeVideo.description}
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
