import type { LngLat } from './route';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

/**
 * Cache en memoria por origen→destino redondeado (~11 m de precisión),
 * para no repetir requests al recalcular con cada fix del GPS.
 */
const cache = new Map<string, LngLat[]>();

function cacheKey(from: LngLat, to: LngLat): string {
  const r = (n: number) => n.toFixed(4);
  return `${r(from[0])},${r(from[1])}->${r(to[0])},${r(to[1])}`;
}

/**
 * Ruta peatonal real (calles, esquinas, senderos) vía Mapbox Directions API.
 * Devuelve la polilínea [lng, lat][] o null si no hay token, red o ruta —
 * el caller mantiene la geometría local como fallback.
 */
export async function fetchWalkingRoute(from: LngLat, to: LngLat): Promise<LngLat[] | null> {
  if (!MAPBOX_TOKEN) return null;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return null;

  const key = cacheKey(from, to);
  const cached = cache.get(key);
  if (cached) return cached;

  const coords = `${from[0]},${from[1]};${to[0]},${to[1]}`;
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/walking/${coords}` +
    `?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      routes?: { geometry?: { coordinates?: [number, number][] } }[];
    };
    const line = json.routes?.[0]?.geometry?.coordinates;
    if (!Array.isArray(line) || line.length < 2) return null;

    // Asegurar que la ruta llegue exactamente al destino (Directions ajusta
    // el final a la vía más cercana; el último tramo va directo a la parada).
    const result: LngLat[] = [...(line as LngLat[]), to];
    cache.set(key, result);
    return result;
  } catch {
    return null;
  }
}
