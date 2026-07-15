import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useNavigationStore } from '@/stores/navigationStore';
import { useTourStore } from '@/stores/tourStore';
import { bearing, projectOnRoute, splitRouteAt, type LngLat } from '@/lib/map/route';

/**
 * Estilo "videojuego": tiles vectoriales de OpenFreeMap (esquema OpenMapTiles)
 * con paleta oscura propia, calles anchas y edificios extruidos en 3D.
 * Sin labels: los nombres los ponen nuestros propios marcadores.
 */
const MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    omt: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
      attribution: '© OpenMapTiles © OpenStreetMap contributors',
    },
  },
  layers: [
    { id: 'bg', type: 'background', paint: { 'background-color': '#12140E' } },
    {
      id: 'landcover-green',
      type: 'fill',
      source: 'omt',
      'source-layer': 'landcover',
      filter: ['match', ['get', 'class'], ['grass', 'wood', 'farmland'], true, false],
      paint: { 'fill-color': '#18261C' },
    },
    {
      id: 'park',
      type: 'fill',
      source: 'omt',
      'source-layer': 'park',
      paint: { 'fill-color': '#1C3022' },
    },
    {
      id: 'water',
      type: 'fill',
      source: 'omt',
      'source-layer': 'water',
      paint: { 'fill-color': '#0E1C27' },
    },
    {
      id: 'waterway',
      type: 'line',
      source: 'omt',
      'source-layer': 'waterway',
      paint: { 'line-color': '#0E1C27', 'line-width': 2 },
    },
    {
      id: 'road-path',
      type: 'line',
      source: 'omt',
      'source-layer': 'transportation',
      filter: ['==', ['get', 'class'], 'path'],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#31352A',
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 14, 1, 18, 5],
        'line-dasharray': [2, 1.5],
      },
    },
    {
      id: 'road-minor-casing',
      type: 'line',
      source: 'omt',
      'source-layer': 'transportation',
      filter: ['match', ['get', 'class'], ['minor', 'service', 'track'], true, false],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#0B0D08',
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 14, 3, 18, 14],
      },
    },
    {
      id: 'road-minor',
      type: 'line',
      source: 'omt',
      'source-layer': 'transportation',
      filter: ['match', ['get', 'class'], ['minor', 'service', 'track'], true, false],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#2F332A',
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 14, 2, 18, 11],
      },
    },
    {
      id: 'road-major-casing',
      type: 'line',
      source: 'omt',
      'source-layer': 'transportation',
      filter: [
        'match',
        ['get', 'class'],
        ['motorway', 'trunk', 'primary', 'secondary', 'tertiary'],
        true,
        false,
      ],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#0B0D08',
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 14, 5, 18, 20],
      },
    },
    {
      id: 'road-major',
      type: 'line',
      source: 'omt',
      'source-layer': 'transportation',
      filter: [
        'match',
        ['get', 'class'],
        ['motorway', 'trunk', 'primary', 'secondary', 'tertiary'],
        true,
        false,
      ],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#3B4032',
        'line-width': ['interpolate', ['exponential', 1.5], ['zoom'], 14, 3.5, 18, 16],
      },
    },
    {
      id: 'buildings-3d',
      type: 'fill-extrusion',
      source: 'omt',
      'source-layer': 'building',
      minzoom: 14,
      paint: {
        'fill-extrusion-color': '#242820',
        'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 6],
        'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
        'fill-extrusion-opacity': 0.92,
      },
    },
  ],
};

const ROUTE_COLOR = '#E6FF00';
const ROUTE_DONE_COLOR = '#8A9900';
const WALK_ZOOM = 17.9;
const ARRIVE_ZOOM = 18.4;
const WALK_PITCH = 66;
// Primera persona: cámara baja y pegada al avatar, mirando hacia adelante
const FP_ZOOM = 19.1;
const FP_PITCH = 78;
const MAX_PITCH = 85;
/** Radio (m) del anillo de interacción: dentro de él la parada "se enciende". */
const INTERACTION_RANGE = 40;

/** Punto a `dist` metros de `origin` en dirección `bearingDeg`. */
function destination(origin: LngLat, dist: number, bearingDeg: number): LngLat {
  const rad = (bearingDeg * Math.PI) / 180;
  const dLat = (dist * Math.cos(rad)) / 111_320;
  const dLng = (dist * Math.sin(rad)) / (111_320 * Math.cos((origin[1] * Math.PI) / 180));
  return [origin[0] + dLng, origin[1] + dLat];
}

/** Distancia aproximada en metros (válida para distancias cortas). */
function metersBetween(a: LngLat, b: LngLat): number {
  const dx = (b[0] - a[0]) * 111_320 * Math.cos((a[1] * Math.PI) / 180);
  const dy = (b[1] - a[1]) * 111_320;
  return Math.hypot(dx, dy);
}

