const WAVEFORM_BARS = 48;
const WAVEFORM_HEIGHTS = Array.from({ length: WAVEFORM_BARS }, () => Math.random() * 60 + 20);
const DEFAULT_BG = 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=50';

import { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, RotateCw, ChevronUp, Plus, X, MessageSquare, Lightbulb, HelpCircle, ArrowLeft, BookOpen, Footprints } from 'lucide-react';
import { useTourStore } from '@/stores/tourStore';
import { useChatStore } from '@/stores/chatStore';
import { useAudioEngine, formatTime } from '@/hooks/useAudioEngine';
import type { TourStopDisplay } from './TourStopsList';

const fabContainerVariants = {
  hidden: { opacity: 0, y: -20, transition: { staggerChildren: 0.04, staggerDirection: -1 } },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const fabItemVariants = {
  hidden: { opacity: 0, y: -12, scale: 0.85 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

interface AudioPlayerProps {
  stop: TourStopDisplay;
  onShowStopsList: () => void;
  onNext: () => void;
  onPrev: () => void;
  nextStopName?: string;
  onBack?: () => void;
  onShowDetails?: () => void;
  onStartWalk?: () => void;
}

export function AudioPlayer({ stop, onShowStopsList, onNext, onPrev, nextStopName, onBack, onShowDetails, onStartWalk }: AudioPlayerProps) {
  const { t } = useTranslation();
  const [showWidgets, setShowWidgets] = useState(false);
  const markStopCompleted = useTourStore((s) => s.markStopCompleted);
  const tour = useTourStore((s) => s.tour);
  const openChat = useChatStore((s) => s.openChat);

  const {
    audioRef,
    progressContainerRef,
    isPlaying,
    currentTime,
    duration,
    progressPercent,
    audioError,
    setAudioError,
    playbackRate,
    seekHoverTime,
    autoAdvanceCountdown,
    handleEnded,
    togglePlayPause,
    handleSeek,
    handleProgressClick,
    handleTouchSeek,
    handleProgressHover,
    handleProgressLeave,
    cancelAutoAdvance,
    cyclePlaybackRate,
  } = useAudioEngine({ stop, onNext, markStopCompleted });

  const waveformHeights = useRef<number[]>(WAVEFORM_HEIGHTS);
  const fabItemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  const { stopOrder, totalStops, hasPrev, hasNext, backgroundImage } = useMemo(() => {
    const stops = tour?.stops ?? [];
    const idx = stops.findIndex((s) => s.id === stop.id);
    const fullStop = idx >= 0 ? stops[idx] : undefined;
    return {
      stopOrder: fullStop?.order ?? (idx >= 0 ? idx + 1 : 1),
      totalStops: stops.length,
      hasPrev: idx > 0,
      hasNext: idx >= 0 && idx < stops.length - 1,
      backgroundImage: fullStop?.imageUrl || DEFAULT_BG,
    };
  }, [tour, stop.id]);

  const handleFabAction = (action: 'faq' | 'suggest' | 'bot') => {
    setShowWidgets(false);
    if (action === 'suggest' && onShowDetails) {
      onShowDetails();
      return;
    }
    openChat();
  };

  return (
    <div className="h-full relative overflow-hidden bg-[#0E0E0E]">
      <motion.div
        key={backgroundImage}
        initial={{ opacity: 0, scale: 1.08 }}
        animate={{ opacity: 0.45, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-[#0E0E0E]/50 via-[#0E0E0E]/85 to-[#0E0E0E]" />

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
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBack?.();
                }}
                className="w-12 h-12 rounded-full bg-[#1E1E1E] flex items-center justify-center hover:bg-[#2C2C2C] transition-colors relative z-10"
                aria-label={t('player.back')}
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
            )}
            {onShowDetails && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onShowDetails?.();
                }}
                className="w-12 h-12 rounded-full bg-[#1E1E1E] flex items-center justify-center hover:bg-[#2C2C2C] transition-colors relative z-10"
                aria-label="Ver detalle del lugar"
                title="Detalle del lugar"
              >
                <BookOpen className="w-5 h-5 text-white" />
              </button>
            )}
            {onStartWalk && (
              <button
                onClick={onStartWalk}
                className="w-12 h-12 rounded-full bg-[#1E1E1E] flex items-center justify-center hover:bg-[#2C2C2C] transition-colors"
                aria-label="Modo caminata"
                title="Caminar a la siguiente parada"
              >
                <Footprints className="w-5 h-5 text-[#E6FF00]" />
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
          <motion.div
            key={stop.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#D4A843] text-[13px] font-semibold tracking-wide uppercase">
                Parada {stopOrder}{totalStops > 0 ? ` de ${totalStops}` : ''}
              </span>
              <span className="text-[#6E6E6E] text-[13px]">·</span>
              <span className="text-[#6E6E6E] text-[13px] font-medium tracking-wide uppercase">
                {tour?.name?.split('—')[0]?.trim() ?? 'Sacsayhuamán'}
              </span>
            </div>
            <h2 className="text-[32px] font-semibold text-white leading-tight">
              {stop.name}
            </h2>
            {/* Progress dots */}
            {totalStops > 1 && (
              <div className="flex gap-1.5 mt-4">
                {Array.from({ length: totalStops }, (_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i + 1 === stopOrder
                        ? 'w-6 bg-[#E6FF00]'
                        : i + 1 < stopOrder
                          ? 'w-2 bg-[#D4A843]/60'
                          : 'w-2 bg-[#2C2C2C]'
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Waveform = Seek bar */}
          <div
            className="mb-2 group relative"
            ref={progressContainerRef}
            onClick={handleProgressClick}
            onMouseMove={handleProgressHover}
            onMouseLeave={handleProgressLeave}
            onTouchStart={handleTouchSeek}
            onTouchMove={handleTouchSeek}
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

          {/* Time labels + speed */}
          <div className="flex justify-between items-center text-[#6E6E6E] text-[13px] font-medium mb-8">
            <span className="font-mono">{formatTime(currentTime)}</span>
            <button
              onClick={cyclePlaybackRate}
              className="px-3 py-1 rounded-full bg-[#1E1E1E] border border-[#2C2C2C] text-[12px] font-semibold text-[#D4A843] hover:bg-[#2C2C2C] transition-all active:scale-90 font-mono"
              aria-label="Velocidad de reproducción"
            >
              {playbackRate}x
            </button>
            <span className="font-mono">{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between max-w-[340px] w-full mx-auto mb-6">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              aria-label="Parada anterior"
              className="w-11 h-11 rounded-full text-white/70 flex items-center justify-center hover:text-white hover:bg-white/10 transition-all active:scale-90 disabled:opacity-25 disabled:pointer-events-none"
            >
              <SkipBack className="w-5 h-5" fill="currentColor" />
            </button>

            <button
              onClick={() => handleSeek(-15)}
              aria-label="Retroceder 15 segundos"
              className="relative w-14 h-14 rounded-full bg-[#1E1E1E]/90 border border-white/10 backdrop-blur-[20px] flex items-center justify-center text-white hover:bg-[#2C2C2C] transition-all active:scale-90 active:-rotate-45"
            >
              <RotateCcw className="w-6 h-6" strokeWidth={1.8} />
              <span className="absolute text-[9px] font-bold mt-[3px]">15</span>
            </button>

            <div className="relative">
              {isPlaying && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-[#E6FF00]/25"
                  animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
              <button
                onClick={togglePlayPause}
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                className="relative w-[76px] h-[76px] rounded-full bg-gradient-to-b from-[#F0FF4D] to-[#D6F500] flex items-center justify-center transition-all active:scale-90 shadow-[0_8px_30px_rgba(230,255,0,0.35),inset_0_1px_0_rgba(255,255,255,0.4)]"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={isPlaying ? 'pause' : 'play'}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="flex items-center justify-center"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-[#111111]" fill="#111111" strokeWidth={0} />
                    ) : (
                      <Play className="w-8 h-8 text-[#111111] ml-1" fill="#111111" strokeWidth={0} />
                    )}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>

            <button
              onClick={() => handleSeek(15)}
              aria-label="Adelantar 15 segundos"
              className="relative w-14 h-14 rounded-full bg-[#1E1E1E]/90 border border-white/10 backdrop-blur-[20px] flex items-center justify-center text-white hover:bg-[#2C2C2C] transition-all active:scale-90 active:rotate-45"
            >
              <RotateCw className="w-6 h-6" strokeWidth={1.8} />
              <span className="absolute text-[9px] font-bold mt-[3px]">15</span>
            </button>

            <button
              onClick={onNext}
              aria-label={hasNext ? 'Siguiente parada' : 'Finalizar tour'}
              className="w-11 h-11 rounded-full text-white/70 flex items-center justify-center hover:text-white hover:bg-white/10 transition-all active:scale-90"
            >
              <SkipForward className="w-5 h-5" fill="currentColor" />
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

      {/* Widgets FAB — debajo del indicador de conexión */}
      <div className="absolute top-[104px] right-5">
        <div className="relative flex flex-col items-center">
          <button
            onClick={() => setShowWidgets(!showWidgets)}
            aria-label={showWidgets ? 'Cerrar acciones' : 'Abrir acciones'}
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

          <AnimatePresence>
            {showWidgets && (
              <motion.div
                variants={fabContainerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="flex flex-col items-center gap-3 mt-4"
              >
                <motion.button
                  variants={fabItemVariants}
                  onClick={() => handleFabAction('faq')}
                  aria-label={t('player.faq')}
                  className="w-14 h-14 rounded-2xl bg-[#1E1E1E]/90 backdrop-blur-[20px] text-white flex flex-col items-center justify-center text-[11px] border border-white/10 hover:bg-[#2C2C2C] transition-all active:scale-90 shadow-lg"
                >
                  <HelpCircle className="w-5 h-5 mb-1" />
                  <span>{t('player.faq')}</span>
                </motion.button>
                <motion.button
                  variants={fabItemVariants}
                  onClick={() => handleFabAction('suggest')}
                  aria-label={t('player.suggest')}
                  className="w-14 h-14 rounded-2xl bg-[#1E1E1E]/90 backdrop-blur-[20px] text-white flex flex-col items-center justify-center text-[11px] border border-white/10 hover:bg-[#2C2C2C] transition-all active:scale-90 shadow-lg"
                >
                  <Lightbulb className="w-5 h-5 mb-1 text-[#D4A843]" />
                  <span>{t('player.suggest')}</span>
                </motion.button>
                <motion.button
                  variants={fabItemVariants}
                  onClick={() => handleFabAction('bot')}
                  aria-label={t('player.bot')}
                  className="w-14 h-14 rounded-2xl bg-[#1E1E1E]/90 backdrop-blur-[20px] text-white flex flex-col items-center justify-center text-[11px] border border-white/10 hover:bg-[#2C2C2C] transition-all active:scale-90 shadow-lg"
                >
                  <MessageSquare className="w-5 h-5 mb-1 text-[#E6FF00]" />
                  <span>{t('player.bot')}</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
