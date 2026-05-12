import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useLocationStore } from '@/stores/locationStore';
import { useMapStore } from '@/stores/mapStore';
import { POIS, type Poi } from '@/lib/map/pois';
import { createExtrusionPolygon, findActivePoi } from '@/lib/map/geofence';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const CUSCO_CENTER: mapboxgl.LngLatLike = [-71.9815, -13.5075];

const CATEGORY_COLORS: Record<string, string> = {
  templo: '#C8922A',
  fortaleza: '#A0522D',
  plaza: '#4A7FA5',
  santuario: '#C8922A',
  mirador: '#6B8F71',
  mercado: '#6B8F71',
  barrio: '#6B8F71',
  tour_stop: '#A0522D',
};

interface TourMapProps {
  className?: string;
}

export function TourMap({ className = '' }: TourMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const poiMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const initDoneRef = useRef(false);

  const position = useLocationStore((s) => s.position);
  const setReady = useMapStore((s) => s.setReady);
  const setActivePoi = useMapStore((s) => s.setActivePoi);
  const setShowPopup = useMapStore((s) => s.setShowPopup);
  const markDiscovered = useMapStore((s) => s.markDiscovered);
  const setCenter = useMapStore((s) => s.setCenter);
  const setZoom = useMapStore((s) => s.setZoom);
  const setPitch = useMapStore((s) => s.setPitch);
  const pendingFlyToPoiId = useMapStore((s) => s.pendingFlyToPoiId);
  const clearPendingFlyTo = useMapStore((s) => s.clearPendingFlyTo);

  // ============================================================
  // 1. Initialize Mapbox map (once)
  // ============================================================
  useEffect(() => {
    if (!containerRef.current || !MAPBOX_TOKEN || initDoneRef.current) return;

    initDoneRef.current = true;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: CUSCO_CENTER,
      zoom: 15,
      pitch: 45,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    mapRef.current = map;

    // ============================================================
    // 2. On map style load — add sources & layers
    // ============================================================
    map.on('load', () => {
      // --- 3D fill-extrusion source ---
      const extrusionFeatures = POIS.map((poi) => ({
        type: 'Feature' as const,
        properties: {
          height: poi.extrusionHeight,
          color: poi.color,
          name: poi.name,
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: createExtrusionPolygon(poi.latitude, poi.longitude, 25),
        },
      }));

      map.addSource('poi-3d', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: extrusionFeatures },
      });

      map.addLayer({
        id: 'poi-3d-extrusion',
        type: 'fill-extrusion',
        source: 'poi-3d',
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.65,
        },
      });

      // --- POI markers ---
      POIS.forEach((poi) => {
        const el = document.createElement('div');
        el.className = 'poi-marker';
        el.style.cssText = `
          width: ${poi.category === 'tour_stop' ? '20px' : '26px'};
          height: ${poi.category === 'tour_stop' ? '20px' : '26px'};
          border-radius: 50%;
          background: ${CATEGORY_COLORS[poi.category] ?? '#888'};
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        `;
        el.title = poi.name;

        el.addEventListener('click', () => {
          flyToPoi(map, poi);
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([poi.longitude, poi.latitude])
          .addTo(map);

        poiMarkersRef.current.push(marker);
      });

      // --- User location marker (blue dot) ---
      const userEl = document.createElement('div');
      userEl.style.cssText = `
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #4285F4;
        border: 3px solid white;
        box-shadow: 0 1px 6px rgba(66,133,244,0.6);
        transition: transform 0.15s ease;
      `;
      const userMarker = new mapboxgl.Marker({ element: userEl })
        .setLngLat(CUSCO_CENTER)
        .addTo(map);
      userMarkerRef.current = userMarker;

      // --- Accuracy circle (behind user marker) — use a layer ---
      map.addSource('user-accuracy', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Point', coordinates: CUSCO_CENTER },
        },
      });
      map.addLayer({
        id: 'user-accuracy-circle',
        type: 'circle',
        source: 'user-accuracy',
        paint: {
          'circle-radius': 25,
          'circle-color': '#4285F4',
          'circle-opacity': 0.1,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#4285F4',
          'circle-stroke-opacity': 0.3,
        },
      });

      setReady(true);
    });

    // ============================================================
    // 3. Update store on map move
    // ============================================================
    map.on('move', () => {
      const c = map.getCenter();
      setCenter([c.lng, c.lat]);
      setZoom(map.getZoom());
      setPitch(map.getPitch());
    });

    return () => {
      map.remove();
      mapRef.current = null;
      poiMarkersRef.current = [];
      userMarkerRef.current = null;
      popupRef.current = null;
      initDoneRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================
  // 4. Update user location marker + accuracy + geofence
  // ============================================================
  useEffect(() => {
    if (!mapRef.current || !userMarkerRef.current) return;

    const pos = position;
    if (!pos) {
      // Hide user marker when no position
      userMarkerRef.current.getElement().style.display = 'none';
      return;
    }

    const lngLat: [number, number] = [pos.longitude, pos.latitude];
    userMarkerRef.current.setLngLat(lngLat).getElement().style.display = 'block';

    // Update accuracy circle radius proportionally
    const accuracyRadius = Math.max(5, Math.round(pos.accuracy / 5));
    const accuracySource = mapRef.current.getSource('user-accuracy') as mapboxgl.GeoJSONSource | undefined;
    if (accuracySource) {
      accuracySource.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: lngLat },
      });
      mapRef.current.setPaintProperty('user-accuracy-circle', 'circle-radius', accuracyRadius);
    }

    // Geofencing
    const active = findActivePoi(pos.latitude, pos.longitude, POIS);
    if (active) {
      setActivePoi(active.poi);
      markDiscovered(active.poi.id);
    } else {
      setActivePoi(null);
    }
  }, [position, setActivePoi, markDiscovered]);

  // ============================================================
  // 5. FlyTo when pendingFlyToPoiId changes (click from legend)
  // ============================================================
  useEffect(() => {
    if (!mapRef.current || !pendingFlyToPoiId) return;
    const poi = POIS.find((p) => p.id === pendingFlyToPoiId);
    if (!poi) return;

    mapRef.current.flyTo({
      center: [poi.longitude, poi.latitude],
      zoom: 17,
      pitch: 60,
      duration: 1500,
    });
    clearPendingFlyTo();
  }, [pendingFlyToPoiId, clearPendingFlyTo]);

  // ============================================================
  // 6. Show/hide popup when active POI changes
  // ============================================================
  useEffect(() => {
    if (!mapRef.current) return;

    // Close existing popup
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    const activePoi = useMapStore.getState().activePoi;
    const showPopup = useMapStore.getState().showPopup;
    if (!activePoi || !showPopup) return;

    const popupHtml = `
      <div style="font-family: system-ui, sans-serif; max-width: 220px;">
        <p style="font-weight: 600; font-size: 14px; margin: 0 0 4px; color: #2C2416;">
          ${activePoi.name}
        </p>
        <p style="font-size: 12px; color: #6B6B6B; margin: 0; line-height: 1.4;">
          ${activePoi.description}
        </p>
        ${
          activePoi.imageUrl
            ? `<img src="${activePoi.imageUrl}" alt="${activePoi.name}" style="width:100%;height:100px;object-fit:cover;border-radius:6px;margin-top:6px;" />`
            : ''
        }
        <p style="font-size: 11px; color: #999; margin-top: 6px;">
          🏛️ ${activePoi.category === 'tour_stop' ? 'Parada del tour' : activePoi.category.charAt(0).toUpperCase() + activePoi.category.slice(1)}
        </p>
      </div>
    `;

    popupRef.current = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: true,
      maxWidth: '260px',
      offset: 15,
    })
      .setLngLat([activePoi.longitude, activePoi.latitude])
      .setHTML(popupHtml)
      .addTo(mapRef.current!);

    // Highlight the marker
    poiMarkersRef.current.forEach((marker) => {
      const el = marker.getElement();
      const markerLngLat = marker.getLngLat();
      if (
        Math.abs(markerLngLat.lng - activePoi.longitude) < 0.001 &&
        Math.abs(markerLngLat.lat - activePoi.latitude) < 0.001
      ) {
        el.style.transform = 'scale(1.4)';
        el.style.boxShadow = '0 0 20px rgba(160,82,45,0.6)';
      } else {
        el.style.transform = 'scale(1)';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.35)';
      }
    });
  }, [useMapStore.getState().activePoi, useMapStore.getState().showPopup]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center p-6">
          <p className="text-sm text-gray-500 mb-2">🗺️</p>
          <p className="text-sm text-gray-500">
            Configurá{' '}
            <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">VITE_MAPBOX_TOKEN</code>
            {' '}en tu .env para ver el mapa 3D
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ minHeight: '200px' }}
    />
  );
}

function flyToPoi(map: mapboxgl.Map, poi: Poi) {
  map.flyTo({
    center: [poi.longitude, poi.latitude],
    zoom: 17,
    pitch: 60,
    duration: 1500,
  });
  useMapStore.getState().setActivePoi(poi);
  useMapStore.getState().setShowPopup(true);
  useMapStore.getState().clearPendingFlyTo();
}
