import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useNavigationStore } from '@/stores/navigationStore';
import { useTourStore } from '@/stores/tourStore';
import { projectOnRoute, splitRouteAt, type LngLat } from '@/lib/map/route';

/** Imágenes satelitales Esri World Imagery — raster gratuito con atribución. */
const MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    satellite: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Esri, Maxar, Earthstar Geographics',
    },
  },
  layers: [
    { id: 'satellite', type: 'raster', source: 'satellite' },
    {
      id: 'dim',
      type: 'background',
      paint: { 'background-color': 'rgba(10, 12, 8, 0.18)' },
    },
  ],
};

const ROUTE_COLOR = '#E6FF00';
const ROUTE_DONE_COLOR = '#8A9900';
const WALK_ZOOM = 17.6;
const ARRIVE_ZOOM = 18.4;
const WALK_PITCH = 60;

/** Punto a `dist` metros de `origin` en dirección `bearingDeg`. */
function destination(origin: LngLat, dist: number, bearingDeg: number): LngLat {
  const rad = (bearingDeg * Math.PI) / 180;
  const dLat = (dist * Math.cos(rad)) / 111_320;
  const dLng = (dist * Math.sin(rad)) / (111_320 * Math.cos((origin[1] * Math.PI) / 180));
  return [origin[0] + dLng, origin[1] + dLat];
}

