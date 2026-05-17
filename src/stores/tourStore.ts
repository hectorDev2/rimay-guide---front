import { create } from 'zustand';
import type { Tour } from '@/lib/tour/types';

interface TourState {
  tour: Tour | null;
  currentStopIndex: number;
  completedIds: string[];
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
  completedIds: [],
  isDownloaded: false,
  downloadProgress: 0,
  isDownloading: false,

  setTour: (tour) => set({ tour, currentStopIndex: 0 }),

  setCurrentStopIndex: (index) => set({ currentStopIndex: index }),

  markStopCompleted: (stopId) => {
    const id = stopId;
    set((s) => ({
      completedIds: s.completedIds.includes(id)
        ? s.completedIds
        : [...s.completedIds, id],
    }));
  },

  setDownloaded: (value) => set({ isDownloaded: value }),

  setDownloadProgress: (progress) => set({ downloadProgress: progress }),

  setDownloading: (value) => set({ isDownloading: value }),

  reset: () =>
    set({
      tour: null,
      currentStopIndex: 0,
      completedIds: [],
      isDownloaded: false,
      downloadProgress: 0,
      isDownloading: false,
    }),
}));
