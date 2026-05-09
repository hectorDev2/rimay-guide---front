import { create } from 'zustand';

export interface TourStop {
  id: string;
  order: number;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  audioSrc: string;
  durationSeconds: number;
  isCompleted: boolean;
}

interface Tour {
  id: string;
  slug: string;
  name: string;
  description: string;
  totalDurationMinutes: number;
  stops: TourStop[];
}

interface TourState {
  tour: Tour | null;
  currentStopIndex: number;
  isDownloaded: boolean;
  downloadProgress: number;
  isDownloading: boolean;
  setTour: (tour: Tour) => void;
  setCurrentStopIndex: (index: number) => void;
  markStopCompleted: (stopId: string) => void;
  setDownloaded: (value: boolean) => void;
  setDownloadProgress: (progress: number) => void;
  setDownloading: (value: boolean) => void;
  reset: () => void;
}

export const useTourStore = create<TourState>((set, get) => ({
  tour: null,
  currentStopIndex: 0,
  isDownloaded: false,
  downloadProgress: 0,
  isDownloading: false,

  setTour: (tour) => set({ tour, currentStopIndex: 0 }),

  setCurrentStopIndex: (index) => set({ currentStopIndex: index }),

  markStopCompleted: (stopId) => {
    const tour = get().tour;
    if (!tour) return;
    set({
      tour: {
        ...tour,
        stops: tour.stops.map((s) =>
          s.id === stopId ? { ...s, isCompleted: true } : s,
        ),
      },
    });
  },

  setDownloaded: (value) => set({ isDownloaded: value }),

  setDownloadProgress: (progress) => set({ downloadProgress: progress }),

  setDownloading: (value) => set({ isDownloading: value }),

  reset: () =>
    set({
      tour: null,
      currentStopIndex: 0,
      isDownloaded: false,
      downloadProgress: 0,
      isDownloading: false,
    }),
}));
