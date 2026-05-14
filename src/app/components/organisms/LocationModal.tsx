import { lazy, Suspense, useState } from 'react';
import { Navigation, Radio, MapPin, Crosshair } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useLocationStore } from '@/stores/locationStore';
import { useMapStore } from '@/stores/mapStore';
import { POIS } from '@/lib/map/pois';
import type { TourStop } from './TourStopsList';

const TourMap = lazy(() => import('./TourMap').then((m) => ({ default: m.TourMap })));

const SIMULATED_POSITION = {
  lat: -13.52368220899334,
  lng: -71.95887219714923,
  label: 'Ubicación de prueba (Google Maps)',
};

interface LocationModalProps {
  stops: TourStop[];
  onClose: () => void;
}

export function LocationModal({ stops, onClose }: LocationModalProps) {
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [userStartedGeo, setUserStartedGeo] = useState(false);
  useGeolocation({ enabled: geoEnabled, stops });

  const position = useLocationStore((s) => s.position);
  const setPosition = useLocationStore((s) => s.setPosition);
  const geoError = useLocationStore((s) => s.error);
  const activePoi = useMapStore((s) => s.activePoi);
  const showPopup = useMapStore((s) => s.showPopup);
  const setShowPopup = useMapStore((s) => s.setShowPopup);
  const setActivePoi = useMapStore((s) => s.setActivePoi);

  const handleEnableGeo = () => {
    setGeoEnabled(true);
    setUserStartedGeo(true);
  };

  const handleSimulate = () => {
    setPosition({
      latitude: SIMULATED_POSITION.lat,
      longitude: SIMULATED_POSITION.lng,
      accuracy: 5,
      timestamp: Date.now(),
    });
  };

  const nearestStopToSimulated = stops.reduce<{ stop: TourStop; dist: number } | null>((best, s) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371e3;
    const dLat = toRad(SIMULATED_POSITION.lat - s.latitude);
    const dLon = toRad(SIMULATED_POSITION.lng - s.longitude);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(SIMULATED_POSITION.lat)) * Math.cos(toRad(s.latitude)) * Math.sin(dLon / 2) ** 2;
    const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (!best || d < best.dist) return { stop: s, dist: d };
    return best;
  }, null);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl w-full h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0">
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>
          <div className="px-6 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-[var(--terracotta)]" />
              <h3 className="text-lg font-semibold text-[var(--dark-charcoal)]">
                Mapa del tour
              </h3>
            </div>
            {position && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                <Radio className="w-3 h-3" /> GPS activo
              </span>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 min-h-0 relative">
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-gray-100"><p className="text-sm text-gray-400">Cargando mapa...</p></div>}>
            <TourMap className="w-full h-full" />
          </Suspense>

          {/* GPS enable / simulate banner */}
          {!geoEnabled && (
            <div className="absolute bottom-4 left-4 right-4 z-[1000]">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-100 space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[var(--terracotta)] flex-shrink-0" />
                  <p className="text-sm text-[var(--dark-charcoal)]">
                    Activá tu ubicación para verte en el mapa
                  </p>
                </div>
                <button
                  onClick={handleEnableGeo}
                  className="w-full py-2.5 rounded-xl bg-[var(--terracotta)] text-white text-sm font-medium"
                >
                  Activar GPS
                </button>

                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <Crosshair className="w-3 h-3" />
                    O simulá una ubicación de prueba:
                  </p>
                  <button
                    onClick={handleSimulate}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                  >
                    📍 {SIMULATED_POSITION.label}
                  </button>
                  {nearestStopToSimulated && (
                    <p className={`text-xs mt-2 text-center ${nearestStopToSimulated.dist <= 25 ? 'text-green-600 font-medium' : 'text-yellow-600'}`}>
                      → {nearestStopToSimulated.stop.name} ({Math.round(nearestStopToSimulated.dist)}m)
                      {nearestStopToSimulated.dist <= 25 ? ' ✓ EN RANGO' : ' (fuera de rango)'}
                    </p>
                  )}
                </div>

                {geoError && (
                  <p className="text-xs text-red-600 text-center">{geoError}</p>
                )}
              </div>
            </div>
          )}

          {/* Active POI popup close button (overlay, not Mapbox popup) */}
          {activePoi && showPopup && (
            <div className="absolute top-4 left-4 right-4 z-[1000]">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-100">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--dark-charcoal)]">
                      🏛️ {activePoi.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {activePoi.description}
                    </p>
                    <span className="inline-block mt-2 text-[10px] uppercase tracking-wide text-gray-400 font-medium">
                      {activePoi.category === 'tour_stop' ? 'Parada del tour' : activePoi.category}
                    </span>
                  </div>
                  <button
                    onClick={() => { setActivePoi(null); setShowPopup(false); }}
                    className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stops + POIs legend */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 overflow-y-auto max-h-[30vh]">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Paradas del tour ({stops.length})
          </h4>
          <div className="space-y-2">
            {stops.map((stop) => {
              const poi = POIS.find((p) => p.tourStopId === stop.id);
              const isActive = activePoi?.id === poi?.id;
              return (
                <button
                  key={stop.id}
                  onClick={() => {
                    if (poi) {
                      useMapStore.getState().setActivePoi(poi);
                      useMapStore.getState().setShowPopup(true);
                    }
                  }}
                  className={`w-full flex items-center gap-3 text-sm text-left transition-colors ${
                    isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      stop.status === 'current'
                        ? 'bg-[var(--terracotta)] ring-2 ring-[var(--terracotta)]/30'
                        : stop.status === 'completed'
                          ? 'bg-[var(--sage-green)]'
                          : 'bg-gray-300'
                    }`}
                  />
                  <span
                    className={
                      stop.status === 'completed'
                        ? 'text-gray-400 line-through'
                        : 'text-[var(--dark-charcoal)]'
                    }
                  >
                    {stop.name}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">{stop.duration}</span>
                </button>
              );
            })}
          </div>

          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mt-4 mb-3">
            Puntos de interés
          </h4>
          <div className="space-y-2">
            {POIS.filter((p) => p.category !== 'tour_stop').map((poi) => {
              const isActive = activePoi?.id === poi.id;
              return (
                <button
                  key={poi.id}
                  onClick={() => {
                    useMapStore.getState().flyToPoi(poi);
                  }}
                  className={`w-full flex items-center gap-3 text-sm text-left transition-colors ${
                    isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-white"
                    style={{ backgroundColor: poi.color }}
                  />
                  <span className="text-[var(--dark-charcoal)]">{poi.name}</span>
                  <span className="text-xs text-gray-400 ml-auto capitalize">{poi.category}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
