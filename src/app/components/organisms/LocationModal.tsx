import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Circle,
} from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Radio } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useLocationStore } from '@/stores/locationStore';
import type { TourStop } from './TourStopsList';

interface LocationModalProps {
  stops: TourStop[];
  onClose: () => void;
}

function StopMarkers({ stops }: { stops: TourStop[] }) {
  return (
    <>
      {stops.map((stop) => {
        const isCurrent = stop.status === 'current';
        const isCompleted = stop.status === 'completed';

        return (
          <Marker
            key={stop.id}
            position={[stop.latitude, stop.longitude]}
            icon={L.divIcon({
              className: 'custom-marker',
              html: `<div style="
                width: ${isCurrent ? '32px' : '24px'};
                height: ${isCurrent ? '32px' : '24px'};
                border-radius: 50%;
                background: ${isCurrent ? '#A0522D' : isCompleted ? '#6B8F71' : '#999'};
                border: 3px solid white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: white;
                font-weight: 600;
              ">${isCompleted ? '✓' : stop.id}</div>`,
              iconSize: [isCurrent ? 32 : 24, isCurrent ? 32 : 24],
              iconAnchor: [isCurrent ? 16 : 12, isCurrent ? 16 : 12],
              popupAnchor: [0, isCurrent ? -18 : -14],
            })}
          >
            <Popup>
              <div className="min-w-[140px]">
                <p className="font-semibold text-sm">{stop.name}</p>
                <p className="text-xs text-gray-500">
                  {stop.status === 'completed'
                    ? '✓ Completado'
                    : stop.status === 'current'
                      ? '▶ Reproduciendo'
                      : 'Próxima parada'}
                </p>
                <p className="text-xs text-gray-400 mt-1">{stop.duration}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

function UserLocationMarker() {
  const position = useLocationStore((s) => s.position);

  if (!position) return null;

  return (
    <>
      <Marker
        position={[position.latitude, position.longitude]}
        icon={L.divIcon({
          className: 'user-marker',
          html: `<div style="
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #4285F4;
            border: 3px solid white;
            box-shadow: 0 1px 4px rgba(0,0,0,0.4);
          "></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })}
      >
        <Popup>
          <p className="text-xs font-medium">Tu ubicación</p>
          <p className="text-xs text-gray-500">±{Math.round(position.accuracy)}m</p>
        </Popup>
      </Marker>
      <Circle
        center={[position.latitude, position.longitude]}
        radius={position.accuracy}
        pathOptions={{
          color: '#4285F4',
          fillColor: '#4285F4',
          fillOpacity: 0.1,
          weight: 1,
        }}
      />
    </>
  );
}

function MapCenterUpdater() {
  const position = useLocationStore((s) => s.position);
  const map = useMap();
  const hasFlown = useRef(false);

  useEffect(() => {
    if (position && !hasFlown.current) {
      map.flyTo([position.latitude, position.longitude], 17, {
        duration: 1.5,
      });
      hasFlown.current = true;
    }
  }, [position, map]);

  return null;
}

export function LocationModal({ stops, onClose }: LocationModalProps) {
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [userStartedGeo, setUserStartedGeo] = useState(false);
  useGeolocation({ enabled: geoEnabled });

  const position = useLocationStore((s) => s.position);
  const geoError = useLocationStore((s) => s.error);

  const tourCenter = useMemo(() => {
    if (stops.length === 0) return { lat: -13.5075, lng: -71.9815 };
    const avgLat = stops.reduce((a, s) => a + s.latitude, 0) / stops.length;
    const avgLng = stops.reduce((a, s) => a + s.longitude, 0) / stops.length;
    return { lat: avgLat, lng: avgLng };
  }, [stops]);

  const handleEnableGeo = () => {
    setGeoEnabled(true);
    setUserStartedGeo(true);
  };

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
            <MapContainer
              center={[tourCenter.lat, tourCenter.lng]}
              zoom={16}
              className="w-full h-full"
            >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <StopMarkers stops={stops} />
            {geoEnabled && <UserLocationMarker />}
            {userStartedGeo && <MapCenterUpdater />}
          </MapContainer>

          {/* GPS enable banner */}
          {!geoEnabled && (
            <div className="absolute bottom-4 left-4 right-4 z-[1000]">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
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
                {geoError && (
                  <p className="text-xs text-red-600 mt-2 text-center">{geoError}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stops legend */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 overflow-y-auto max-h-[30vh]">
          <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Paradas ({stops.length})
          </h4>
          <div className="space-y-2">
            {stops.map((stop) => (
              <div key={stop.id} className="flex items-center gap-3 text-sm">
                <div
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    stop.status === 'current'
                      ? 'bg-[var(--terracotta)]'
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
