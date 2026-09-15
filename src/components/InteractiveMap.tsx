import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { GpsLocation } from '../types';

interface InteractiveMapProps {
  location: GpsLocation;
  userCoords?: { latitude: number; longitude: number } | null;
}

export function InteractiveMap({ location, userCoords }: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [location.latitude, location.longitude],
        zoom: 15,
        zoomControl: true,
        attributionControl: true,
      });

      // CartoDB Dark Matter / Positron or OSM standard
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
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

    if (markerRef.current) {
      markerRef.current.remove();
    }

    const marker = L.marker([location.latitude, location.longitude], { icon: customIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family: inherit; padding: 4px;">
          <b style="font-size: 14px; color: #047857;">${location.landmark}</b>
          <div style="font-size: 12px; color: #374151; margin-top: 2px;">${location.address}</div>
          <div style="font-size: 11px; color: #6b7280;">${location.city}, ${location.country}</div>
          <div style="font-size: 11px; color: #059669; margin-top: 4px; font-weight: 600;">📍 GPS: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</div>
        </div>`
      );
    
    markerRef.current = marker;

    // If user shared position, display blue user marker
    if (userCoords) {
      if (userMarkerRef.current) userMarkerRef.current.remove();
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
      userMarkerRef.current = L.marker([userCoords.latitude, userCoords.longitude], { icon: userIcon })
        .addTo(map)
        .bindPopup('<b>Votre position actuelle</b>');

      const bounds = L.latLngBounds([
        [location.latitude, location.longitude],
        [userCoords.latitude, userCoords.longitude],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Resize handler
    const timeout = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timeout);
    };
  }, [location, userCoords]);

  // Clean up map instance on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-slate-700/60 shadow-inner bg-slate-900 z-0">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
}