/** Polígono circular de `radius` metros alrededor de `center`. */
function circleRing(center: LngLat, radius: number, points = 48): LngLat[] {
  return Array.from({ length: points + 1 }, (_, i) =>
    destination(center, radius, (i * 360) / points),
  );
}

/** Punto a `dist` metros a lo largo de una polilínea (desde su inicio). */
function pointAlongRoute(coords: LngLat[], dist: number): LngLat {
  let acc = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const seg = metersBetween(coords[i], coords[i + 1]);
    if (seg > 0 && acc + seg >= dist) {
      const t = (dist - acc) / seg;
      return [
        coords[i][0] + (coords[i + 1][0] - coords[i][0]) * t,
        coords[i][1] + (coords[i + 1][1] - coords[i][1]) * t,
      ];
    }
    acc += seg;
  }
  return coords[coords.length - 1];
}

function createUserMarkerEl(): HTMLDivElement {
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="walk-user-bob" style="position:absolute;inset:0;">
      <div class="walk-user-halo"></div>
      <svg class="walk-user-cone" width="52" height="52" viewBox="0 0 52 52">
        <defs>
          <linearGradient id="coneGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#E6FF00" stop-opacity="0.6"/>
            <stop offset="100%" stop-color="#E6FF00" stop-opacity="0"/>
          </linearGradient>
          <radialGradient id="bodyGrad" cx="0.35" cy="0.3" r="0.9">
            <stop offset="0%" stop-color="#F6FF7A"/>
            <stop offset="100%" stop-color="#C9E600"/>
          </radialGradient>
        </defs>
        <path d="M26 2 L39 28 A16 16 0 0 0 13 28 Z" fill="url(#coneGrad)"/>
        <ellipse cx="26" cy="34" rx="10" ry="4" fill="rgba(0,0,0,.45)"/>
        <circle cx="26" cy="30" r="9" fill="url(#bodyGrad)" stroke="#111" stroke-width="2.5"/>
        <circle cx="26" cy="27.5" r="3.2" fill="#111"/>
      </svg>
    </div>`;
  el.style.cssText = 'position:relative;width:52px;height:52px;';
  return el;
}

function createStopMarkerEl(order: number, active: boolean, completed: boolean): HTMLDivElement {
  const el = document.createElement('div');
  if (active) {
    el.innerHTML = `
      <div class="walk-dest-inner" style="position:absolute;inset:0;">
        <div class="walk-dest-ring"></div>
        <div class="walk-dest-dot"></div>
        <span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
          color:#111;font-weight:800;font-size:13px;font-family:system-ui;z-index:1;">${order}</span>
      </div>`;
    el.style.cssText = 'position:relative;width:38px;height:38px;';
  } else if (completed) {
    el.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="4"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`;
    el.style.cssText = `
      width:24px;height:24px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      background:linear-gradient(180deg,#F5CE62,#C99A2E);border:2.5px solid #111;
      box-shadow:0 0 10px rgba(212,168,67,.55),0 2px 8px rgba(0,0,0,.6);
    `;
  } else {
    el.textContent = String(order);
    el.style.cssText = `
      width:26px;height:26px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      background:#171717;border:2.5px solid #fff;
      color:#fff;font-weight:700;font-size:12px;font-family:system-ui;
      box-shadow:0 2px 10px rgba(0,0,0,.7);opacity:.8;
    `;
  }
  return el;
}

/** Explosión de partículas de una sola vez sobre un punto del mapa. */
function spawnBurst(map: maplibregl.Map, at: LngLat) {
  const el = document.createElement('div');
  el.style.cssText = 'position:relative;width:0;height:0;pointer-events:none;';
  const ring = document.createElement('div');
  ring.className = 'walk-burst-pop';
  el.appendChild(ring);
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('div');
    p.className = 'walk-burst-p';
    const ang = (i / 10) * Math.PI * 2 + Math.random() * 0.5;
    const r = 34 + Math.random() * 26;
    p.style.setProperty('--dx', `${Math.cos(ang) * r}px`);
    p.style.setProperty('--dy', `${Math.sin(ang) * r}px`);
    p.style.background = i % 3 ? '#E6FF00' : '#FFD75E';
    el.appendChild(p);
  }
  const marker = new maplibregl.Marker({ element: el }).setLngLat(at).addTo(map);
  setTimeout(() => marker.remove(), 1700);
}

