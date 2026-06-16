import { useEffect, useRef } from 'react';
import { useLocationStore } from '@/stores/locationStore';
import { useTourStore } from '@/stores/tourStore';
import type { TourStop } from '@/lib/tour/types';

function calculateDistance(
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

function findNearestStopInRange(
  lat: number,
  lon: number,
  stops: TourStop[],
): TourStop | null {
  let nearest: { stop: TourStop; distance: number } | null = null;

  for (const stop of stops) {
    if (stop.status === 'completed') continue;
    const distance = calculateDistance(lat, lon, stop.latitude, stop.longitude);
    if (distance <= 25) {
      if (!nearest || distance < nearest.distance) {
        nearest = { stop, distance };
      }
    }
  }

  return nearest?.stop ?? null;
}

interface NearbyResult {
  stop: TourStop;
  distance: number;
}

function findNearbyStop(
  lat: number,
  lon: number,
  stops: TourStop[],
): NearbyResult | null {
  let nearest: NearbyResult | null = null;

  for (const stop of stops) {
    const distance = calculateDistance(lat, lon, stop.latitude, stop.longitude);
    if (distance <= 100 && distance > 25) {
      if (!nearest || distance < nearest.distance) {
        nearest = { stop, distance };
      }
    }
  }

  return nearest;
}

interface UseGeolocationOptions {
  enabled?: boolean;
  highAccuracy?: boolean;
  interval?: number;
  stops?: TourStop[];
  onEnterStop?: (stopId: string) => void;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const { enabled = false, highAccuracy = true, interval = 5000, stops = [], onEnterStop } = options;
  const watchIdRef = useRef<number | null>(null);
  const stopsRef = useRef<TourStop[]>(stops);
  const onEnterStopRef = useRef(onEnterStop);
  const lastActiveRef = useRef<string | null>(null);

  stopsRef.current = stops;
  onEnterStopRef.current = onEnterStop;

  const setPosition = useLocationStore((s) => s.setPosition);
  const setError = useLocationStore((s) => s.setError);
  const setActiveStop = useLocationStore((s) => s.setActiveStop);
  const setNearbyStop = useLocationStore((s) => s.setNearbyStop);

  useEffect(() => {
    if (!enabled || !('geolocation' in navigator)) {
      if (!('geolocation' in navigator)) {
        setError('Geolocalización no disponible en este dispositivo');
      }
      return;
    }

    let lastCheck = 0;

    const handleSuccess = (pos: GeolocationPosition) => {
      const now = Date.now();
      const currentStops = stopsRef.current;

      const position = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: pos.timestamp,
      };

      setPosition(position);

      if (currentStops.length > 0 && now - lastCheck >= interval) {
        lastCheck = now;
        const nearest = findNearestStopInRange(
          position.latitude,
          position.longitude,
          currentStops,
        );

        if (nearest) {
          setActiveStop(String(nearest.id));
          setNearbyStop(null);

          if (nearest.id !== lastActiveRef.current) {
            lastActiveRef.current = nearest.id;
            onEnterStopRef.current?.(nearest.id);
          }
        } else {
          setActiveStop(null);
          lastActiveRef.current = null;

          const nearby = findNearbyStop(
            position.latitude,
            position.longitude,
            currentStops,
          );
          if (nearby) {
            setNearbyStop({ id: nearby.stop.id, name: nearby.stop.name, distance: Math.round(nearby.distance) });
          } else {
            setNearbyStop(null);
          }
        }
      }
    };

    const handleError = (err: GeolocationPositionError) => {
      const messages: Record<number, string> = {
        [err.PERMISSION_DENIED]: 'Permiso de ubicación denegado',
        [err.POSITION_UNAVAILABLE]: 'Ubicación no disponible',
        [err.TIMEOUT]: 'Tiempo de espera agotado al obtener ubicación',
      };
      setError(messages[err.code] ?? 'Error desconocido de geolocalización');
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: highAccuracy,
        maximumAge: interval,
        timeout: 10000,
      },
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      lastActiveRef.current = null;
    };
  }, [enabled, highAccuracy, interval, setPosition, setError, setActiveStop]);
}
