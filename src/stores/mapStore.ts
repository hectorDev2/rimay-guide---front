import { create } from 'zustand';
import type { Poi } from '@/lib/map/pois';

interface MapState {
  /** Mapbox initialized */
  isReady: boolean;
  /** IDs of POIs the user has discovered (been within geofence) */
  discoveredPoiIds: Set<string>;
  /** Currently active POI (user is within geofence or clicked) */
  activePoi: Poi | null;
  /** Show info popup for active POI */
  showPopup: boolean;
  /** Map center coordinates [lng, lat] */
  center: [number, number];
  zoom: number;
  pitch: number;
  /** Set this to a POI id to trigger a flyTo animation (cleared after flight) */
  pendingFlyToPoiId: string | null;

  setReady: (ready: boolean) => void;
  markDiscovered: (poiId: string) => void;
  setActivePoi: (poi: Poi | null) => void;
  setShowPopup: (show: boolean) => void;
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setPitch: (pitch: number) => void;
  /** Trigger flyTo animation + set active POI */
  flyToPoi: (poi: Poi) => void;
  /** Cleared by TourMap after executing flyTo */
  clearPendingFlyTo: () => void;
  resetMap: () => void;
}

const DEFAULT_CENTER: [number, number] = [-71.9815, -13.5075];
const DEFAULT_ZOOM = 15;
const DEFAULT_PITCH = 45;

export const useMapStore = create<MapState>((set) => ({
  isReady: false,
  discoveredPoiIds: new Set<string>(),
  activePoi: null,
  showPopup: false,
  center: DEFAULT_CENTER,
  zoom: DEFAULT_ZOOM,
  pitch: DEFAULT_PITCH,
  pendingFlyToPoiId: null,

  setReady: (ready) => set({ isReady: ready }),

  markDiscovered: (poiId) =>
    set((s) => {
      const next = new Set(s.discoveredPoiIds);
      next.add(poiId);
      return { discoveredPoiIds: next };
    }),

  setActivePoi: (poi) => set({ activePoi: poi, showPopup: poi !== null }),

  setShowPopup: (show) => set({ showPopup: show }),

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setPitch: (pitch) => set({ pitch }),

  flyToPoi: (poi) =>
    set({
      pendingFlyToPoiId: poi.id,
      activePoi: poi,
      showPopup: true,
    }),

  clearPendingFlyTo: () => set({ pendingFlyToPoiId: null }),

  resetMap: () =>
    set({
      activePoi: null,
      showPopup: false,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      pitch: DEFAULT_PITCH,
      pendingFlyToPoiId: null,
    }),
}));
