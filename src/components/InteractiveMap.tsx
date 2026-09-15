import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ExternalLink } from 'lucide-react';
import { GpsLocation } from '../types';

interface InteractiveMapProps {
  location: GpsLocation;
  userCoords?: { latitude: number; longitude: number } | null;
}

export function InteractiveMap({ location, userCoords }: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    let map = mapInstanceRef.current;

    try {
      if (!map) {
        // Clear any orphaned leaflet id from previous render/Strict Mode
        if ((container as unknown as { _leaflet_id?: unknown })._leaflet_id) {
          (container as unknown as { _leaflet_id: unknown })._leaflet_id = null;
        }

        map = L.map(container, {
          center: [location.latitude, location.longitude],
          zoom: 15,
          zoomControl: true,
          attributionControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      map.setView([location.latitude, location.longitude], 15);

      // Custom pulse icon for Kongo Digital Wave
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8">
            <div class="absolute w-8 h-8 bg-emerald-500 rounded-full animate-ping opacity-60"></div>
            <div class="relative w-7 h-7 bg-emerald-600 border-2 border-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      // Clear existing markers on the map
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map?.removeLayer(layer);
        }
      });

      L.marker([location.latitude, location.longitude], { icon: customIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family: sans-serif; padding: 4px;">
            <b style="font-size: 13px; color: #047857;">${location.landmark}</b>
            <div style="font-size: 11px; color: #374151; margin-top: 2px;">${location.address}</div>
            <div style="font-size: 10px; color: #6b7280;">${location.city}, ${location.country}</div>
            <div style="font-size: 10px; color: #059669; margin-top: 4px; font-weight: 600;">📍 GPS: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</div>
          </div>`
        );

      // If user shared position, display blue user marker
      if (userCoords) {
        const userIcon = L.divIcon({
          className: 'user-map-marker',
          html: `
            <div class="relative flex items-center justify-center w-6 h-6">
              <div class="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        L.marker([userCoords.latitude, userCoords.longitude], { icon: userIcon })
          .addTo(map)
          .bindPopup('<b>Votre position actuelle</b>');

        const bounds = L.latLngBounds([
          [location.latitude, location.longitude],
          [userCoords.latitude, userCoords.longitude],
        ]);
        map.fitBounds(bounds, { padding: [40, 40] });
      }

      // Invalidate size once container rendered
      const timeout = setTimeout(() => {
        try {
          map?.invalidateSize();
        } catch {
          // ignore
        }
      }, 250);

      return () => {
        clearTimeout(timeout);
      };
    } catch (err) {
      console.warn('Leaflet map initialization fallback:', err);
      setMapError(true);
    }
  }, [location, userCoords]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // ignore
        }
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current) {
        (mapContainerRef.current as unknown as { _leaflet_id: unknown })._leaflet_id = null;
      }
    };
  }, []);

  if (mapError) {
    return (
      <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-900 flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <div className="text-white font-semibold text-sm">{location.landmark}</div>
          <div className="text-xs text-slate-400">{location.address}, {location.city}</div>
        </div>
        <a
          href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors shadow-md"
        >
          <span>Voir directement sur Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-slate-700/60 shadow-inner bg-slate-900 z-0">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
}
