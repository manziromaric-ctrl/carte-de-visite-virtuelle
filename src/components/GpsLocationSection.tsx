import { useState } from 'react';
import { MapPin, Navigation, Compass, Copy, Check, ExternalLink, LocateFixed, AlertCircle } from 'lucide-react';
import { BusinessCardProfile } from '../types';
import { calculateDistanceKm } from '../utils/vcard';
import { InteractiveMap } from './InteractiveMap';

interface GpsLocationSectionProps {
  profile: BusinessCardProfile;
}

export function GpsLocationSection({ profile }: GpsLocationSectionProps) {
  const [copied, setCopied] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const coordsString = `${profile.location.latitude.toFixed(6)}, ${profile.location.longitude.toFixed(6)}`;

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(coordsString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGetLiveDistance = () => {
    if (!navigator.geolocation) {
      setGeoError("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setUserLocation({ latitude: userLat, longitude: userLng });
        const dist = calculateDistanceKm(
          userLat,
          userLng,
          profile.location.latitude,
          profile.location.longitude
        );
        setDistance(dist);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Autorisation d'accès à la position refusée.");
        } else {
          setGeoError("Impossible d'obtenir votre position GPS.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <section id="location-section" className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-slate-800/80 shadow-xl relative overflow-hidden">
      {/* Subtle emerald glow accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>

      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Localisation & Emplacement
            </h3>
            <p className="text-xs text-slate-400">Repère physique & Coordonnées GPS</p>
          </div>
        </div>

        <a
          id="open-google-maps-btn"
          href={profile.googleMapsShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-all duration-200 hover:scale-[1.02]"
          title="Ouvrir dans Google Maps"
        >
          <span>Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Address Card */}
      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 mb-5 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 mb-1">
              {profile.location.landmark}
            </span>
            <h4 className="text-sm font-semibold text-slate-100">{profile.location.address}</h4>
            <p className="text-xs text-slate-400">{profile.location.city}, {profile.location.country}</p>
          </div>
        </div>

        {/* GPS Badge & Copy */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-mono">
            <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-400">GPS:</span>
            <span className="font-semibold text-emerald-300 tracking-wide">{coordsString}</span>
          </div>

          <button
            id="copy-gps-btn"
            onClick={handleCopyCoords}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copier GPS</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="mb-5">
        <InteractiveMap location={profile.location} userCoords={userLocation} />
        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400">
          <span>{profile.location.landmark} - {profile.location.city}</span>
          <span className="text-emerald-400">Carte dynamique OpenStreetMap</span>
        </div>
      </div>

      {/* Live Distance Calculator */}
      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <LocateFixed className="w-3.5 h-3.5 text-emerald-400" />
            <span>Votre distance par rapport à notre siège</span>
          </div>
          {distance !== null ? (
            <p className="text-xs text-emerald-300 mt-0.5">
              📍 Vous êtes à environ <strong className="text-emerald-400 font-bold">{distance} km</strong> à vol d'oiseau.
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 mt-0.5">
              Cliquez pour calculer le trajet et la distance depuis votre position
            </p>
          )}
          {geoError && (
            <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" /> {geoError}
            </p>
          )}
        </div>

        <button
          id="calc-distance-btn"
          onClick={handleGetLiveDistance}
          disabled={locating}
          className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all disabled:opacity-50"
        >
          {locating ? (
            <span className="inline-block animate-spin">⌛</span>
          ) : (
            <LocateFixed className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span>{locating ? 'Calcul en cours...' : 'Calculer ma distance'}</span>
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <a
          id="direct-share-google-link"
          href={profile.googleMapsShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-950/40 transition-all duration-200 hover:-translate-y-0.5"
        >
          <Navigation className="w-4 h-4" />
          <span>Itinéraire Google Maps</span>
        </a>

        <a
          id="directions-gps-link"
          href={`https://www.google.com/maps/dir/?api=1&destination=${profile.location.latitude},${profile.location.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-sm border border-slate-700/80 transition-all duration-200"
        >
          <Compass className="w-4 h-4 text-emerald-400" />
          <span>Itinéraire direct GPS</span>
        </a>
      </div>
    </section>
  );
}
