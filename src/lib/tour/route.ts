import type { Tour, TourStop } from './types';
import type { LngLat } from '@/lib/map/route';

/**
 * Waypoints intermedios pre-computados entre paradas (senderos reales).
 * Clave: `${fromStopId}->${toStopId}`. Si un tramo no está aquí, la ruta
 * conecta las paradas en línea recta — suficiente dentro del complejo.
 */
const SEGMENT_WAYPOINTS: Record<string, LngLat[]> = {
  'murallas-ciclopeas->torreon-muyucmarca': [[-71.9818, -13.5081]],
  'sacsayhuaman-fortaleza->plaza-del-inca': [[-71.9828, -13.5072]],
  'plaza-del-inca->templo-de-la-luna': [[-71.9826, -13.5063]],
};

const toLngLat = (s: TourStop): LngLat => [s.longitude, s.latitude];

/** Polilínea de la ruta entre dos paradas consecutivas (incluye ambas). */
export function segmentCoords(from: TourStop, to: TourStop): LngLat[] {
  const via = SEGMENT_WAYPOINTS[`${from.id}->${to.id}`] ?? [];
  return [toLngLat(from), ...via, toLngLat(to)];
}

/** Polilínea completa del tour, en orden de paradas. */
export function fullTourRoute(tour: Tour): LngLat[] {
  const stops = [...tour.stops].sort((a, b) => a.order - b.order);
  const coords: LngLat[] = [toLngLat(stops[0])];
  for (let i = 0; i < stops.length - 1; i++) {
    coords.push(...segmentCoords(stops[i], stops[i + 1]).slice(1));
  }
  return coords;
}

/**
 * Ruta activa hacia la parada objetivo. Con parada previa usa el tramo
 * curado; sin ella (inicio del tour) ancla una línea directa desde la
 * posición inicial del usuario. Sin Directions API — geometría local.
 */
export function routeToStop(anchor: LngLat, from: TourStop | null, to: TourStop): LngLat[] {
  if (from) return segmentCoords(from, to);
  return [anchor, toLngLat(to)];
}
