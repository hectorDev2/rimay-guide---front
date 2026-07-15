import { haversineDistance } from './geofence';

/** Coordenada [lng, lat] — mismo orden que MapLibre/GeoJSON. */
export type LngLat = [number, number];

const EARTH_M_PER_DEG_LAT = 111_320;

function metersPerDegLng(lat: number): number {
  return EARTH_M_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);
}

/** Rumbo geográfico (0–360°, norte = 0) desde `a` hacia `b`. */
export function bearing(a: LngLat, b: LngLat): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const [lng1, lat1] = a.map(toRad) as [number, number];
  const [lng2, lat2] = b.map(toRad) as [number, number];
  const dLng = lng2 - lng1;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Diferencia angular mínima entre dos rumbos, en [0, 180]. */
export function bearingDiff(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

export interface RouteProjection {
  /** Punto de la ruta más cercano a la posición. */
  snapped: LngLat;
  /** Índice del segmento (entre coords[i] y coords[i+1]). */
  segmentIndex: number;
  /** Distancia recorrida a lo largo de la ruta hasta el punto proyectado (m). */
  distanceAlong: number;
  /** Distancia perpendicular desde la posición a la ruta (m). */
  distanceToRoute: number;
  /** Rumbo del segmento de ruta en el punto proyectado. */
  segmentBearing: number;
}

/** Distancias acumuladas (m) desde el inicio hasta cada vértice. */
export function cumulativeDistances(coords: LngLat[]): number[] {
  const acc: number[] = [0];
  for (let i = 1; i < coords.length; i++) {
    acc.push(
      acc[i - 1] +
        haversineDistance(coords[i - 1][1], coords[i - 1][0], coords[i][1], coords[i][0]),
    );
  }
  return acc;
}

/**
 * Proyecta una posición sobre la polilínea de la ruta (snap-to-route).
 * Usa proyección equirectangular local — suficiente para rutas peatonales.
 */
export function projectOnRoute(coords: LngLat[], position: LngLat): RouteProjection {
  const mLng = metersPerDegLng(position[1]);
  const toXY = ([lng, lat]: LngLat): [number, number] => [
    lng * mLng,
    lat * EARTH_M_PER_DEG_LAT,
  ];

  const p = toXY(position);
  let best: { d2: number; t: number; i: number; point: [number, number] } | null = null;

  for (let i = 0; i < coords.length - 1; i++) {
    const a = toXY(coords[i]);
    const b = toXY(coords[i + 1]);
    const abx = b[0] - a[0];
    const aby = b[1] - a[1];
    const len2 = abx * abx + aby * aby;
    const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * abx + (p[1] - a[1]) * aby) / len2));
    const proj: [number, number] = [a[0] + t * abx, a[1] + t * aby];
    const dx = p[0] - proj[0];
    const dy = p[1] - proj[1];
    const d2 = dx * dx + dy * dy;
    if (!best || d2 < best.d2) {
      best = { d2, t, i, point: proj };
    }
  }

  const b = best!;
  const snapped: LngLat = [b.point[0] / mLng, b.point[1] / EARTH_M_PER_DEG_LAT];
  const cumulative = cumulativeDistances(coords);
  const segLen = cumulative[b.i + 1] - cumulative[b.i];
  return {
    snapped,
    segmentIndex: b.i,
    distanceAlong: cumulative[b.i] + segLen * b.t,
    distanceToRoute: Math.sqrt(b.d2),
    segmentBearing: bearing(coords[b.i], coords[b.i + 1]),
  };
}

/** Distancia restante (m) desde el punto proyectado hasta el final de la ruta. */
export function distanceRemaining(coords: LngLat[], projection: RouteProjection): number {
  const total = cumulativeDistances(coords);
  return Math.max(0, total[total.length - 1] - projection.distanceAlong);
}

/** Tiempo estimado caminando en minutos (paso turístico en altura: ~1.1 m/s). */
export function walkingEtaMinutes(distanceMeters: number, speedMps = 1.1): number {
  return Math.max(1, Math.round(distanceMeters / speedMps / 60));
}

/**
 * Divide la ruta en tramo recorrido y por recorrer según la proyección,
 * para pintar el progreso en el mapa.
 */
export function splitRouteAt(
  coords: LngLat[],
  projection: RouteProjection,
): { done: LngLat[]; remaining: LngLat[] } {
  const { segmentIndex, snapped } = projection;
  const done = [...coords.slice(0, segmentIndex + 1), snapped];
  const remaining = [snapped, ...coords.slice(segmentIndex + 1)];
  return { done, remaining };
}
