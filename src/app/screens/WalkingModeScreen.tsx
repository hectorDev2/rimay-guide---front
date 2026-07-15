import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Crosshair,
  Footprints,
  Satellite,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Map as MapIcon,
  MessageSquare,
  BookOpen,
  X,
} from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useLocationPriming } from '@/hooks/useLocationPriming';
import { useNavigation } from '@/hooks/useNavigation';
import { LocationPrimer } from '@/app/components/organisms/LocationPrimer';
import { WalkingModeIntro } from '@/app/components/organisms/WalkingModeIntro';
import { useNavigationStore } from '@/stores/navigationStore';
import { useLocationStore } from '@/stores/locationStore';
import { useTourStore } from '@/stores/tourStore';
import { useChatStore } from '@/stores/chatStore';
import { useAudioEngine, formatTime } from '@/hooks/useAudioEngine';
import { WalkingMap } from '@/app/components/organisms/WalkingMap';
import { StopDetailSheet } from '@/app/components/organisms/StopDetailSheet';
import type { TourStop } from '@/lib/tour/types';

const CAPSULE_TONE_STYLES = {
  info: 'border-[#2C2C2C] text-white',
  warning: 'border-[#FFB84D]/40 text-[#FFB84D]',
  celebration: 'border-[#E6FF00]/40 text-[#E6FF00]',
} as const;

const MAP_AUTO_HIDE_DELAY_MS = 4000;
const WALK_INTRO_SEEN_KEY = 'rimay_walk_intro_seen';