const MARKER_CSS = `
@keyframes walkHalo { 0%,100% { transform: scale(1); opacity:.35 } 50% { transform: scale(1.35); opacity:.15 } }
@keyframes walkRing { 0% { transform: scale(.6); opacity:.9 } 100% { transform: scale(1.6); opacity:0 } }
@keyframes walkBob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
@keyframes walkBounce { 0%,100% { transform: translateY(0) scale(1) } 50% { transform: translateY(-6px) scale(1.06) } }
@keyframes walkBurstFly {
  to { transform: translate(var(--dx), var(--dy)) scale(.2); opacity: 0 }
}
@keyframes walkBurstPop {
  0% { transform: scale(.2); opacity: 1 }
  100% { transform: scale(2); opacity: 0 }
}
.walk-user-bob { animation: walkBob 1.6s ease-in-out infinite; }
.walk-user-halo {
  position:absolute; inset:6px; border-radius:50%;
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
.walk-in-range .walk-dest-inner { animation: walkBounce .9s ease-in-out infinite; }
.walk-in-range .walk-dest-ring { border-color:#AFFF00; animation-duration:1.1s; }
.walk-in-range .walk-dest-dot { box-shadow:0 0 24px rgba(175,255,0,.95); }
.walk-burst-p {
  position:absolute; left:-3px; top:-3px; width:7px; height:7px; border-radius:50%;
  animation: walkBurstFly 1.1s cubic-bezier(.1,.7,.3,1) forwards;
}
.walk-burst-pop {
  position:absolute; left:-22px; top:-22px; width:44px; height:44px; border-radius:50%;
  border:3px solid ${ROUTE_COLOR};
  animation: walkBurstPop .9s ease-out forwards;
}
`;

export type CameraView = 'third' | 'first';

interface WalkingMapProps {
  className?: string;
  onStopClick?: (stopId: string) => void;
  /** 'third' = vista elevada por defecto; 'first' = primera persona. */
  view?: CameraView;
}

