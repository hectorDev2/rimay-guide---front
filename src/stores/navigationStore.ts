import { create } from 'zustand';
import type { LngLat } from '@/lib/map/route';

export type NavigationMode = 'idle' | 'walking' | 'arriving' | 'arrived';

export interface GuideCapsule {
  id: number;
  text: string;
  tone: 'info' | 'warning' | 'celebration';
}

interface NavigationState {
  mode: NavigationMode;
  /** id de la parada objetivo actual */
  targetStopId: string | null;
  /** Posición suavizada y proyectada sobre la ruta [lng, lat] */
  snappedPosition: LngLat | null;
  /** Posición cruda suavizada (para la línea de reincorporación) */
  rawPosition: LngLat | null;
  /** Rumbo de movimiento suavizado (0–360) */
  heading: number;
  distanceToStop: number | null;
  etaMinutes: number | null;
  /** Ruta activa hacia la parada objetivo */
  routeCoords: LngLat[];
  offRoute: boolean;
  wrongDirection: boolean;
  gpsWeak: boolean;
  capsule: GuideCapsule | null;
  /** false cuando el usuario arrastró el mapa manualmente */
  followCamera: boolean;
  /** Última parada cuya llegada ya se anunció (evita re-disparos al volver del player) */
  lastArrivedStopId: string | null;

  setMode: (mode: NavigationMode) => void;
  setTargetStop: (id: string | null) => void;
  setTracking: (t: {
    snappedPosition: LngLat;
    rawPosition: LngLat;
    heading: number;
    distanceToStop: number;
    etaMinutes: number;
    offRoute: boolean;
    wrongDirection: boolean;
    gpsWeak: boolean;
  }) => void;
  setRouteCoords: (coords: LngLat[]) => void;
  showCapsule: (text: string, tone?: GuideCapsule['tone']) => void;
  dismissCapsule: () => void;
  setFollowCamera: (follow: boolean) => void;
  setLastArrivedStopId: (id: string | null) => void;
  reset: () => void;
}

let capsuleSeq = 0;

export const useNavigationStore = create<NavigationState>((set) => ({
  mode: 'idle',
  targetStopId: null,
  snappedPosition: null,
  rawPosition: null,
  heading: 0,
  distanceToStop: null,
  etaMinutes: null,
  routeCoords: [],
  offRoute: false,
  wrongDirection: false,
  gpsWeak: false,
  capsule: null,
  followCamera: true,
  lastArrivedStopId: null,

  setMode: (mode) => set({ mode }),
  setTargetStop: (id) => set({ targetStopId: id }),
  setTracking: (t) => set(t),
  setRouteCoords: (coords) => set({ routeCoords: coords }),
  showCapsule: (text, tone = 'info') =>
    set({ capsule: { id: ++capsuleSeq, text, tone } }),
  dismissCapsule: () => set({ capsule: null }),
  setFollowCamera: (follow) => set({ followCamera: follow }),
  setLastArrivedStopId: (id) => set({ lastArrivedStopId: id }),
  reset: () =>
    set({
      mode: 'idle',
      targetStopId: null,
      snappedPosition: null,
      rawPosition: null,
      heading: 0,
      distanceToStop: null,
      etaMinutes: null,
      routeCoords: [],
      offRoute: false,
      wrongDirection: false,
      gpsWeak: false,
      capsule: null,
      followCamera: true,
      lastArrivedStopId: null,
    }),
}));
