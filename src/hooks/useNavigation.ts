import { useEffect, useMemo, useRef } from 'react';
import { useLocationStore } from '@/stores/locationStore';
import { useTourStore } from '@/stores/tourStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { haversineDistance } from '@/lib/map/geofence';
import {
  bearing,
  bearingDiff,
  projectOnRoute,
  distanceRemaining,
  walkingEtaMinutes,
  type LngLat,
} from '@/lib/map/route';
import { routeToStop } from '@/lib/tour/route';
import { fetchWalkingRoute } from '@/lib/map/directions';
import { guideMessage } from '@/lib/tour/guideMessages';
import type { TourStop } from '@/lib/tour/types';

/**
 * Fija primero la ruta local (instantánea, offline) y luego la reemplaza por
 * la ruta peatonal real de Directions si sigue vigente la misma parada.
 */
function setRouteWithDirections(
  nav: typeof useNavigationStore,
  anchor: LngLat,
  prevStop: TourStop | null,
  targetStop: TourStop,
) {
  nav.getState().setRouteCoords(routeToStop(anchor, prevStop, targetStop));

  const targetId = targetStop.id;
  fetchWalkingRoute(anchor, [targetStop.longitude, targetStop.latitude]).then((real) => {
    if (real && nav.getState().targetStopId === targetId) {
      nav.getState().setRouteCoords(real);
    }
  });
}

const ACCURACY_DISCARD_M = 60;
const ACCURACY_WEAK_M = 45;
const SNAP_MAX_M = 30;
const OFF_ROUTE_M = 40;
const OFF_ROUTE_SUSTAIN_MS = 15_000;
const WRONG_DIR_DEG = 120;
const WRONG_DIR_SUSTAIN_MS = 10_000;
const MOVE_MIN_M = 1.5;
const SMOOTH_ALPHA = 0.45;

export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

/** Suaviza un ángulo hacia otro por el camino corto. */
function smoothHeading(prev: number, next: number, alpha = 0.35): number {
  let delta = ((next - prev + 540) % 360) - 180;
  return (prev + delta * alpha + 360) % 360;
}

interface UseNavigationOptions {
  enabled: boolean;
  /** Llamado una sola vez al detectar llegada a la parada objetivo. */
  onArrive?: (stop: TourStop) => void;
}

/**
 * Modo Caminata: consume la posición GPS, la suaviza, la proyecta sobre la
 * ruta pre-computada y deriva todo el estado de navegación (distancia, ETA,
 * rumbo, desvíos, llegada). Sin APIs externas — geometría local.
 */
