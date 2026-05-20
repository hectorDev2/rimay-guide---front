import { lazy, Suspense, useState } from 'react';
import { motion } from 'motion/react';
import { Navigation, Radio, MapPin, Box, Crosshair } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useLocationStore } from '@/stores/locationStore';
import { useMapStore } from '@/stores/mapStore';
import { POIS } from '@/lib/map/pois';
import { SiteViewer3D } from './SiteViewer3D';
import type { TourStopDisplay } from './TourStopsList';

const TourMap = lazy(() => import('./TourMap').then((m) => ({ default: m.TourMap })));

const SIMULATED_POSITION = {
  lat: -13.52368220899334,
  lng: -71.95887219714923,
  label: 'Ubicación de prueba (Google Maps)',
};

interface LocationModalProps {
  stops: TourStopDisplay[];
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
  const show3DViewer = useMapStore((s) => s.show3DViewer);
  const setShow3DViewer = useMapStore((s) => s.setShow3DViewer);

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

  const nearestStopToSimulated = stops.reduce<{ stop: TourStopDisplay; dist: number } | null>((best, s) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371e3;
    const dLat = toRad(SIMULATED_POSITION.lat - s.latitude);
    const dLng = toRad(SIMULATED_POSITION.lng - s.longitude);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(SIMULATED_POSITION.lat)) * Math.cos(toRad(s.latitude)) * Math.sin(dLng / 2) ** 2;
    const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (!best || d < best.dist) return { stop: s, dist: d };
    return best;
  }, null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-end"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Mapa del tour"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-[#171717] rounded-t-[30px] w-full h-[85vh] overflow-hidden flex flex-col border-t border-[#2C2C2C]/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0">
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-[#2C2C2C] rounded-full" />
          </div>
          <div className="px-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-[#E6FF00]" />
              <h3 className="text-lg font-semibold text-white">
                Mapa del tour
              </h3>
            </div>
            {position && (
              <span className="text-xs bg-[#AFFF00]/10 text-[#AFFF00] px-2 py-1 rounded-full flex items-center gap-1 border border-[#AFFF00]/20">
                <Radio className="w-3 h-3" /> GPS activo
              </span>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 min-h-0 relative">
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-[#0E0E0E]"><p className="text-sm text-[#6E6E6E]">Cargando mapa...</p></div>}>
            <TourMap className="w-full h-full" />
          </Suspense>

          {/* GPS enable / simulate banner */}
          {!geoEnabled && (
            <div className="absolute bottom-4 left-4 right-4 z-[1000]">
              <div className="bg-[#171717]/95 backdrop-blur-[20px] rounded-[22px] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] border border-[#2C2C2C] space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#E6FF00] flex-shrink-0" />
                  <p className="text-sm text-white">
                    Activa tu ubicación para verte en el mapa
                  </p>
                </div>
                <button
                  onClick={handleEnableGeo}
                  className="w-full py-2.5 rounded-full bg-[#E6FF00] text-[#111111] text-sm font-semibold active:scale-[0.97] transition-all"
                >
                  Activar GPS
                </button>

                <div className="border-t border-[#2C2C2C] pt-3">
                  <p className="text-xs text-[#6E6E6E] mb-2 flex items-center gap-1">
                    <Crosshair className="w-3 h-3" />
                    O simula una ubicación de prueba:
                  </p>
                  <button
                    onClick={handleSimulate}
                    className="w-full py-2.5 rounded-full bg-[#4A7FA5] hover:bg-[#3D6B8C] text-white text-sm font-medium active:scale-[0.97] transition-all"
                  >
                    📍 {SIMULATED_POSITION.label}
                  </button>
                  {nearestStopToSimulated && (
                    <p className={`text-xs mt-2 text-center ${nearestStopToSimulated.dist <= 25 ? 'text-[#AFFF00] font-medium' : 'text-[#FFB84D]'}`}>
                      → {nearestStopToSimulated.stop.name} ({Math.round(nearestStopToSimulated.dist)}m)
                      {nearestStopToSimulated.dist <= 25 ? ' ✓ EN RANGO' : ' (fuera de rango)'}
                    </p>
                  )}
                </div>

                {geoError && (
                  <p className="text-xs text-[#FF4D67] text-center">{geoError}</p>
                )}
              </div>
            </div>
          )}

          {/* Active POI popup close button (overlay, not Mapbox popup) */}
          {activePoi && showPopup && (
            <div className="absolute top-4 left-4 right-4 z-[1000]">
              <div className="bg-[#171717]/95 backdrop-blur-[20px] rounded-[22px] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] border border-[#2C2C2C]">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">
                      🏛️ {activePoi.name}
                    </p>
                    <p className="text-xs text-[#A6A6A6] mt-1 leading-relaxed">
                      {activePoi.description}
                    </p>
                    <span className="inline-block mt-2 text-[10px] uppercase tracking-wide text-[#6E6E6E] font-medium">
                      {activePoi.category === 'tour_stop' ? 'Parada del tour' : activePoi.category}
                    </span>
                  </div>
                   <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShow3DViewer(true)}
                      className="flex-shrink-0 px-2.5 h-7 rounded-full bg-[#E6FF00] hover:bg-[#D6F500] flex items-center gap-1 text-[#111111] text-[11px] font-semibold transition-all shadow-[0_4px_12px_rgba(230,255,0,0.3)] active:scale-90"
                      title="Ver en 3D"
                    >
                      <Box className="w-3 h-3" />
                      3D
                    </button>
                    <button
                      onClick={() => { setActivePoi(null); setShowPopup(false); }}
                      className="flex-shrink-0 w-6 h-6 rounded-full bg-[#1E1E1E] hover:bg-[#2C2C2C] flex items-center justify-center text-[#6E6E6E]"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <SiteViewer3D
          poi={activePoi}
          open={show3DViewer}
          onClose={() => setShow3DViewer(false)}
        />

        {/* Stops + POIs legend */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-[#2C2C2C] overflow-y-auto max-h-[30vh]">
          <h4 className="text-sm font-medium text-[#6E6E6E] uppercase tracking-wide mb-3">
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
                        ? 'bg-[#E6FF00] ring-2 ring-[#E6FF00]/30 shadow-[0_0_8px_rgba(230,255,0,0.3)]'
                        : stop.status === 'completed'
                          ? 'bg-[#AFFF00]'
                          : 'bg-[#2C2C2C]'
                    }`}
                  />
                  <span
                    className={
                      stop.status === 'completed'
                        ? 'text-[#6E6E6E] line-through'
                        : 'text-white'
                    }
                  >
                    {stop.name}
                  </span>
                  <span className="text-xs text-[#6E6E6E] ml-auto">{stop.duration}</span>
                </button>
              );
            })}
          </div>

          <h4 className="text-sm font-medium text-[#6E6E6E] uppercase tracking-wide mt-4 mb-3">
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
                    className="w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-white/20"
                    style={{ backgroundColor: poi.color }}
                  />
                  <span className="text-white">{poi.name}</span>
                  <span className="text-xs text-[#6E6E6E] ml-auto capitalize">{poi.category}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