export function WalkingModeScreen() {
  const navigate = useNavigate();
  const { primed, markPrimed } = useLocationPriming();
  const [introSeen, setIntroSeen] = useState(() => localStorage.getItem(WALK_INTRO_SEEN_KEY) === '1');

  useGeolocation({ enabled: primed });

  const { targetStop, allCompleted } = useNavigation({ enabled: primed });

  const position = useLocationStore((s) => s.position);
  const setPosition = useLocationStore((s) => s.setPosition);
  const geoError = useLocationStore((s) => s.error);
  const capsule = useNavigationStore((s) => s.capsule);
  const dismissCapsule = useNavigationStore((s) => s.dismissCapsule);
  const distance = useNavigationStore((s) => s.distanceToStop);
  const eta = useNavigationStore((s) => s.etaMinutes);
  const gpsWeak = useNavigationStore((s) => s.gpsWeak);
  const offRoute = useNavigationStore((s) => s.offRoute);
  const followCamera = useNavigationStore((s) => s.followCamera);
  const setFollowCamera = useNavigationStore((s) => s.setFollowCamera);
  const mode = useNavigationStore((s) => s.mode);

  const markStopCompleted = useTourStore((s) => s.markStopCompleted);
  const completedCount = useTourStore((s) => s.completedIds.length);
  const totalStops = useTourStore((s) => s.tour?.stops.length ?? 0);
  const isDownloaded = useTourStore((s) => s.isDownloaded);
  const openChat = useChatStore((s) => s.openChat);

  const [arrivedStop, setArrivedStop] = useState<TourStop | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedStop, setSelectedStop] = useState<TourStop | null>(null);
  const mapAutoOpenedRef = useRef(false);
  const allStops = useTourStore((s) => s.tour?.stops ?? []);

  // Tour completo → PlayerRoute muestra la pantalla de cierre
  useEffect(() => {
    if (allCompleted) navigate('/player');
  }, [allCompleted, navigate]);

  // El hero solo reproduce cuando el usuario ya llegó a la parada; al
  // avanzar a la siguiente (mode vuelve a 'walking') se oculta de nuevo.
  useEffect(() => {
    if (mode === 'arrived' && targetStop) {
      setArrivedStop(targetStop);
    } else if (mode === 'walking') {
      setArrivedStop(null);
    }
  }, [mode, targetStop]);

  // Auto-ocultar cápsula del guía
  useEffect(() => {
    if (!capsule) return;
    const timer = setTimeout(dismissCapsule, 6000);
    return () => clearTimeout(timer);
  }, [capsule, dismissCapsule]);

  // El mapa aparece solo si el usuario lo pide o si hay un desvío sostenido
  useEffect(() => {
    if (offRoute) {
      mapAutoOpenedRef.current = true;
      setShowMap(true);
    } else if (mapAutoOpenedRef.current) {
      mapAutoOpenedRef.current = false;
      const timer = setTimeout(() => setShowMap(false), MAP_AUTO_HIDE_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [offRoute]);

  const activeStop = arrivedStop ?? targetStop;

  const engine = useAudioEngine({
    stop: activeStop ?? { id: '', name: '', audioSrc: '' },
    onNext: () => {},
    markStopCompleted,
  });

  const simulateNearTarget = () => {
    if (!targetStop) return;
    setPosition({
      latitude: targetStop.latitude + 0.0008,
      longitude: targetStop.longitude + 0.0008,
      accuracy: 8,
      timestamp: Date.now(),
    });
  };
  const simulateAtTarget = () => {
    if (!targetStop) return;
    setPosition({
      latitude: targetStop.latitude,
      longitude: targetStop.longitude,
      accuracy: 8,
      timestamp: Date.now(),
    });
  };

  // Una sola línea de estado: la cápsula contextual tiene prioridad; si no
  // hay ninguna activa, se sintetiza el estado persistente más relevante.
  const statusText =
    capsule?.text ??
    geoError ??
    (!position
      ? 'Buscando tu señal GPS…'
      : gpsWeak
        ? 'Señal GPS imprecisa — sigue el camino'
        : null);

  if (!introSeen) {
    return (
      <WalkingModeIntro
        onContinue={() => {
          localStorage.setItem(WALK_INTRO_SEEN_KEY, '1');
          setIntroSeen(true);
        }}
      />
    );
  }

  if (!primed) {
    return <LocationPrimer onContinue={markPrimed} />;
  }

  return (
    <div className="h-full relative overflow-hidden bg-[#0E0E0E]">
      {activeStop?.imageUrl && (
        <motion.div
          key={activeStop.imageUrl}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 0.35, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${activeStop.imageUrl})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0E0E0E]/60 via-[#0E0E0E]/85 to-[#0E0E0E]" />

      {arrivedStop && <audio ref={engine.audioRef} src={arrivedStop.audioSrc} onEnded={engine.handleEnded} />}

      <div className="relative h-full flex flex-col px-5 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between pt-[52px] mb-6">
          <button
            onClick={() => navigate('/tour')}
            className="w-12 h-12 rounded-full bg-[#1E1E1E] flex items-center justify-center hover:bg-[#2C2C2C] transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="bg-white/10 backdrop-blur-[20px] px-4 py-2 rounded-full border border-white/10">
            <span className="text-white text-xs flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 bg-[#AFFF00] rounded-full shadow-[0_0_8px_rgba(175,255,0,0.6)]" />
              Offline
            </span>
          </div>
        </div>

        {/* Hero */}
        <div className="flex-1 flex flex-col justify-center -mt-8">
          {targetStop ? (
            <motion.div
              key={targetStop.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8 text-center"
            >
              <span className="text-[#D4A843] text-[13px] font-semibold tracking-wide uppercase">
                {arrivedStop ? 'Has llegado' : 'Próxima parada'}
              </span>
              <h2 className="text-[32px] font-semibold text-white leading-tight mt-1">
                {targetStop.name}
              </h2>
              {!arrivedStop && (
                <p className="text-white font-bold text-[28px] tabular-nums mt-3">
                  {distance !== null ? `${distance} m` : '—'}
                  {eta !== null && (
                    <span className="text-[15px] text-[#6E6E6E] font-normal ml-2">~{eta} min a pie</span>
                  )}
                </p>
              )}
            </motion.div>
          ) : (
            <p className="text-[#A6A6A6] text-sm text-center py-1 mb-8">Preparando el recorrido…</p>
          )}

          {/* Botón grande: reproducir si llegó, caminar si no */}
          <div className="flex items-center justify-center gap-6 mb-6">
            {arrivedStop ? (
              <>
                <button
                  onClick={() => engine.handleSeek(-15)}
                  aria-label="Retroceder 15 segundos"
                  className="relative w-14 h-14 rounded-full bg-[#1E1E1E]/90 border border-white/10 backdrop-blur-[20px] flex items-center justify-center text-white active:scale-90 active:-rotate-45 transition-all"
                >
                  <RotateCcw className="w-6 h-6" strokeWidth={1.8} />
                  <span className="absolute text-[9px] font-bold mt-[3px]">15</span>
                </button>
                <div className="relative">
                  {engine.isPlaying && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[#E6FF00]/25"
                      animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                    />
                  )}
                  <button
                    onClick={engine.togglePlayPause}
                    aria-label={engine.isPlaying ? 'Pausar' : 'Reproducir'}
                    className="relative w-[84px] h-[84px] rounded-full bg-gradient-to-b from-[#F0FF4D] to-[#D6F500] flex items-center justify-center active:scale-90 transition-all shadow-[0_8px_30px_rgba(230,255,0,0.35),inset_0_1px_0_rgba(255,255,255,0.4)]"
                  >
                    {engine.isPlaying ? (
                      <Pause className="w-9 h-9 text-[#111111]" fill="#111111" strokeWidth={0} />
                    ) : (
                      <Play className="w-9 h-9 text-[#111111] ml-1" fill="#111111" strokeWidth={0} />
                    )}
                  </button>
                </div>
                <button
                  onClick={() => engine.handleSeek(15)}
                  aria-label="Adelantar 15 segundos"
                  className="relative w-14 h-14 rounded-full bg-[#1E1E1E]/90 border border-white/10 backdrop-blur-[20px] flex items-center justify-center text-white active:scale-90 active:rotate-45 transition-all"
                >
                  <RotateCw className="w-6 h-6" strokeWidth={1.8} />
                  <span className="absolute text-[9px] font-bold mt-[3px]">15</span>
                </button>
              </>
            ) : (
              <div className="w-[84px] h-[84px] rounded-full bg-[#E6FF00]/15 flex items-center justify-center">
                <Footprints className="w-9 h-9 text-[#E6FF00]" />
              </div>
            )}
          </div>

          {arrivedStop && (
            <p className="text-center text-[13px] text-[#6E6E6E] font-mono mb-2">
              {formatTime(engine.currentTime)} / {formatTime(engine.duration)}
            </p>
          )}

          {engine.autoAdvanceCountdown !== null && engine.autoAdvanceCountdown > 0 && (
            <div className="bg-[#171717] border border-[#D4A843]/30 rounded-[22px] px-5 py-3 flex items-center justify-between mb-2">
              <p className="text-white text-[13px]">
                Siguiendo camino en {engine.autoAdvanceCountdown}s…
              </p>
              <button
                onClick={engine.cancelAutoAdvance}
                className="flex-shrink-0 h-9 px-4 rounded-full bg-[#1E1E1E] border border-[#2C2C2C] text-white text-[13px] font-medium active:scale-90 transition-all"
              >
                Pausar
              </button>
            </div>
          )}

          {/* Instrucción / estado — una sola línea */}
          <AnimatePresence mode="wait">
            {statusText && (
              <motion.div
                key={statusText}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex items-center justify-center gap-2 text-center text-[14px] font-medium px-4 py-2 rounded-full border mx-auto ${
                  capsule ? CAPSULE_TONE_STYLES[capsule.tone] : 'border-[#2C2C2C] text-[#A6A6A6]'
                }`}
              >
                {!capsule && (!position || gpsWeak) && (
                  <Satellite className={`w-4 h-4 flex-shrink-0 ${!position ? 'animate-pulse' : ''}`} />
                )}
                <span>{statusText}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chips bajo demanda */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={() => setShowMap(true)}
            className="h-11 px-5 rounded-full bg-[#171717] border border-[#2C2C2C] flex items-center gap-2 text-white text-[13px] font-medium active:scale-95 transition-all"
          >
            <MapIcon className="w-4 h-4" />
            Mapa
          </button>
          {targetStop && (
            <button
              onClick={() => setShowDetail(true)}
              className="h-11 px-5 rounded-full bg-[#171717] border border-[#2C2C2C] flex items-center gap-2 text-white text-[13px] font-medium active:scale-95 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Historia
            </button>
          )}
          <button
            onClick={openChat}
            className="h-11 px-5 rounded-full bg-[#171717] border border-[#2C2C2C] flex items-center gap-2 text-white text-[13px] font-medium active:scale-95 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
        </div>

        {/* Footer: progreso + offline */}
        <div className="text-center text-[12px] text-[#6E6E6E]">
          {totalStops > 0 && `Parada ${Math.min(completedCount + 1, totalStops)} de ${totalStops}`}
          {isDownloaded && ' · Contenido descargado'}
        </div>

        {import.meta.env.DEV && targetStop && !arrivedStop && (
          <div className="mt-2 flex gap-2 justify-center">
            <button
              onClick={simulateNearTarget}
              className="text-[11px] px-3 py-1.5 rounded-full bg-[#4A7FA5]/80 text-white"
            >
              ⚙ Simular a ~120 m
            </button>
            <button
              onClick={simulateAtTarget}
              className="text-[11px] px-3 py-1.5 rounded-full bg-[#4A7FA5]/80 text-white"
            >
              ⚙ Simular llegada
            </button>
          </div>
        )}
      </div>

      {/* Mapa bajo demanda */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 bg-[#111111]"
          >
            <WalkingMap
              className="absolute inset-0 w-full h-full"
              onStopClick={(stopId) => {
                const stop = allStops.find((s) => s.id === stopId);
                if (stop) setSelectedStop(stop);
              }}
            />
            <button
              onClick={() => setShowMap(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#171717]/90 backdrop-blur-[12px] border border-[#2C2C2C] flex items-center justify-center text-white active:scale-90 transition-all"
              aria-label="Cerrar mapa"
            >
              <X className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {!followCamera && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setFollowCamera(true)}
                  className="absolute bottom-6 right-4 z-10 w-12 h-12 rounded-full bg-[#E6FF00] text-[#111111] flex items-center justify-center shadow-[0_8px_20px_rgba(230,255,0,0.35)] active:scale-90 transition-transform"
                  aria-label="Re-centrar mapa"
                >
                  <Crosshair className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDetail && targetStop && (
          <StopDetailSheet
            stopId={targetStop.id}
            stopName={targetStop.name}
            onClose={() => setShowDetail(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedStop && (
          <StopDetailSheet
            stopId={selectedStop.id}
            stopName={selectedStop.name}
            onClose={() => setSelectedStop(null)}
            hideAudio={selectedStop.id === arrivedStop?.id}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
