import { motion } from 'motion/react';
import { Play, Pause } from 'lucide-react';
import { useAudioStore } from '@/stores/audioStore';
import { useTourStore } from '@/stores/tourStore';

export function MiniPlayer() {
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const currentStopId = useAudioStore((s) => s.currentStopId);
  const currentStopName = useAudioStore((s) => s.currentStopName);
  const currentTime = useAudioStore((s) => s.currentTime);
  const duration = useAudioStore((s) => s.duration);
  const togglePlay = useAudioStore((s) => s.togglePlay);
  const audioRef = useAudioStore((s) => s.audioRef);

  const tour = useTourStore((s) => s.tour);
  const completedIds = useTourStore((s) => s.completedIds);

  if (!currentStopId || !isPlaying) return null;

  const totalStops = tour?.stops.length ?? 0;
  const currentIndex = tour?.stops.findIndex((s) => s.id === currentStopId) ?? -1;
  const stopNumber = currentIndex >= 0 ? currentIndex + 1 : 0;

  const fmt = (s: number) => {
    if (!s || !isFinite(s)) return '0:00';
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audioRef.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-[999] px-4 pb-[calc(env(safe-area-inset-bottom,0px)+12px)] pt-2"
    >
      <div className="bg-[#171717] border border-[#2C2C2C] rounded-[22px] px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-[#D4A843] flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-[#111111]" fill="#111111" />
            ) : (
              <Play className="w-5 h-5 text-[#111111] ml-0.5" fill="#111111" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-white text-[13px] font-medium truncate">{currentStopName}</p>
              <span className="text-[#6E6E6E] text-[11px] font-mono tabular-nums flex-shrink-0">
                {stopNumber}/{totalStops}
              </span>
            </div>
            <div
              className="h-1 bg-[#1E1E1E] rounded-full overflow-hidden mt-1.5 cursor-pointer"
              onClick={seek}
            >
              <div
                className="h-full bg-[#D4A843] rounded-full transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <span className="text-[#6E6E6E] text-[11px] font-mono tabular-nums flex-shrink-0">
            {fmt(currentTime)} / {fmt(duration)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
