import { create } from 'zustand';

interface AudioState {
  isPlaying: boolean;
  currentStopId: string | null;
  currentStopName: string;
  currentTime: number;
  duration: number;
  audioRef: HTMLAudioElement | null;
  setPlaying: (playing: boolean) => void;
  setCurrentStop: (id: string, name: string) => void;
  setTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setAudioRef: (ref: HTMLAudioElement | null) => void;
  togglePlay: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  isPlaying: false,
  currentStopId: null,
  currentStopName: '',
  currentTime: 0,
  duration: 0,
  audioRef: null,

  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentStop: (id, name) => set({ currentStopId: id, currentStopName: name }),
  setTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setAudioRef: (ref) => set({ audioRef: ref }),

  togglePlay: () => {
    const { isPlaying, audioRef } = get();
    if (!audioRef) return;
    if (isPlaying) {
      audioRef.pause();
      set({ isPlaying: false });
    } else {
      audioRef.play().catch(() => set({ isPlaying: false }));
      set({ isPlaying: true });
    }
  },
}));
