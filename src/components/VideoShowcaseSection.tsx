import React from 'react';
import { 
  Film, 
  Play, 
  Sparkles, 
  Camera, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  ZoomIn,
  Eye,
  Layers
} from 'lucide-react';
import { BusinessCardProfile, ShowcaseVideo } from '../types';

interface VideoShowcaseSectionProps {
  profile: BusinessCardProfile;
  onPlayVideo: (video: ShowcaseVideo) => void;
  onViewImage?: (imageItem: ShowcaseVideo) => void;
  onOpenAdmin: () => void;
}

export function VideoShowcaseSection({
  profile,
  onPlayVideo,
  onViewImage,
  onOpenAdmin,
}: VideoShowcaseSectionProps) {
  const videos = profile.showcaseVideos || [];
  const video1 = videos.find((v) => v.id === 'video-1') || videos[0];
  const media2 = videos.find((v) => v.id === 'video-2') || videos[1];

  // Check if media2 is an image realization (default or explicit type)
  const isImageRealisation = !media2?.videoUrl || media2?.type === 'image' || Boolean(media2?.imageUrl);
  const media2ImageSrc = (media2?.imageUrl && !media2.imageUrl.includes('kongo_digital_logo') && !media2.imageUrl.includes('manzi_video_poster'))
    ? media2.imageUrl
    : (media2?.posterUrl && !media2.posterUrl.includes('kongo_digital_logo') && !media2.posterUrl.includes('manzi_video_poster')
        ? media2.posterUrl
        : '/kongo_realisation_shoot.jpg');

  const handleMedia2Click = () => {
    if (isImageRealisation && onViewImage && media2) {
      onViewImage(media2);
    } else if (media2 && media2.videoUrl) {
      onPlayVideo(media2);
    } else if (onViewImage && media2) {
      onViewImage(media2);
    }
  };

  return (
    <div id="video-showcase-section" className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
              <span>Nos Réalisations</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                Vidéos & Productions
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Découvrez le savoir-faire Kongo Digital Wave en production audiovisuelle et cinématographique
            </p>
          </div>
        </div>
      </div>

      {/* Media Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* ================= CARD 1 : RÉALISATION VIDÉO (PROJET MANZI CAMP MAB) ================= */}
        {video1 && (
          <div
            onClick={() => onPlayVideo(video1)}
            className="group relative rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-4 sm:p-5 transition-all duration-300 shadow-lg cursor-pointer overflow-hidden"
          >
            {/* Ambient hover glow */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>

            {/* Video Preview Thumbnail Container */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 mb-4 shadow-inner">
              {video1.posterUrl ? (
                <img
                  src={video1.posterUrl}
                  alt={video1.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
                  <Film className="w-10 h-10 text-emerald-400/40" />
                </div>
              )}

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500/90 text-slate-950 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-emerald-400 transition-all duration-300">
                  <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-slate-950 translate-x-0.5" />
                </div>
              </div>

              {/* Top badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur text-emerald-400 border border-emerald-500/30 text-[10px] sm:text-xs font-semibold flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>{video1.category}</span>
                </span>
                {video1.duration && (
                  <span className="px-2 py-0.5 rounded-md bg-black/80 text-white font-mono text-[10px] sm:text-xs font-medium backdrop-blur">
                    {video1.duration}
                  </span>
                )}
              </div>

              {/* Bottom bar inside thumbnail */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                <span className="text-[11px] font-medium text-slate-200 drop-shadow truncate flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{video1.client}</span>
                </span>
                <span className="text-[10px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40 font-medium">
                  Cliquez pour lire le film
                </span>
              </div>
            </div>

            {/* Video Text Content */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-white group-hover:text-emerald-300 transition-colors">
                    {video1.title}
                  </h4>
                  {video1.subtitle && (
                    <p className="text-xs text-emerald-400/90 font-medium mt-0.5">
                      {video1.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {video1.description}
              </p>

              {/* Bottom Quick Action */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Réalisation certifiée Kongo Digital Wave</span>
                </span>
                <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-[11px] font-semibold">
                  <span>Visionner le film</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ================= CARD 2 : RÉALISATION IMAGE (TOURNAGE & PRODUCTION) ================= */}
        {media2 && (
          <div
            onClick={handleMedia2Click}
            className="group relative rounded-3xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 p-4 sm:p-5 transition-all duration-300 shadow-lg cursor-pointer overflow-hidden"
          >
            {/* Ambient hover glow */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-teal-500/20 transition-all"></div>

            {/* Image Preview Container */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 mb-4 shadow-inner">
              <img
                src={media2ImageSrc}
                alt={media2.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"></div>

              {/* Center Zoom / View Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-teal-500/90 text-slate-950 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-teal-400 transition-all duration-300">
                  <ZoomIn className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
                </div>
              </div>

              {/* Top badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur text-teal-400 border border-teal-500/30 text-[10px] sm:text-xs font-semibold flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3 text-teal-400" />
                  <span>{media2.category || 'Production Audiovisuelle & Shooting 4K'}</span>
                </span>
                <span className="px-2.5 py-1 rounded-full bg-black/80 text-white text-[10px] sm:text-xs font-medium backdrop-blur flex items-center gap-1">
                  <Camera className="w-3 h-3 text-teal-400" />
                  <span>Shooting HD</span>
                </span>
              </div>

              {/* Bottom bar inside thumbnail */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                <span className="text-[11px] font-medium text-slate-200 drop-shadow truncate flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{media2.client || profile.company}</span>
                </span>
                <span className="text-[10px] text-teal-300 bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-500/40 font-medium flex items-center gap-1">
                  <Eye className="w-3 h-3 text-teal-400" />
                  <span>Agrandir en HD</span>
                </span>
              </div>
            </div>

            {/* Media Text Content */}
            <div className="space-y-2">
              <h4 className="font-bold text-sm sm:text-base text-white group-hover:text-teal-300 transition-colors">
                {(!media2.title || media2.title.toLowerCase().includes('configurer') || media2.title.includes('Deuxième Réalisation'))
                  ? 'Voici une autre de nos réalisations'
                  : media2.title}
              </h4>
              {media2.subtitle && !media2.subtitle.toLowerCase().includes('prochaine vidéo') && (
                <p className="text-xs text-teal-400/90 font-medium mt-0.5">
                  {media2.subtitle}
                </p>
              )}
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {media2.description || 'Prises de vues cinématographiques et valorisation audiovisuelle d\'impact par les équipes Kongo Digital Wave.'}
              </p>

              {/* Bottom Quick Action */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Réalisation certifiée Kongo Digital Wave</span>
                </span>
                <span className="text-teal-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-[11px] font-semibold">
                  <span>Voir la réalisation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
