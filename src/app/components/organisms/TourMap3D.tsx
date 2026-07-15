import { useEffect, useRef } from 'react';
import { useLocationStore } from '@/stores/locationStore';
import { useMapStore } from '@/stores/mapStore';
import { POIS, type Poi } from '@/lib/map/pois';

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string | undefined;

const SACSAYHUAMAN_CENTER = { lat: -13.5075, lng: -71.9815, altitude: 3650 };

/** Cámara inicial: vista aérea inclinada sobre el complejo. */
const INITIAL_CAMERA = {
  center: SACSAYHUAMAN_CENTER,
  range: 1100,
  tilt: 62,
  heading: 15,
};

// Tipado mínimo del web component Map3DElement (sin @types oficiales en beta)
interface Map3DCamera {
  center: { lat: number; lng: number; altitude?: number };
  range?: number;
  tilt?: number;
  heading?: number;
}

interface Map3DElementLike extends HTMLElement {
  flyCameraTo: (options: { endCamera: Map3DCamera; durationMillis?: number }) => void;
  append: (node: Node) => void;
}

interface Marker3DLike extends HTMLElement {
  position: { lat: number; lng: number; altitude?: number };
}

let loaderPromise: Promise<void> | null = null;

/** Carga el script de Google Maps JS API (canal beta, con maps3d). */
function loadGoogleMaps(key: string): Promise<void> {
  if (loaderPromise) return loaderPromise;
  const w = window as unknown as { google?: { maps?: { importLibrary?: unknown } } };
  if (w.google?.maps?.importLibrary) return Promise.resolve();

  loaderPromise = new Promise<void>((resolve, reject) => {
    const cbName = '__rimayGmapsReady';
    (window as unknown as Record<string, unknown>)[cbName] = () => resolve();
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&v=beta&libraries=maps3d&loading=async&callback=${cbName}`;
    script.async = true;
    script.onerror = () => reject(new Error('No se pudo cargar Google Maps JS API'));
    document.head.appendChild(script);
  });
  return loaderPromise;
}

interface TourMap3DProps {
  className?: string;
}

/**
 * Mapa fotorrealista 3D (tiles de Google Earth) vía Map3DElement.
 * Requiere VITE_GOOGLE_MAPS_KEY con "Map Tiles API" y "Maps JavaScript API"
 * habilitadas. Si no hay key, LocationModal usa el TourMap de Mapbox.
 */
export function TourMap3D({ className = '' }: TourMap3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map3DElementLike | null>(null);
  const userMarkerRef = useRef<Marker3DLike | null>(null);
  const initDoneRef = useRef(false);

  const position = useLocationStore((s) => s.position);
  const setReady = useMapStore((s) => s.setReady);
  const setActivePoi = useMapStore((s) => s.setActivePoi);
  const setShowPopup = useMapStore((s) => s.setShowPopup);
  const markDiscovered = useMapStore((s) => s.markDiscovered);
  const pendingFlyToPoiId = useMapStore((s) => s.pendingFlyToPoiId);
  const clearPendingFlyTo = useMapStore((s) => s.clearPendingFlyTo);

  // ============================================================
  // 1. Inicializar Map3DElement (una vez)
  // ============================================================
  useEffect(() => {
    if (!containerRef.current || !GOOGLE_MAPS_KEY || initDoneRef.current) return;
    initDoneRef.current = true;
    let cancelled = false;

    (async () => {
      try {
        await loadGoogleMaps(GOOGLE_MAPS_KEY);
        const g = (window as unknown as { google: { maps: { importLibrary: (lib: string) => Promise<Record<string, unknown>> } } }).google;
        const maps3d = await g.maps.importLibrary('maps3d') as {
          Map3DElement: new (opts: Record<string, unknown>) => Map3DElementLike;
          Marker3DInteractiveElement: new (opts: Record<string, unknown>) => Marker3DLike;
          Marker3DElement: new (opts: Record<string, unknown>) => Marker3DLike;
        };
        if (cancelled || !containerRef.current) return;

        const map = new maps3d.Map3DElement({
          ...INITIAL_CAMERA,
          mode: 'HYBRID',
        });
        map.style.width = '100%';
        map.style.height = '100%';
        containerRef.current.appendChild(map);
        mapRef.current = map;

        // Marcadores interactivos para paradas y POIs
        for (const poi of POIS) {
          const marker = new maps3d.Marker3DInteractiveElement({
            position: { lat: poi.latitude, lng: poi.longitude, altitude: poi.extrusionHeight + 4 },
            altitudeMode: 'RELATIVE_TO_MESH',
            extruded: true,
            label: poi.name,
          });
          marker.addEventListener('gmp-click', () => {
            setActivePoi(poi);
            setShowPopup(true);
            markDiscovered(poi.id);
            flyTo(map, poi);
          });
          map.append(marker);
        }

        setReady(true);
      } catch (error) {
        // Sin red o key inválida: el modal muestra el skeleton;
        // el fallback a Mapbox se decide antes de montar este componente.
        console.warn('Error inicializando el mapa 3D de Google:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // 2. flyTo pendiente (desde la lista de POIs del modal)
  // ============================================================
  useEffect(() => {
    if (!pendingFlyToPoiId || !mapRef.current) return;
    const poi = POIS.find((p) => p.id === pendingFlyToPoiId);
    if (poi) flyTo(mapRef.current, poi);
    clearPendingFlyTo();
  }, [pendingFlyToPoiId, clearPendingFlyTo]);

  // ============================================================
  // 3. Marcador de posición del usuario
  // ============================================================
  useEffect(() => {
    if (!position || !mapRef.current) return;
    const map = mapRef.current;

    (async () => {
      if (!userMarkerRef.current) {
        const g = (window as unknown as { google: { maps: { importLibrary: (lib: string) => Promise<Record<string, unknown>> } } }).google;
        const { Marker3DElement } = await g.maps.importLibrary('maps3d') as {
          Marker3DElement: new (opts: Record<string, unknown>) => Marker3DLike;
        };
        const marker = new Marker3DElement({
          position: { lat: position.latitude, lng: position.longitude, altitude: 2 },
          altitudeMode: 'RELATIVE_TO_MESH',
          extruded: true,
          label: 'Tu ubicación',
        });
        map.append(marker);
        userMarkerRef.current = marker;
      } else {
        userMarkerRef.current.position = {
          lat: position.latitude,
          lng: position.longitude,
          altitude: 2,
        };
      }
    })();
  }, [position]);

  return <div ref={containerRef} className={`bg-[#0E0E0E] ${className}`} />;
}

function flyTo(map: Map3DElementLike, poi: Poi) {
  map.flyCameraTo({
    endCamera: {
      center: { lat: poi.latitude, lng: poi.longitude, altitude: 3620 },
      range: 320,
      tilt: 65,
      heading: 0,
    },
    durationMillis: 2000,
  });
}
