import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, ChevronUp, Plus, X, MessageSquare, Lightbulb, HelpCircle, ArrowLeft } from 'lucide-react';
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showWidgets, setShowWidgets] = useState(false);
  const progressContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);

    // El método play() devuelve una promesa. Los navegadores modernos pueden
    // impedir la reproducción automática si el usuario no ha interactuado con la página.
    // Debemos manejar el rechazo de la promesa para sincronizar nuestra UI.
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // No mostramos el error de "autoplay" si ya hay un error más grave de carga de archivo.
          if (audioError) return;

          // Este error es por la política de autoplay del navegador, no porque el archivo esté mal.
          console.warn("La reproducción automática fue prevenida por el navegador. El usuario debe iniciarla.", error);
          // Si la reproducción automática falla, actualizamos la UI para mostrar el botón de play.
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
    }

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
    };
  }, [isPlaying, stop.audioSrc, audioError]); // Agregamos audioError a las dependencias

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
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

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="h-full relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center blur-xl scale-110"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=50)',
        }}
      ></div>

      <audio
        ref={audioRef}
        src={stop.audioSrc}
        onEnded={onNext}
        onError={() => {
          setAudioError(`Error al cargar el audio. Revisa que la ruta sea correcta y que el formato sea compatible (ej. MP3): ${stop.audioSrc}`);
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-[#1a365d]/70 via-[#1a365d]/90 to-[#1a365d]"></div>

      <div className="relative h-full flex flex-col p-6">
        <div className="flex justify-between items-start mb-auto">
          <div>
            {onBack && (
              <button
                onClick={onBack}
                className="mb-3 text-white/70 hover:text-white transition-colors flex items-center gap-1"
                aria-label="Volver"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm">Volver</span>
              </button>
            )}
            <h2 className="text-3xl text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
              {stop.name}
            </h2>
            <p className="text-white/70 text-sm">Parada {stop.id} · Sacsayhuamán</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
            <span className="text-white text-xs flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Sin conexión
            </span>
          </div>
        </div>

        {audioError && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 text-sm rounded-lg p-4 text-center mb-4">
            {audioError}
          </div>
        )}

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
                    fill="#1a365d"
                    opacity={opacity}
                  />
                );
              })}
            </svg>
          </div>

          <div
            className="mb-2 py-2 group"
            ref={progressContainerRef}
            onClick={handleProgressClick}
          >
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer">
              <div
                className="h-full bg-white transition-all relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
          </div>

          <div className="flex justify-between text-white/80 text-sm">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mb-8">
          <button onClick={onPrev} className="text-white/80 hover:text-white transition-colors">
            <SkipBack className="w-8 h-8" />
          </button>

          <button onClick={() => handleSeek(-15)} className="text-white/80 hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M11 5L6 9v10l5 4" />
              <text x="14" y="17" fontSize="10" fill="currentColor">15</text>
            </svg>
          </button>

          <button
            onClick={togglePlayPause}
            className="w-20 h-20 rounded-full bg-[#1a365d] flex items-center justify-center hover:bg-[#1a365d]/90 transition-colors shadow-2xl"
          >
            {isPlaying ? (
              <Pause className="w-10 h-10 text-white" fill="white" />
            ) : (
              <Play className="w-10 h-10 text-white ml-1" fill="white" /> // ml-1 para centrar visualmente el ícono de play
            )}
          </button>

          <button onClick={() => handleSeek(15)} className="text-white/80 hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M13 19l5-4V5l-5-4" />
              <text x="4" y="17" fontSize="10" fill="currentColor">15</text>
            </svg>
          </button>

          <button onClick={onNext} className="text-white/80 hover:text-white transition-colors">
            <SkipForward className="w-8 h-8" />
          </button>
        </div>

        <button
          onClick={onShowStopsList}
          className="bg-white/10 backdrop-blur-md rounded-t-3xl p-4 flex items-center justify-between hover:bg-white/20 transition-colors"
        >
          <span className="text-white">Siguiente: {nextStopName || 'Fin del tour'}</span>
          <ChevronUp className="w-5 h-5 text-white" />
        </button>

        {/* Widgets FAB */}
        <div className="absolute bottom-24 right-6">
          <div className="relative flex flex-col items-center">
            {/* Widget Menu Items */}
            <div className={`flex flex-col items-center gap-4 mb-4 ${showWidgets ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <button className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md text-white flex flex-col items-center justify-center text-xs transition-all duration-300 hover:bg-white/30" style={{ transitionDelay: showWidgets ? '0.2s' : '0s' }}>
                <HelpCircle className="w-6 h-6 mb-1" />
                <span>FAQ</span>
              </button>
              <button className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md text-white flex flex-col items-center justify-center text-xs transition-all duration-300 hover:bg-white/30" style={{ transitionDelay: showWidgets ? '0.1s' : '0s' }}>
                <Lightbulb className="w-6 h-6 mb-1" />
                <span>Sugerir</span>
              </button>
              <button className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md text-white flex flex-col items-center justify-center text-xs transition-all duration-300 hover:bg-white/30" style={{ transitionDelay: showWidgets ? '0s' : '0s' }}>
                <MessageSquare className="w-6 h-6 mb-1" />
                <span>Bot</span>
              </button>
            </div>

            {/* Main FAB button */}
            <button
              onClick={() => setShowWidgets(!showWidgets)}
              className="w-16 h-16 rounded-full bg-[#1a365d] text-white flex items-center justify-center shadow-2xl hover:bg-[#1a365d]/90 transition-transform duration-300"
            >
              <div className="relative w-8 h-8">
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
    </div>
  );
}
