import { useState } from 'react';
import { 
  Film, 
  Play, 
  Sparkles, 
  Clock, 
  Building2, 
  Upload, 
  ArrowRight, 
  CheckCircle2, 
  Video, 
  Lock,
  Eye
} from 'lucide-react';
import { BusinessCardProfile, ShowcaseVideo } from '../types';

interface VideoShowcaseSectionProps {
  profile: BusinessCardProfile;
  onPlayVideo: (video: ShowcaseVideo) => void;
  onOpenAdmin: () => void;
}

export function VideoShowcaseSection({
  profile,
  onPlayVideo,
  onOpenAdmin,
}: VideoShowcaseSectionProps) {
  const videos = profile.showcaseVideos || [];
  const video1 = videos.find((v) => v.id === 'video-1') || videos[0];
  const video2 = videos.find((v) => v.id === 'video-2') || videos[1];

  const hasVideo2 = Boolean(video2 && video2.videoUrl && video2.videoUrl.trim().length > 0);

  return (
    <div id="video-showcase-section" className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
              <span>Réalisations Vidéo</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                Preuves de Production
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Découvrez ce que Kongo Digital Wave est capable de produire pour vous
            </p>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* ================= VIDEO 1 : MANZI CAMP MAB (DEFAULT / CONFIGURED) ================= */}
        {video1 && (
          <div
            onClick={() => onPlayVideo(video1)}
            className="group relative rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-4 sm:p-5 transition-all duration-300 shadow-lg cursor-pointer overflow-hidden"
          >
            {/* Ambient hover glow */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>

            {/* Video Preview Thumbnail / Canvas Container */}
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
                  Cliquez pour lire
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
                  <span>Visionner la vidéo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIDEO 2 : ACTIVE OR INVITATION TO UPLOAD ================= */}
        {hasVideo2 && video2 ? (
          <div
            onClick={() => onPlayVideo(video2)}
            className="group relative rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-4 sm:p-5 transition-all duration-300 shadow-lg cursor-pointer overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-teal-500/20 transition-all"></div>

            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/80 mb-4 shadow-inner">
              {video2.posterUrl ? (
                <img
                  src={video2.posterUrl}
                  alt={video2.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
                  <Film className="w-10 h-10 text-teal-400/40" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-teal-500/90 text-slate-950 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-teal-400 transition-all duration-300">
                  <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-slate-950 translate-x-0.5" />
                </div>
              </div>

              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur text-teal-400 border border-teal-500/30 text-[10px] sm:text-xs font-semibold flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3 text-teal-400" />
                  <span>{video2.category}</span>
                </span>
                {video2.duration && video2.duration !== 'En attente' && (
                  <span className="px-2 py-0.5 rounded-md bg-black/80 text-white font-mono text-[10px] sm:text-xs font-medium backdrop-blur">
                    {video2.duration}
                  </span>
                )}
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                <span className="text-[11px] font-medium text-slate-200 drop-shadow truncate flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{video2.client || profile.company}</span>
                </span>
                <span className="text-[10px] text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded-full border border-teal-500/40 font-medium">
                  Cliquez pour lire
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-sm sm:text-base text-white group-hover:text-teal-300 transition-colors">
                {video2.title}
              </h4>
              {video2.subtitle && (
                <p className="text-xs text-teal-400/90 font-medium mt-0.5">
                  {video2.subtitle}
                </p>
              )}
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {video2.description}
              </p>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                  <span>Réalisation certifiée Kongo Digital Wave</span>
                </span>
                <span className="text-teal-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-[11px] font-semibold">
                  <span>Visionner la vidéo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* ================= PLACEHOLDER POUR LA 2ÈME VIDÉO (À TÉLÉVERSER PAR L'UTILISATEUR) ================= */
          <div className="relative rounded-3xl bg-slate-900/60 border-2 border-dashed border-slate-800 hover:border-emerald-500/40 p-5 sm:p-6 transition-all duration-300 text-center space-y-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Video className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold uppercase tracking-wider mb-1">
                <span>Emplacement Vidéo #2</span>
                <span className="text-emerald-400">• Prêt à l'emploi</span>
              </div>
              <h4 className="font-bold text-sm sm:text-base text-white">
                Ajoutez votre deuxième réalisation vidéo
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Cet emplacement est réservé pour la deuxième vidéo de votre agence. Téléversez votre fichier MP4 directement depuis votre appareil ou insérez un lien vidéo.
              </p>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold shadow-sm transition-all"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Téléverser la 2ème vidéo (Mode Admin)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
