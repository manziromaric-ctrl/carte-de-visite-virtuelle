import { Briefcase, Award, CheckCircle2, Phone, Mail, MapPin, Building, Globe, MessageSquare, Maximize2 } from 'lucide-react';
import { BusinessCardProfile } from '../types';
import { KongoLogo } from './KongoLogo';

interface AboutSectionProps {
  profile: BusinessCardProfile;
  onOpenPhoto?: () => void;
}

export function AboutSection({ profile, onOpenPhoto }: AboutSectionProps) {
  return (
    <div className="space-y-4">
      {/* Executive Bio & Identity Presentation */}
      <div className="bg-slate-900/80 rounded-3xl p-5 sm:p-6 border border-slate-800 text-sm space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
          {profile.avatarUrl ? (
            <div 
              className="relative group/avatar shrink-0 cursor-pointer"
              onClick={onOpenPhoto}
              title="Cliquer pour voir la photo en grand format"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-xl shadow-emerald-950/70 bg-slate-950 ring-4 ring-emerald-500/15 transition-transform group-hover/avatar:scale-105 relative">
                <img
                  src={profile.avatarUrl}
                  alt={`Portrait officiel de ${profile.name}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                  <Maximize2 className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div 
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-slate-950 shadow-md"
                title="Profil officiel vérifié"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950 stroke-[3]" />
              </div>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center text-emerald-400 font-bold shrink-0">
              <Briefcase className="w-8 h-8 text-emerald-400" />
            </div>
          )}

          <div className="min-w-0 flex-1 text-center sm:text-left space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-white font-extrabold text-lg sm:text-xl tracking-tight">
                  {profile.name}
                </h3>
                <div className="text-xs sm:text-sm text-emerald-400 font-semibold">
                  {profile.title}
                </div>
              </div>

              {/* Official Brand Logo */}
              <div className="self-center sm:self-start pt-1 sm:pt-0">
                <KongoLogo variant="full" size="sm" showTagline={false} />
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              {profile.tagline}
            </p>
          </div>
        </div>

        <p className="text-slate-300 leading-relaxed text-xs sm:text-sm pt-2 border-t border-slate-800/80">
          {profile.bio}
        </p>

        {/* Services / Expertise */}
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Domaines d'Intervention & Expertises
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {profile.services.map((srv, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{srv}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key skills chips */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-1.5">
          {profile.skills.map((skill, i) => (
            <span
              key={i}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60"
            >
              #{skill}
            </span>
          ))}
        </div>
      </div>

      {/* Direct Contact info box */}
      <div className="bg-slate-900/80 rounded-3xl p-5 border border-slate-800 text-xs space-y-2.5">
        <h4 className="font-bold text-white flex items-center gap-2">
          <Phone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Coordonnées directes</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-300">
          <a
            href={`tel:${profile.phone.replace(/\s+/g, '')}`}
            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400">Téléphone direct</div>
              <div className="font-semibold text-xs truncate">{profile.phone}</div>
            </div>
          </a>

          <a
            href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, '')}?text=Bonjour%20${encodeURIComponent(profile.name)}%2C%20je%20vous%20contacte%20via%20votre%20carte%20de%20visite%20digitale.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-green-500/15 text-green-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400">WhatsApp direct</div>
              <div className="font-semibold text-xs truncate">{profile.whatsapp}</div>
            </div>
          </a>

          <a
            href={`mailto:${profile.email}`}
            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 transition-colors sm:col-span-2"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400">Email professionnel</div>
              <div className="font-semibold text-xs truncate">{profile.email}</div>
            </div>
          </a>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 sm:col-span-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-slate-400">Siège social / Repère</div>
              <div className="font-semibold text-xs truncate">
                {profile.location.landmark} - {profile.location.address}, {profile.location.city} ({profile.location.country})
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
