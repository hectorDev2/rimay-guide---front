import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronUp } from 'lucide-react';

interface AudioPlayerProps {
  onShowStopsList: () => void;
}

export function AudioPlayer({ onShowStopsList }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(272);
  const totalTime = 375;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = (currentTime / totalTime) * 100;

  return (
    <div className="h-full relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center blur-xl scale-110"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=50)',
        }}
      ></div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/80"></div>

      <div className="relative h-full flex flex-col p-6">
        <div className="flex justify-between items-start mb-auto">
          <div>
            <h2 className="text-3xl text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              Plaza del Inca
            </h2>
            <p className="text-white/70 text-sm">Parada 3 · Sacsayhuamán</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
            <span className="text-white text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-[var(--sage-green)] rounded-full"></span>
              Sin conexión
            </span>
          </div>
        </div>

        <div className="mb-8">
          <div className="h-16 flex items-center justify-center mb-4 opacity-40">
            <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
              {[...Array(60)].map((_, i) => {
                const height = Math.random() * 30 + 10;
                const opacity = i < (60 * progressPercent / 100) ? 1 : 0.3;
                return (
                  <rect
                    key={i}
                    x={i * 3.3}
                    y={20 - height / 2}
                    width="2"
                    height={height}
                    fill="var(--inca-gold)"
                    opacity={opacity}
                  />
                );
              })}
            </svg>
          </div>

          <div className="mb-2">
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--inca-gold)] transition-all"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="flex justify-between text-white/80 text-sm">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(totalTime)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mb-8">
          <button className="text-white/80 hover:text-white transition-colors">
            <SkipBack className="w-8 h-8" />
          </button>

          <button className="text-white/80 hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M11 5L6 9v10l5 4" />
              <text x="14" y="17" fontSize="10" fill="currentColor">15</text>
            </svg>
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-20 h-20 rounded-full bg-[var(--inca-gold)] flex items-center justify-center hover:bg-[#B8A038] transition-colors shadow-2xl"
          >
            {isPlaying ? (
              <Pause className="w-10 h-10 text-white" fill="white" />
            ) : (
              <Play className="w-10 h-10 text-white ml-1" fill="white" />
            )}
          </button>

          <button className="text-white/80 hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M13 19l5-4V5l-5-4" />
              <text x="4" y="17" fontSize="10" fill="currentColor">15</text>
            </svg>
          </button>

          <button className="text-white/80 hover:text-white transition-colors">
            <SkipForward className="w-8 h-8" />
          </button>
        </div>

        <button
          onClick={onShowStopsList}
          className="bg-white/10 backdrop-blur-md rounded-t-3xl p-4 flex items-center justify-between hover:bg-white/20 transition-colors"
        >
          <span className="text-white">Siguiente: La Gran Plaza</span>
          <ChevronUp className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
