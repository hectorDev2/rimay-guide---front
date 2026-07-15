import { useState, useRef, useEffect, useCallback } from 'react';
import { useAudioStore } from '@/stores/audioStore';

const PLAYBACK_RATES = [1, 1.25, 1.5, 0.75];

interface AudioEngineStop {
  id: string;
  name: string;
  audioSrc: string;
}

interface UseAudioEngineOptions {
  stop: AudioEngineStop;
  onNext: () => void;
  markStopCompleted: (id: string) => void;
}

export function useAudioEngine({ stop, onNext, markStopCompleted }: UseAudioEngineOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const [seekHoverTime, setSeekHoverTime] = useState<{ x: number; time: string } | null>(null);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

  // El elemento <audio> es la fuente de verdad: el estado isPlaying lo
  // sigue vía eventos 'play'/'pause'. Esto elimina las carreras entre
  // load()/play()/pause() que dejaban las paradas siguientes en silencio
  // (un play() interrumpido rechaza su promesa y forzaba isPlaying=false).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
      storeSetDuration(audio.duration);
    };
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      storeSetTime(audio.currentTime);
    };
    const onPlay = () => {
      setIsPlaying(true);
      storeSetPlaying(true);
    };
    const onPause = () => {
      setIsPlaying(false);
      storeSetPlaying(false);
    };

    audio.addEventListener('loadeddata', onLoaded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('loadeddata', onLoaded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  // Al cambiar de parada (el componente no se remonta): resetear estado,
  // recargar el <audio> y reproducir automáticamente la nueva narración.
  const isFirstStopRender = useRef(true);
  useEffect(() => {
    if (isFirstStopRender.current) {
      isFirstStopRender.current = false;
      return;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setAutoAdvanceCountdown(null);
    setCurrentTime(0);
    setDuration(0);
    setAudioError(null);
    storeSetCurrentStop(stop.id, stop.name);

    const audio = audioRef.current;
    if (!audio) return;
    audio.load();
    audio.play().catch((error) => {
      // Autoplay bloqueado por el navegador: queda en pausa, listo para
      // que el usuario toque play. Los eventos mantienen isPlaying en sync.
      console.warn('Autoplay prevenido por el navegador:', error);
    });
  }, [stop.id]);

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
    // El evento 'pause' del <audio> ya sincroniza isPlaying=false
    markStopCompleted(stop.id);
    startAutoAdvanceCountdown();
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch((error) => {
        console.warn('No se pudo iniciar la reproducción:', error);
      });
    } else {
      audio.pause();
    }
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

  const handleTouchSeek = (e: React.TouchEvent<HTMLDivElement>) => {
    const container = progressContainerRef.current;
    const audio = audioRef.current;
    if (!container || !audio || !duration) return;

    const rect = container.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = Math.min(1, Math.max(0, x / rect.width));
    audio.currentTime = duration * percentage;
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

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate, stop.audioSrc]);

  const cyclePlaybackRate = () => {
    const next = PLAYBACK_RATES[(PLAYBACK_RATES.indexOf(playbackRate) + 1) % PLAYBACK_RATES.length];
    setPlaybackRate(next);
  };

  return {
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
  };
}

export function formatTime(seconds: number) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
