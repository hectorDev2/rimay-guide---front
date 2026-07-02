import type { Poi } from './pois';

/** Haversine distance between two coordinates in meters */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export type ProximityLevel = 'far' | 'near' | 'arrived';

export interface ProximityResult {
  poi: Poi;
  distance: number;
  level: ProximityLevel;
}

const NEAR_THRESHOLD = 100; // meters
const ARRIVED_THRESHOLD = 30; // meters

/** Check proximity of a position against all POIs */
export function checkProximity(
  latitude: number,
  longitude: number,
  pois: Poi[],
): ProximityResult[] {
  return pois
    .map((poi) => {
      const distance = haversineDistance(
        latitude,
        longitude,
        poi.latitude,
        poi.longitude,
      );

      let level: ProximityLevel = 'far';
      if (distance <= poi.geofenceRadius) {
        level = 'arrived';
      } else if (distance <= NEAR_THRESHOLD) {
        level = 'near';
      }

      return { poi, distance, level };
    })
    .filter((r) => r.level !== 'far')
    .sort((a, b) => a.distance - b.distance);
}

/** Get the single nearest arrived POI, if any */
export function findActivePoi(
  latitude: number,
  longitude: number,
  pois: Poi[],
): ProximityResult | null {
  const results = checkProximity(latitude, longitude, pois);
  return results.find((r) => r.level === 'arrived') ?? null;
}

/** Generate a square polygon around a point for Mapbox fill-extrusion */
export function createExtrusionPolygon(
  latitude: number,
  longitude: number,
  sizeMeters: number = 20,
): number[][][] {
  const latDelta = (sizeMeters / 2) / 111320;
  const lonDelta = (sizeMeters / 2) / (111320 * Math.cos((latitude * Math.PI) / 180));

  return [[
    [longitude - lonDelta, latitude - latDelta],
    [longitude + lonDelta, latitude - latDelta],
    [longitude + lonDelta, latitude + latDelta],
    [longitude - lonDelta, latitude + latDelta],
    [longitude - lonDelta, latitude - latDelta],
  ]];
}
