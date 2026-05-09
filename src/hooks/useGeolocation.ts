import { useEffect, useRef } from 'react';
import { useLocationStore } from '@/stores/locationStore';
import { useTourStore, type TourStop } from '@/stores/tourStore';

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
): string | null {
  let nearest: { id: string; distance: number } | null = null;

  for (const stop of stops) {
    if (stop.isCompleted) continue;
    const distance = calculateDistance(lat, lon, stop.latitude, stop.longitude);
    if (distance <= stop.radiusMeters) {
      if (!nearest || distance < nearest.distance) {
        nearest = { id: stop.id, distance };
      }
    }
  }

  return nearest?.id ?? null;
}

interface UseGeolocationOptions {
  enabled?: boolean;
  highAccuracy?: boolean;
  interval?: number;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const { enabled = false, highAccuracy = true, interval = 5000 } = options;
  const watchIdRef = useRef<number | null>(null);
  const stopsRef = useRef<TourStop[]>([]);
  const tourRef = useRef(useTourStore.getState().tour);

  useTourStore((s) => {
    stopsRef.current = s.tour?.stops ?? [];
    tourRef.current = s.tour;
    return null;
  });

  const setPosition = useLocationStore((s) => s.setPosition);
  const setError = useLocationStore((s) => s.setError);
  const setWatching = useLocationStore((s) => s.setWatching);
  const setActiveStop = useLocationStore((s) => s.setActiveStop);
  const setCurrentStopIndex = useTourStore((s) => s.setCurrentStopIndex);

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
      const currentTour = tourRef.current;

      const position = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: pos.timestamp,
      };

      setPosition(position);

      if (currentStops.length > 0 && now - lastCheck >= interval) {
        lastCheck = now;
        const nearestId = findNearestStopInRange(
          position.latitude,
          position.longitude,
          currentStops,
        );
        setActiveStop(nearestId);

        if (nearestId && currentTour) {
          const index = currentTour.stops.findIndex((s) => s.id === nearestId);
          if (index !== -1) {
            setCurrentStopIndex(index);
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

    setWatching(true);
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
      setWatching(false);
      setActiveStop(null);
    };
  }, [enabled, highAccuracy, interval, setPosition, setError, setWatching, setActiveStop, setCurrentStopIndex]);
}