function createUserMarkerEl(): HTMLDivElement {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="walk-user-halo"></div>
    <svg class="walk-user-cone" width="46" height="46" viewBox="0 0 46 46">
      <defs>
        <linearGradient id="coneGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#E6FF00" stop-opacity="0.55"/>
          <stop offset="100%" stop-color="#E6FF00" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="M23 4 L34 26 A14 14 0 0 0 12 26 Z" fill="url(#coneGrad)"/>
      <circle cx="23" cy="27" r="7.5" fill="#E6FF00" stroke="#111" stroke-width="2.5"/>
    </svg>`;
  el.style.cssText = 'position:relative;width:46px;height:46px;';
  return el;
}

function createStopMarkerEl(order: number, active: boolean, completed: boolean): HTMLDivElement {
  const el = document.createElement('div');
  if (active) {
    el.innerHTML = `
      <div class="walk-dest-ring"></div>
      <div class="walk-dest-dot"></div>
      <span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
        color:#111;font-weight:800;font-size:13px;font-family:system-ui;z-index:1;">${order}</span>`;
    el.style.cssText = 'position:relative;width:38px;height:38px;';
  } else if (completed) {
    el.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="4"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`;
    el.style.cssText = `
      width:24px;height:24px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      background:#AFFF00;border:2.5px solid #111;
      box-shadow:0 2px 8px rgba(0,0,0,.6);
    `;
  } else {
    el.textContent = String(order);
    el.style.cssText = `
      width:26px;height:26px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      background:#171717;border:2.5px solid #fff;
      color:#fff;font-weight:700;font-size:12px;font-family:system-ui;
      box-shadow:0 2px 10px rgba(0,0,0,.7);
    `;
  }
  return el;
}

const MARKER_CSS = `
@keyframes walkHalo { 0%,100% { transform: scale(1); opacity:.35 } 50% { transform: scale(1.35); opacity:.15 } }
@keyframes walkRing { 0% { transform: scale(.6); opacity:.9 } 100% { transform: scale(1.6); opacity:0 } }
.walk-user-halo {
  position:absolute; inset:5px; border-radius:50%;
  background:rgba(230,255,0,.25);
  animation: walkHalo 4s ease-in-out infinite;
}
.walk-user-cone { position:absolute; inset:0; }
.walk-dest-ring {
  position:absolute; inset:0; border-radius:50%;
  border:3px solid ${ROUTE_COLOR};
  animation: walkRing 2s ease-out infinite;
}
.walk-dest-dot {
  position:absolute; inset:9px; border-radius:50%;
  background:${ROUTE_COLOR}; border:3px solid #111;
  box-shadow:0 0 14px rgba(230,255,0,.7);
}
`;

interface WalkingMapProps {
  className?: string;
  onStopClick?: (stopId: string) => void;
}

export function WalkingMap({ className = '', onStopClick }: WalkingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const stopMarkersRef = useRef<maplibregl.Marker[]>([]);
  const loadedRef = useRef(false);
  const orbitDoneRef = useRef(false);
  const onStopClickRef = useRef(onStopClick);
  onStopClickRef.current = onStopClick;
  // Estado (no ref): el efecto que dibuja la ruta debe re-ejecutarse cuando
  // el mapa termina de cargar, o la ruta calculada antes del 'load' nunca se pinta.
  const [mapLoaded, setMapLoaded] = useState(false);

  const tour = useTourStore((s) => s.tour);
  const completedIds = useTourStore((s) => s.completedIds);
  const targetStopId = useNavigationStore((s) => s.targetStopId);
  const routeCoords = useNavigationStore((s) => s.routeCoords);
  const snappedPosition = useNavigationStore((s) => s.snappedPosition);
  const rawPosition = useNavigationStore((s) => s.rawPosition);
  const heading = useNavigationStore((s) => s.heading);
  const mode = useNavigationStore((s) => s.mode);
  const offRoute = useNavigationStore((s) => s.offRoute);
  const followCamera = useNavigationStore((s) => s.followCamera);
  const setFollowCamera = useNavigationStore((s) => s.setFollowCamera);

  // ── Inicialización (una vez) ─────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const style = document.createElement('style');
    style.textContent = MARKER_CSS;
    document.head.appendChild(style);

    const target = tour?.stops.find((s) => !completedIds.includes(s.id)) ?? tour?.stops[0];
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: target ? [target.longitude, target.latitude] : [-71.9815, -13.5075],
      zoom: WALK_ZOOM,
      pitch: WALK_PITCH,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.on('load', () => {
      loadedRef.current = true;
      setMapLoaded(true);

      map.addSource('route-done', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } },
      });
      map.addSource('route-remaining', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } },
      });
      map.addSource('rejoin', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } },
      });

      map.addLayer({
        id: 'route-done-line',
        type: 'line',
        source: 'route-done',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': ROUTE_DONE_COLOR, 'line-width': 4, 'line-opacity': 0.35 },
      });
      map.addLayer({
        id: 'route-remaining-casing',
        type: 'line',
        source: 'route-remaining',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#111111', 'line-width': 9, 'line-opacity': 0.5 },
      });
      map.addLayer({
        id: 'route-remaining-line',
        type: 'line',
        source: 'route-remaining',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': ROUTE_COLOR, 'line-width': 5, 'line-opacity': 0.95 },
      });
      map.addLayer({
        id: 'route-flow',
        type: 'line',
        source: 'route-remaining',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#FFFFFF',
          'line-width': 2.5,
          'line-opacity': 0.9,
          'line-dasharray': [0, 4, 3],
        },
      });
      map.addLayer({
        id: 'rejoin-line',
        type: 'line',
        source: 'rejoin',
        layout: { 'line-cap': 'round' },
        paint: {
          'line-color': ROUTE_COLOR,
          'line-width': 3,
          'line-opacity': 0.7,
          'line-dasharray': [1, 2],
        },
      });
    });

    // Flujo direccional animado sobre la ruta restante
    const DASH_STEPS: number[][] = [
      [0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5], [2, 4, 1],
      [2.5, 4, 0.5], [3, 4, 0], [0, 0.5, 3, 3.5], [0, 1, 3, 3], [0, 1.5, 3, 2.5],
      [0, 2, 3, 2], [0, 2.5, 3, 1.5], [0, 3, 3, 1], [0, 3.5, 3, 0.5],
    ];
    let dashIdx = 0;
    const dashTimer = setInterval(() => {
      if (!loadedRef.current || !mapRef.current?.getLayer('route-flow')) return;
      dashIdx = (dashIdx + 1) % DASH_STEPS.length;
      mapRef.current.setPaintProperty('route-flow', 'line-dasharray', DASH_STEPS[dashIdx]);
    }, 110);

    // Cualquier gesto del usuario (arrastre, pinch-zoom, rotación, pitch)
    // libera la cámara. No hay re-follow automático: el usuario explora a su
    // ritmo y vuelve al seguimiento con el botón de recentrar.
    // dragstart/rotatestart/pitchstart solo los dispara el usuario; zoomstart
    // también lo dispara easeTo, por eso ahí sí se exige originalEvent.
    const releaseCamera = () => setFollowCamera(false);
    const onZoomStart = (e: { originalEvent?: Event }) => {
      if (e.originalEvent) releaseCamera();
    };
    map.on('dragstart', releaseCamera);
    map.on('rotatestart', releaseCamera);
    map.on('pitchstart', releaseCamera);
    map.on('zoomstart', onZoomStart);
    // Respaldo universal: cualquier interacción táctil/mouse sobre el canvas
    map.getCanvas().addEventListener('pointerdown', releaseCamera);

    return () => {
      clearInterval(dashTimer);
      map.remove();
      mapRef.current = null;
      loadedRef.current = false;
      userMarkerRef.current = null;
      stopMarkersRef.current = [];
      style.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Marcadores de paradas ────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !tour) return;
    stopMarkersRef.current.forEach((m) => m.remove());
    stopMarkersRef.current = tour.stops.map((s) => {
      const el = createStopMarkerEl(s.order, s.id === targetStopId, completedIds.includes(s.id));
      el.style.cursor = 'pointer';
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onStopClickRef.current?.(s.id);
      });
      return new maplibregl.Marker({ element: el })
        .setLngLat([s.longitude, s.latitude])
        .addTo(map);
    });
  }, [tour, targetStopId, completedIds]);

  // ── Ruta: recorrido / restante / reincorporación ─────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || routeCoords.length < 2) return;

    const setLine = (id: string, coords: LngLat[]) => {
      const src = map.getSource(id) as maplibregl.GeoJSONSource | undefined;
      src?.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: coords },
      });
    };

    if (snappedPosition) {
      const proj = projectOnRoute(routeCoords, snappedPosition);
      const { done, remaining } = splitRouteAt(routeCoords, proj);
      setLine('route-done', done);
      setLine('route-remaining', remaining);
      setLine('rejoin', offRoute && rawPosition ? [rawPosition, proj.snapped] : []);
    } else {
      setLine('route-remaining', routeCoords);
      setLine('route-done', []);
      setLine('rejoin', []);
    }
  }, [routeCoords, snappedPosition, rawPosition, offRoute, mapLoaded]);

  // ── Marcador del usuario + cámara seguidora ──────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !snappedPosition) return;

    if (!userMarkerRef.current) {
      userMarkerRef.current = new maplibregl.Marker({
        element: createUserMarkerEl(),
        rotationAlignment: 'map',
        pitchAlignment: 'map',
      })
        .setLngLat(snappedPosition)
        .addTo(map);
    }
    userMarkerRef.current.setLngLat(snappedPosition).setRotation(heading);

    if (!followCamera || mode === 'arrived') return;

    const arriving = mode === 'arriving';
    // Centro adelantado: el usuario ve hacia dónde va, no sus pies
    const ahead = destination(snappedPosition, arriving ? 15 : 38, heading);
    map.easeTo({
      center: ahead,
      bearing: heading,
      pitch: arriving ? 48 : WALK_PITCH,
      zoom: arriving ? ARRIVE_ZOOM : WALK_ZOOM,
      duration: 1000,
      easing: (t) => t,
    });
  }, [snappedPosition, heading, mode, followCamera]);

  // ── Coreografía de llegada: órbita de 180° ───────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || mode !== 'arrived' || orbitDoneRef.current) {
      if (mode !== 'arrived') orbitDoneRef.current = false;
      return;
    }
    orbitDoneRef.current = true;
    const target = tour?.stops.find((s) => s.id === targetStopId);
    if (!target) return;
    map.easeTo({
      center: [target.longitude, target.latitude],
      bearing: map.getBearing() + 180,
      pitch: 52,
      zoom: ARRIVE_ZOOM,
      duration: 2600,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });
  }, [mode, targetStopId, tour]);

  return <div ref={containerRef} className={`relative ${className}`} />;
}