export function WalkingMap({ className = '', onStopClick, view = 'third' }: WalkingMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const stopMarkersRef = useRef<maplibregl.Marker[]>([]);
  const targetElRef = useRef<HTMLDivElement | null>(null);
  const burstFiredForRef = useRef<string | null>(null);
  // Overrides de cámara elegidos por el usuario mientras la cámara sigue
  // (pinch-zoom / tilt), estilo Google Maps navegación. null = default.
  const userZoomRef = useRef<number | null>(null);
  const userPitchRef = useRef<number | null>(null);
  // >0 mientras hay un gesto activo: la cámara no pelea contra los dedos.
  const gestureCountRef = useRef(0);
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
      maxPitch: MAX_PITCH,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.on('load', () => {
      loadedRef.current = true;
      setMapLoaded(true);

      map.addSource('range-ring', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
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
        id: 'range-fill',
        type: 'fill',
        source: 'range-ring',
        paint: { 'fill-color': ROUTE_COLOR, 'fill-opacity': 0.05 },
      });
      map.addLayer({
        id: 'range-line',
        type: 'line',
        source: 'range-ring',
        paint: {
          'line-color': ROUTE_COLOR,
          'line-width': 2,
          'line-opacity': 0.45,
          'line-dasharray': [2, 2],
        },
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

    // Flujo direccional animado sobre la ruta restante + pulso del anillo
    const DASH_STEPS: number[][] = [
      [0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5], [2, 4, 1],
      [2.5, 4, 0.5], [3, 4, 0], [0, 0.5, 3, 3.5], [0, 1, 3, 3], [0, 1.5, 3, 2.5],
      [0, 2, 3, 2], [0, 2.5, 3, 1.5], [0, 3, 3, 1], [0, 3.5, 3, 0.5],
    ];
    let dashIdx = 0;
    const dashTimer = setInterval(() => {
      const m = mapRef.current;
      if (!loadedRef.current || !m?.getLayer('route-flow')) return;
      dashIdx = (dashIdx + 1) % DASH_STEPS.length;
      m.setPaintProperty('route-flow', 'line-dasharray', DASH_STEPS[dashIdx]);
      if (m.getLayer('range-line')) {
        const pulse = 0.35 + 0.2 * Math.sin((dashIdx / DASH_STEPS.length) * Math.PI * 2);
        m.setPaintProperty('range-line', 'line-opacity', pulse);
      }
    }, 110);

    // Gestos estilo Google Maps navegación:
    //  - Arrastrar (pan) o rotar → libera la cámara; se vuelve con recentrar.
    //  - Pinch-zoom y tilt (dos dedos vertical) → la cámara SIGUE al usuario
    //    pero respeta el zoom/pitch elegidos (overrides).
    // Los eventos disparados por easeTo no traen originalEvent; los gestos sí.
    const releaseCamera = () => setFollowCamera(false);
    map.on('dragstart', releaseCamera);
    map.on('rotatestart', (e: { originalEvent?: Event }) => {
      if (e.originalEvent) releaseCamera();
    });

    let adjustingZoom = false;
    let adjustingPitch = false;
    map.on('zoomstart', (e: { originalEvent?: Event }) => {
      if (e.originalEvent && !adjustingZoom) {
        adjustingZoom = true;
        gestureCountRef.current++;
      }
    });
    map.on('zoomend', () => {
      if (adjustingZoom) {
        adjustingZoom = false;
        gestureCountRef.current--;
        userZoomRef.current = map.getZoom();
      }
    });
    map.on('pitchstart', (e: { originalEvent?: Event }) => {
      if (e.originalEvent && !adjustingPitch) {
        adjustingPitch = true;
        gestureCountRef.current++;
      }
    });
    map.on('pitchend', () => {
      if (adjustingPitch) {
        adjustingPitch = false;
        gestureCountRef.current--;
        userPitchRef.current = map.getPitch();
      }
    });

    return () => {
      clearInterval(dashTimer);
      map.remove();
      mapRef.current = null;
      loadedRef.current = false;
      userMarkerRef.current = null;
      stopMarkersRef.current = [];
      targetElRef.current = null;
      style.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Marcadores de paradas ────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !tour) return;
    stopMarkersRef.current.forEach((m) => m.remove());
    targetElRef.current = null;
    stopMarkersRef.current = tour.stops.map((s) => {
      const active = s.id === targetStopId;
      const el = createStopMarkerEl(s.order, active, completedIds.includes(s.id));
      if (active) targetElRef.current = el;
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

  // ── Marcador del usuario + anillo de rango + cámara ──────────
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

    // En primera persona la cámara (y el avatar) miran siempre hacia la ruta
    // trazada: se apunta a un punto ~16 m adelante SOBRE el camino restante,
    // así la cámara gira sola en cada curva. En vista elevada se usa el rumbo
    // de movimiento del GPS.
    const firstPerson = view === 'first';
    let camBearing = heading;
    if (firstPerson && routeCoords.length >= 2) {
      const proj = projectOnRoute(routeCoords, snappedPosition);
      const { remaining } = splitRouteAt(routeCoords, proj);
      if (remaining.length >= 2) {
        const lookAt = pointAlongRoute(remaining, 16);
        camBearing = bearing(snappedPosition, lookAt);
      }
    }

    userMarkerRef.current
      .setLngLat(snappedPosition)
      .setRotation(firstPerson ? camBearing : heading);

    // Anillo de interacción alrededor del jugador
    if (mapLoaded) {
      const ringSrc = map.getSource('range-ring') as maplibregl.GeoJSONSource | undefined;
      ringSrc?.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Polygon', coordinates: [circleRing(snappedPosition, INTERACTION_RANGE)] },
      });
    }

    // Parada objetivo "en rango": se enciende, rebota y estalla al entrar
    const targetStop = tour?.stops.find((s) => s.id === targetStopId);
    if (targetStop && targetElRef.current) {
      const stopPos: LngLat = [targetStop.longitude, targetStop.latitude];
      const inRange = metersBetween(snappedPosition, stopPos) <= INTERACTION_RANGE;
      targetElRef.current.classList.toggle('walk-in-range', inRange);
      if (inRange && burstFiredForRef.current !== targetStop.id) {
        burstFiredForRef.current = targetStop.id;
        spawnBurst(map, stopPos);
      }
    }

    if (!followCamera || mode === 'arrived' || gestureCountRef.current > 0) return;

    const arriving = mode === 'arriving';
    // Centro adelantado: el usuario ve hacia dónde va, no sus pies.
    // En primera persona el avatar queda casi al borde inferior de la pantalla.
    const aheadM = firstPerson ? 14 : arriving ? 12 : 30;
    const ahead = destination(snappedPosition, aheadM, camBearing);
    map.easeTo({
      center: ahead,
      bearing: camBearing,
      pitch: userPitchRef.current ?? (firstPerson ? FP_PITCH : arriving ? 50 : WALK_PITCH),
      zoom: userZoomRef.current ?? (firstPerson ? FP_ZOOM : arriving ? ARRIVE_ZOOM : WALK_ZOOM),
      duration: firstPerson ? 700 : 1000,
      easing: (t) => t,
    });
  }, [snappedPosition, heading, mode, followCamera, mapLoaded, tour, targetStopId, view, routeCoords]);

  // Recentrar (follow false → true) o cambiar de vista restaura la cámara
  // por defecto de esa vista, descartando los ajustes manuales de zoom/pitch.
  const prevFollowRef = useRef(followCamera);
  useEffect(() => {
    if (followCamera && !prevFollowRef.current) {
      userZoomRef.current = null;
      userPitchRef.current = null;
    }
    prevFollowRef.current = followCamera;
  }, [followCamera]);
  useEffect(() => {
    userZoomRef.current = null;
    userPitchRef.current = null;
  }, [view]);

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
