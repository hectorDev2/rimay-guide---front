const WAVEFORM_BARS = 48;
const WAVEFORM_HEIGHTS = Array.from({ length: WAVEFORM_BARS }, () => Math.random() * 60 + 20);

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, ChevronUp, Plus, X, MessageSquare, Lightbulb, HelpCircle, ArrowLeft } from 'lucide-react';
import { useTourStore } from '@/stores/tourStore';
import { useAudioStore } from '@/stores/audioStore';
import type { TourStopDisplay } from './TourStopsList';

interface AudioPlayerProps {
  stop: TourStopDisplay;
  onShowStopsList: () => void;
  onNext: () => void;
  onPrev: () => void;
  nextStopName?: string;
  onBack?: () => void;
}

export function AudioPlayer({ stop, onShowStopsList, onNext, onPrev, nextStopName, onBack }: AudioPlayerProps) {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showWidgets, setShowWidgets] = useState(false);
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const [seekHoverTime, setSeekHoverTime] = useState<{ x: number; time: string } | null>(null);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const markStopCompleted = useTourStore((s) => s.markStopCompleted);
  const storeSetPlaying = useAudioStore((s) => s.setPlaying);
  const storeSetCurrentStop = useAudioStore((s) => s.setCurrentStop);
  const storeSetTime = useAudioStore((s) => s.setTime);
  const storeSetDuration = useAudioStore((s) => s.setDuration);
  const storeSetAudioRef = useAudioStore((s) => s.setAudioRef);

  useEffect(() => {
    storeSetAudioRef(audioRef.current);
    storeSetCurrentStop(stop.id, stop.name);
    return () => storeSetAudioRef(null);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
      storeSetDuration(audio.duration);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
      storeSetTime(audio.currentTime);
    };

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          if (audioError) return;
          console.warn("La reproducción automática fue prevenida por el navegador. El usuario debe iniciarla.", error);
          setIsPlaying(false);
          storeSetPlaying(false);
        });
      }
    } else {
      audio.pause();
    }

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
    };
  }, [isPlaying, stop.audioSrc, audioError]);

  const cancelAutoAdvance = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setAutoAdvanceCountdown(null);
  }, []);

  const startAutoAdvanceCountdown = useCallback(() => {
    setAutoAdvanceCountdown(4);
    countdownRef.current = setInterval(() => {
      setAutoAdvanceCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (autoAdvanceCountdown === 0) {
      onNext();
      setAutoAdvanceCountdown(null);
    }
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [autoAdvanceCountdown, onNext]);

  const handleEnded = () => {
    markStopCompleted(stop.id);
    storeSetPlaying(false);
    startAutoAdvanceCountdown();
  };

  const togglePlayPause = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    storeSetPlaying(next);
  };

  const handleSeek = (amount: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + amount);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = progressContainerRef.current;
    const audio = audioRef.current;
    if (!container || !audio || !duration) return;

    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const newTime = duration * percentage;

    audio.currentTime = newTime;
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = progressContainerRef.current;
    if (!container || !duration) return;

    const rect = container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const hoverTime = duration * percentage;

    setSeekHoverTime({
      x: clickX,
      time: formatTime(hoverTime),
    });
  };

  const handleProgressLeave = () => {
    setSeekHoverTime(null);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const waveformHeights = useRef<number[]>(WAVEFORM_HEIGHTS);

  return (
    <div className="h-full relative overflow-hidden bg-[#0E0E0E]">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=50)',
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-[#0E0E0E]/60 via-[#0E0E0E]/85 to-[#0E0E0E]" />

      <audio
        ref={audioRef}
        src={stop.audioSrc}
        onEnded={handleEnded}
        onError={() => {
          setAudioError(`Error al cargar el audio. Revisa que la ruta sea correcta y que el formato sea compatible (ej. MP3): ${stop.audioSrc}`);
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative h-full flex flex-col px-5 pb-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between pt-[52px] mb-auto">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="w-12 h-12 rounded-full bg-[#1E1E1E] flex items-center justify-center hover:bg-[#2C2C2C] transition-colors"
                aria-label={t('player.back')}
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
          <div className="bg-white/10 backdrop-blur-[20px] px-4 py-2 rounded-full border border-white/10">
            <span className="text-white text-xs flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 bg-[#AFFF00] rounded-full shadow-[0_0_8px_rgba(175,255,0,0.6)]" />
              {t('player.offline')}
            </span>
          </div>
        </div>

        {audioError && (
          <div className="bg-[#FF4D67]/10 border border-[#FF4D67]/30 text-[#FF4D67] text-sm rounded-[22px] p-4 text-center mb-4 backdrop-blur-[20px]">
            {audioError}
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center -mt-12">
          {/* Stop info */}
          <div className="mb-6">
            <p className="text-[#6E6E6E] text-[13px] font-medium tracking-wide uppercase mb-2">
              Parada {stop.id} · Sacsayhuamán
            </p>
            <h2 className="text-[32px] font-semibold text-white leading-tight">
              {stop.name}
            </h2>
          </div>

          {/* Waveform = Seek bar */}
          <div
            className="mb-2 group relative"
            ref={progressContainerRef}
            onClick={handleProgressClick}
            onMouseMove={handleProgressHover}
            onMouseLeave={handleProgressLeave}
          >
            <div className="h-16 flex items-end justify-between gap-[3px] cursor-pointer">
              {waveformHeights.current.map((height, i) => {
                const isPlayed = i < (WAVEFORM_BARS * progressPercent / 100);
                return (
                  <div
                    key={i}
                    className="rounded-full w-full transition-all duration-150"
                    style={{
                      height: `${height}%`,
                      background: isPlayed
                        ? 'linear-gradient(180deg, #D4A843 0%, #B8922E 100%)'
                        : '#1E1E1E',
                      boxShadow: isPlayed ? '0 0 8px rgba(212,168,67,0.3)' : 'none',
                    }}
                  />
                );
              })}
            </div>
            {/* Hover time tooltip */}
            {seekHoverTime && (
              <div
                className="absolute -top-7 bg-[#1E1E1E] text-[#F0EDE8] text-xs px-2 py-1 rounded-lg border border-[#2C2C2C] pointer-events-none font-mono"
                style={{ left: `${seekHoverTime.x}px`, transform: 'translateX(-50%)' }}
              >
                {seekHoverTime.time}
              </div>
            )}
          </div>

          {/* Time labels */}
          <div className="flex justify-between text-[#6E6E6E] text-[13px] font-medium mb-8">
            <span className="font-mono">{formatTime(currentTime)}</span>
            <span className="font-mono">{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-5 mb-6">
            <button
              onClick={onPrev}
              className="w-12 h-12 rounded-full bg-[#1E1E1E] flex items-center justify-center hover:bg-[#2C2C2C] transition-all active:scale-90"
            >
              <SkipBack className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={() => handleSeek(-15)}
              className="w-12 h-12 rounded-full bg-[#1E1E1E] flex items-center justify-center hover:bg-[#2C2C2C] transition-all active:scale-90"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M11 5L6 9v10l5 4" />
                <text x="14" y="17" fontSize="10" fill="currentColor">15</text>
              </svg>
            </button>

            <button
              onClick={togglePlayPause}
              className="w-20 h-20 rounded-full bg-[#E6FF00] flex items-center justify-center hover:bg-[#D6F500] transition-all active:scale-90 shadow-[0_8px_30px_rgba(230,255,0,0.35)]"
            >
              {isPlaying ? (
                <Pause className="w-9 h-9 text-[#111111]" fill="#111111" />
              ) : (
                <Play className="w-9 h-9 text-[#111111] ml-1" fill="#111111" />
              )}
            </button>

            <button
              onClick={() => handleSeek(15)}
              className="w-12 h-12 rounded-full bg-[#1E1E1E] flex items-center justify-center hover:bg-[#2C2C2C] transition-all active:scale-90"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M13 19l5-4V5l-5-4" />
                <text x="4" y="17" fontSize="10" fill="currentColor">15</text>
              </svg>
            </button>

            <button
              onClick={onNext}
              className="w-12 h-12 rounded-full bg-[#1E1E1E] flex items-center justify-center hover:bg-[#2C2C2C] transition-all active:scale-90"
            >
              <SkipForward className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Auto-advance countdown */}
        {autoAdvanceCountdown !== null && autoAdvanceCountdown > 0 && (
          <div className="mb-3">
            <div className="bg-[#171717] border border-[#D4A843]/30 rounded-[22px] px-5 py-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[#AFFF00] text-[13px] font-medium">✓ {stop.name}</span>
                </div>
                <p className="text-white text-[13px]">
                  Siguiente en {autoAdvanceCountdown}s → {nextStopName ?? 'Fin del tour'}
                </p>
              </div>
              <button
                onClick={cancelAutoAdvance}
                className="flex-shrink-0 h-10 px-4 rounded-full bg-[#1E1E1E] border border-[#2C2C2C] text-white text-[13px] font-medium active:scale-90 transition-all hover:bg-[#2C2C2C]"
              >
                Pausar
              </button>
            </div>
          </div>
        )}

        {/* Next stop — floating pill */}
        <button
          onClick={onShowStopsList}
          className="w-full bg-[#171717] border border-[#2C2C2C] rounded-full px-5 py-3 flex items-center justify-between hover:bg-[#1E1E1E] transition-all active:scale-[0.98]"
        >
          <span className="text-white text-[15px] font-medium">
            {t('player.next', { name: nextStopName ?? t('player.endOfTour') })}
          </span>
          <ChevronUp className="w-5 h-5 text-white/60" />
        </button>
      </motion.div>

      {/* Widgets FAB */}
      <div className="absolute bottom-[100px] right-5">
        <div className="relative flex flex-col items-center">
          <AnimatePresence>
            {showWidgets && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-3 mb-4"
              >
                <motion.button
                  variants={fabItemVariants}
                  className="w-14 h-14 rounded-2xl bg-[#1E1E1E] backdrop-blur-[20px] text-white flex flex-col items-center justify-center text-[11px] border border-white/10 hover:bg-[#2C2C2C] transition-all active:scale-90 shadow-lg"
                >
                  <HelpCircle className="w-5 h-5 mb-1" />
                  <span>{t('player.faq')}</span>
                </motion.button>
                <motion.button
                  variants={fabItemVariants}
                  className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md text-white flex flex-col items-center justify-center text-xs hover:bg-white/30 active:scale-95 transition-all"
                >
                  <Lightbulb className="w-6 h-6 mb-1" />
                  <span>{t('player.suggest')}</span>
                </motion.button>
                <motion.button
                  variants={fabItemVariants}
                  className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md text-white flex flex-col items-center justify-center text-xs hover:bg-white/30 active:scale-95 transition-all"
                >
                  <MessageSquare className="w-6 h-6 mb-1" />
                  <span>{t('player.bot')}</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowWidgets(!showWidgets)}
            className="w-14 h-14 rounded-full bg-[#E6FF00] text-[#111111] flex items-center justify-center shadow-[0_4px_20px_rgba(230,255,0,0.3)] hover:bg-[#D6F500] transition-all active:scale-90"
          >
            <div className="relative w-6 h-6">
              <Plus
                className={`absolute inset-0 transition-all duration-300 ${
                  showWidgets ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
                }`}
              />
              <X
                className={`absolute inset-0 transition-all duration-300 ${
                  showWidgets ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
                }`}
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
