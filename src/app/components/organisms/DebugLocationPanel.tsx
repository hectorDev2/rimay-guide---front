import { useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { useLocationStore } from '@/stores/locationStore';
import type { TourStopDisplay } from './TourStopsList';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface DebugLocationPanelProps {
  stops: TourStopDisplay[];
  onEnterStop?: (stopId: string) => void;
  currentStopId: string;
}

const CUSTOM_POSITIONS = [
  { label: '📍 Tu ubicación (Google Maps)', lat: -13.52368220899334, lng: -71.95887219714923 },
];

export function DebugLocationPanel({ stops, onEnterStop, currentStopId }: DebugLocationPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const position = useLocationStore((s) => s.position);
  const setPosition = useLocationStore((s) => s.setPosition);
  const setActiveStop = useLocationStore((s) => s.setActiveStop);
  const lastTriggeredRef = useRef<string | null>(null);

  const handleSimulate = (stop: TourStopDisplay) => {
    const pos = {
      latitude: stop.latitude,
      longitude: stop.longitude,
      accuracy: 5,
      timestamp: Date.now(),
    };
    setPosition(pos);
    setActiveStop(String(stop.id));

    if (stop.id !== lastTriggeredRef.current) {
      lastTriggeredRef.current = stop.id;
      onEnterStop?.(stop.id);
    }
  };

  const nearestStop = position
    ? stops.reduce<{ stop: TourStopDisplay; dist: number } | null>((best, s) => {
        const dist = calculateDistance(position.latitude, position.longitude, s.latitude, s.longitude);
        if (!best || dist < best.dist) return { stop: s, dist };
        return best;
      }, null)
    : null;

  return (
    <div className="fixed bottom-4 left-4 z-[9999] max-w-[280px]">
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="bg-yellow-500 text-white px-3 py-2 rounded-xl shadow-lg text-xs font-medium flex items-center gap-1.5"
        >
          <Navigation className="w-3.5 h-3.5" />
          Simular ubicación
        </button>
      )}

      {expanded && (
        <div className="bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="px-3 py-2 bg-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-300 font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3 text-yellow-400" />
              Debug GPS
            </span>
            <button
              onClick={() => setExpanded(false)}
              className="text-gray-400 hover:text-white text-xs"
            >
              ✕
            </button>
          </div>

          <div className="p-2 max-h-60 overflow-y-auto">
            {position && (
              <div className="mb-2 px-2 py-1.5 bg-gray-800 rounded-lg text-[10px] text-gray-400">
                <span className="text-green-400">●</span> Lat: {position.latitude.toFixed(5)}{' '}
                Lon: {position.longitude.toFixed(5)}
                {nearestStop && (
                  <div className="text-yellow-400 mt-0.5">
                    Más cerca: {nearestStop.stop.name} ({Math.round(nearestStop.dist)}m)
                  </div>
                )}
              </div>
            )}

            <div className="text-[10px] text-gray-500 mb-1.5 px-1">
              Ubicación personalizada:
            </div>

            {CUSTOM_POSITIONS.map((pos, i) => {
              const nearestToCustom = stops.reduce<{ stop: TourStopDisplay; dist: number } | null>((best, s) => {
                const d = calculateDistance(pos.lat, pos.lng, s.latitude, s.longitude);
                if (!best || d < best.dist) return { stop: s, dist: d };
                return best;
              }, null);

              return (
                <button
                  key={i}
                  onClick={() => {
                    const posData = { latitude: pos.lat, longitude: pos.lng, accuracy: 5, timestamp: Date.now() };
                    setPosition(posData);
                    if (nearestToCustom && nearestToCustom.dist <= 25) {
                      setActiveStop(String(nearestToCustom.stop.id));
                      if (nearestToCustom.stop.id !== currentStopId) {
                        onEnterStop?.(nearestToCustom.stop.id);
                      }
                    }
                  }}
                  className="w-full text-left px-2 py-2 rounded-lg mb-2 text-[11px] bg-blue-900/20 border border-blue-800/30 hover:bg-blue-900/40 transition-colors"
                >
                  <div className="text-blue-300 font-medium">{pos.label}</div>
                  <div className="text-gray-400 text-[10px] mt-0.5">
                    {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
                  </div>
                  {nearestToCustom && (
                    <div className={`text-[10px] mt-0.5 ${nearestToCustom.dist <= 25 ? 'text-green-400' : 'text-yellow-500'}`}>
                      → {nearestToCustom.stop.name} ({Math.round(nearestToCustom.dist)}m)
                      {nearestToCustom.dist <= 25 ? ' ✓ EN RANGO' : ''}
                    </div>
                  )}
                </button>
              );
            })}

            <div className="text-[10px] text-gray-500 mb-1.5 px-1 mt-2 border-t border-gray-700 pt-2">
              Simular en parada específica:
            </div>

            {stops.map((stop) => {
              const dist = position
                ? calculateDistance(position.latitude, position.longitude, stop.latitude, stop.longitude)
                : Infinity;
              const isInRange = dist <= 25;

              return (
                <button
                  key={stop.id}
                  onClick={() => handleSimulate(stop)}
                  className={`w-full text-left px-2 py-1.5 rounded-lg mb-1 text-[11px] transition-colors ${
                    isInRange
                      ? 'bg-green-900/30 text-green-300 border border-green-800'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <span className="font-medium">{stop.name}</span>
                  <span className="text-gray-500 ml-1">
                    {dist < Infinity ? `(${Math.round(dist)}m)` : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
