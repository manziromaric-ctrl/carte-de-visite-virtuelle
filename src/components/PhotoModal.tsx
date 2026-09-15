import React from 'react';
import { X, ZoomIn, Download, CheckCircle2 } from 'lucide-react';
import { BusinessCardProfile } from '../types';

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BusinessCardProfile;
}

export function PhotoModal({ isOpen, onClose, profile }: PhotoModalProps) {
  if (!isOpen || !profile.avatarUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <h3 className="text-white font-bold text-base">Photo de Profil Professionnelle</h3>
        </div>

        {/* Enlarged Photo Container */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-slate-950 shadow-2xl">
          <img
            src={profile.avatarUrl}
            alt={`Portrait grand format de ${profile.name}`}
            referrerPolicy="no-referrer"
            className="w-full h-auto max-h-[65vh] object-contain mx-auto block"
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-4 flex items-center justify-between">
            <div>
              <div className="text-white font-bold text-sm flex items-center gap-1.5">
                <span>{profile.name}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xs text-emerald-300 font-medium">
                {profile.title} • {profile.company}
              </div>
            </div>
            
            <a
              href={profile.avatarUrl}
              download={`Photo_${profile.name.replace(/\s+/g, '_')}.jpg`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md"
              title="Télécharger l'image"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="mt-3 text-center text-xs text-slate-400">
          Photo officielle haute résolution d'{profile.name} ({profile.company})
        </div>
      </div>
    </div>
  );
}
