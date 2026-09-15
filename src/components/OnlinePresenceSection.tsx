import { useState } from 'react';
import { motion } from 'motion/react';
import { Linkedin, Globe, MapPin, ExternalLink, Copy, Check, Sparkles } from 'lucide-react';
import { BusinessCardProfile } from '../types';

interface OnlinePresenceSectionProps {
  profile: BusinessCardProfile;
}

export function OnlinePresenceSection({ profile }: OnlinePresenceSectionProps) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const links = [
    {
      id: 'linkedin',
      title: 'Profil Professionnel LinkedIn',
      subtitle: 'Réseau, parcours et réalisations',
      url: profile.linkedinUrl,
      icon: Linkedin,
      badge: 'Profil vérifié',
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      accentColor: 'hover:border-sky-500/50 hover:shadow-sky-950/30',
      iconBg: 'bg-sky-500/15 text-sky-400',
    },
    {
      id: 'website',
      title: 'Kongo Digital Wave (Site Officiel)',
      subtitle: 'Solutions numériques, audiovisuel & innovation',
      url: profile.websiteUrl,
      icon: Globe,
      badge: 'Plateforme officielle',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      accentColor: 'hover:border-emerald-500/50 hover:shadow-emerald-950/30',
      iconBg: 'bg-emerald-500/15 text-emerald-400',
    },
    {
      id: 'google-maps',
      title: 'Repère & Localisation Google',
      subtitle: 'Itinéraire direct & coordonnées vérifiées',
      url: profile.googleMapsShareUrl,
      icon: MapPin,
      badge: 'Emplacement GPS',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      accentColor: 'hover:border-amber-500/50 hover:shadow-amber-950/30',
      iconBg: 'bg-amber-500/15 text-amber-400',
    },
  ];

  return (
    <div id="online-presence-section" className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Écosystème & Présence en Ligne</span>
        </h3>
        <span className="text-xs text-slate-500 font-mono">3 liens vérifiés</span>
      </div>

      <div className="space-y-2.5">
        {links.map((item) => {
          const Icon = item.icon;
          const isCopied = copiedUrl === item.url;

          return (
            <motion.div
              key={item.id}
              id={`online-presence-card-${item.id}`}
              whileHover={{ y: -3, scale: 1.012 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: 'spring', stiffness: 380, damping: 24 }}
              className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 transition-colors duration-200 ${item.accentColor} hover:shadow-xl hover:bg-slate-850 cursor-pointer`}
            >
              <a
                id={`online-presence-anchor-${item.id}`}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 flex-1 min-w-0"
              >
                <motion.div 
                  whileHover={{ rotate: 8, scale: 1.12 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className={`w-11 h-11 rounded-2xl ${item.iconBg} flex items-center justify-center shrink-0 shadow-sm`}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white truncate group-hover:text-emerald-300 transition-colors">
                      {item.title}
                    </h4>
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className={`hidden sm:inline-block text-[10px] font-medium px-2 py-0.5 rounded-full border ${item.badgeColor} transition-transform`}
                    >
                      {item.badge}
                    </motion.span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                  <p className="text-[11px] text-emerald-400/80 font-mono truncate mt-0.5 flex items-center gap-1">
                    <span>{item.url}</span>
                  </p>
                </div>
              </a>

              <div className="flex items-center gap-1.5 pl-2 shrink-0">
                <motion.button
                  id={`online-presence-copy-${item.id}`}
                  type="button"
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(item.url);
                  }}
                  title="Copier le lien"
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors shadow-sm"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </motion.button>

                <motion.a
                  id={`online-presence-external-${item.id}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  onClick={(e) => e.stopPropagation()}
                  title="Ouvrir dans un nouvel onglet"
                  className="w-8 h-8 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/20 transition-colors shadow-sm"
                >
                  <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </motion.a>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
