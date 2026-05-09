import { create } from 'zustand';

interface Position {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface LocationState {
  position: Position | null;
  error: string | null;
  isWatching: boolean;
  activeStopId: string | null;
  setPosition: (position: Position) => void;
  setError: (error: string | null) => void;
  setWatching: (value: boolean) => void;
  setActiveStop: (stopId: string | null) => void;
  stopWatching: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  position: null,
  error: null,
  isWatching: false,
  activeStopId: null,

  setPosition: (position) => set({ position, error: null }),

  setError: (error) => set({ error }),

  setWatching: (value) => set({ isWatching: value }),

  setActiveStop: (stopId) => set({ activeStopId: stopId }),

  stopWatching: () => set({ isWatching: false, activeStopId: null }),
}));