export function useNavigation({ enabled, onArrive }: UseNavigationOptions) {
  const position = useLocationStore((s) => s.position);
  const tour = useTourStore((s) => s.tour);
  const completedIds = useTourStore((s) => s.completedIds);

  const nav = useNavigationStore;

  const smoothedRef = useRef<LngLat | null>(null);
  const headingRef = useRef<number | null>(null);
  const anchorRef = useRef<LngLat | null>(null);
  const offRouteSinceRef = useRef<number | null>(null);
  const wrongDirSinceRef = useRef<number | null>(null);
  const weakSinceRef = useRef<number | null>(null);
  const arrivedRef = useRef(false);
  const milestonesRef = useRef({ start: false, approaching: false, almost: false });
  const onArriveRef = useRef(onArrive);
  onArriveRef.current = onArrive;

  const stops = useMemo(
    () => (tour ? [...tour.stops].sort((a, b) => a.order - b.order) : []),
    [tour],
  );

  const targetStop = useMemo(
    () => stops.find((s) => !completedIds.includes(s.id)) ?? null,
    [stops, completedIds],
  );

  const prevStop = useMemo(() => {
    if (!targetStop) return null;
    const idx = stops.findIndex((s) => s.id === targetStop.id);
    const prev = idx > 0 ? stops[idx - 1] : null;
    return prev && completedIds.includes(prev.id) ? prev : null;
  }, [stops, targetStop, completedIds]);

  // Nueva parada objetivo → resetear hitos y ruta
  useEffect(() => {
    if (!enabled || !targetStop) return;
    arrivedRef.current = false;
    milestonesRef.current = { start: false, approaching: false, almost: false };
    nav.getState().setTargetStop(targetStop.id);
    nav.getState().setMode('walking');

    const anchor = anchorRef.current ?? smoothedRef.current;
    if (anchor || prevStop) {
      setRouteWithDirections(
        nav,
        anchor ?? [prevStop!.longitude, prevStop!.latitude],
        prevStop,
        targetStop,
      );
    }
    const event = prevStop ? 'resume' : 'start';
    nav.getState().showCapsule(guideMessage(event, { stop: targetStop.name }));
  }, [enabled, targetStop, prevStop, nav]);

  // Procesar cada actualización de posición
  useEffect(() => {
    if (!enabled || !position || !targetStop) return;
    if (position.accuracy > ACCURACY_DISCARD_M) return;

    const now = Date.now();
    const raw: LngLat = [position.longitude, position.latitude];

    // --- Suavizado exponencial ---
    const prev = smoothedRef.current;
    const smoothed: LngLat = prev
      ? [
          prev[0] + (raw[0] - prev[0]) * SMOOTH_ALPHA,
          prev[1] + (raw[1] - prev[1]) * SMOOTH_ALPHA,
        ]
      : raw;
    smoothedRef.current = smoothed;

    // --- Anclar ruta al primer fix (tour sin parada previa) ---
    if (!anchorRef.current) {
      anchorRef.current = smoothed;
      setRouteWithDirections(nav, smoothed, prevStop, targetStop);
    }

    const route = nav.getState().routeCoords;
    if (route.length < 2) return;

    // --- Proyección sobre la ruta ---
    const proj = projectOnRoute(route, smoothed);
    const onRoute = proj.distanceToRoute <= SNAP_MAX_M;
    const displayPos = onRoute ? proj.snapped : smoothed;

    // --- Rumbo de movimiento ---
    let heading = headingRef.current ?? proj.segmentBearing;
    let moving = false;
    if (prev) {
      const movedM = haversineDistance(prev[1], prev[0], smoothed[1], smoothed[0]);
      if (movedM >= MOVE_MIN_M) {
        moving = true;
        heading = smoothHeading(heading, bearing(prev, smoothed));
      }
    }
    headingRef.current = heading;

    // --- Distancia y ETA ---
    const distAlong = distanceRemaining(route, proj);
    const distDirect = haversineDistance(
      smoothed[1], smoothed[0],
      targetStop.latitude, targetStop.longitude,
    );
    const distance = onRoute ? distAlong : distDirect;

    // --- Desvíos sostenidos ---
    if (!onRoute && proj.distanceToRoute > OFF_ROUTE_M) {
      offRouteSinceRef.current ??= now;
    } else {
      offRouteSinceRef.current = null;
    }
    const offRoute =
      offRouteSinceRef.current !== null &&
      now - offRouteSinceRef.current >= OFF_ROUTE_SUSTAIN_MS;

    if (moving && onRoute && bearingDiff(heading, proj.segmentBearing) > WRONG_DIR_DEG) {
      wrongDirSinceRef.current ??= now;
    } else {
      wrongDirSinceRef.current = null;
    }
    const wrongDirection =
      wrongDirSinceRef.current !== null &&
      now - wrongDirSinceRef.current >= WRONG_DIR_SUSTAIN_MS;

    if (position.accuracy > ACCURACY_WEAK_M) {
      weakSinceRef.current ??= now;
    } else {
      weakSinceRef.current = null;
    }
    const gpsWeak =
      weakSinceRef.current !== null && now - weakSinceRef.current >= 8_000;

    const state = nav.getState();
    const prevFlags = {
      offRoute: state.offRoute,
      wrongDirection: state.wrongDirection,
      gpsWeak: state.gpsWeak,
    };

    state.setTracking({
      snappedPosition: displayPos,
      rawPosition: smoothed,
      heading,
      distanceToStop: Math.round(distance),
      etaMinutes: walkingEtaMinutes(distance),
      offRoute,
      wrongDirection,
      gpsWeak,
    });

    // --- Mensajes del guía (una vez por transición) ---
    if (wrongDirection && !prevFlags.wrongDirection) {
      vibrate(300);
      state.showCapsule(guideMessage('wrong_direction', { stop: targetStop.name }), 'warning');
    } else if (offRoute && !prevFlags.offRoute) {
      vibrate(300);
      state.showCapsule(guideMessage('off_route'), 'warning');
    } else if (gpsWeak && !prevFlags.gpsWeak) {
      state.showCapsule(guideMessage('gps_weak'), 'info');
    }

    const m = milestonesRef.current;
    const roundedDist = Math.round(distance / 10) * 10;
    if (!m.approaching && distance <= 100 && distance > 45) {
      m.approaching = true;
      vibrate(100);
      state.showCapsule(guideMessage('approaching', { stop: targetStop.name, m: roundedDist }));
    } else if (!m.almost && distance <= 45 && distance > 25) {
      m.almost = true;
      state.showCapsule(guideMessage('almost', { m: roundedDist }));
      state.setMode('arriving');
    }

    // --- Llegada ---
    const arriveRadius = Math.max(20, targetStop.radiusMeters);
    if (
      !arrivedRef.current &&
      distDirect <= arriveRadius &&
      position.accuracy < 40 &&
      state.lastArrivedStopId !== targetStop.id
    ) {
      arrivedRef.current = true;
      vibrate([100, 50, 100]);
      state.setMode('arrived');
      state.setLastArrivedStopId(targetStop.id);
      state.showCapsule(guideMessage('arrived', { stop: targetStop.name }), 'celebration');
      onArriveRef.current?.(targetStop);
    }
  }, [enabled, position, targetStop, prevStop, nav]);

  // Limpiar al desmontar / deshabilitar
  useEffect(() => {
    if (enabled) return;
    smoothedRef.current = null;
    headingRef.current = null;
    anchorRef.current = null;
  }, [enabled]);

  return { targetStop, prevStop, allCompleted: stops.length > 0 && !targetStop };
}
