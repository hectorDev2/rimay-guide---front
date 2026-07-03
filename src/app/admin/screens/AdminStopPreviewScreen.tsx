import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Play, Pause, MapPin, Clock, Radio } from 'lucide-react';
import { adminStopService } from '@/services/admin/adminStopService';
import { adminTourService } from '@/services/admin/adminTourService';
import type { TourStop, Tour } from '@/lib/tour/types';
import { formatDuration } from '@/lib/tour/types';

export function AdminStopPreviewScreen() {
  const navigate = useNavigate();
  const { tourId, stopId } = useParams<{ tourId: string; stopId: string }>();
  const [tour, setTour] = useState<Tour | null>(null);
  const [stop, setStop] = useState<TourStop | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!tourId || !stopId) return;
    Promise.all([
      adminTourService.get(tourId),
      adminStopService.listByTour(tourId),
    ]).then(([t, stops]) => {
      setTour(t);
      const found = stops.find((s) => s.id === stopId);
      setStop(found ?? null);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [tourId, stopId]);

  const togglePlay = () => {
    if (!audioRef) return;
    if (playing) {
      audioRef.pause();
    } else {
      audioRef.play().catch((e) => setAudioError(e.message));
    }
    setPlaying(!playing);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-[#6E6E6E]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#E6FF00] border-t-transparent" />
        Cargando...
      </div>
    );
  }

  if (!stop) {
    return (
      <div className="p-8">
        <p className="text-[#FF4D67]">Parada no encontrada</p>
        <button
          onClick={() => navigate(`/admin/tours/${tourId}/stops`)}
          className="mt-4 text-sm text-[#6E6E6E] hover:text-white"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl">
      <button
        onClick={() => navigate(`/admin/tours/${tourId}/stops`)}
        className="flex items-center gap-2 text-sm text-[#6E6E6E] hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a paradas
      </button>

      <div className="mb-8">
        <p className="text-xs text-[#6E6E6E] mb-1">{tour?.name}</p>
        <h1 className="text-2xl font-bold text-white">{stop.name}</h1>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#171717] border border-[#2C2C2C] rounded-xl p-4">
          <MapPin className="w-5 h-5 text-[#E6FF00] mb-2" />
          <p className="text-xs text-[#6E6E6E]">Coordenadas</p>
          <p className="text-sm text-white font-mono">{stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}</p>
        </div>
        <div className="bg-[#171717] border border-[#2C2C2C] rounded-xl p-4">
          <Radio className="w-5 h-5 text-[#E6FF00] mb-2" />
          <p className="text-xs text-[#6E6E6E]">Radio de activación</p>
          <p className="text-sm text-white">{stop.radiusMeters}m</p>
        </div>
        <div className="bg-[#171717] border border-[#2C2C2C] rounded-xl p-4">
          <Clock className="w-5 h-5 text-[#E6FF00] mb-2" />
          <p className="text-xs text-[#6E6E6E]">Duración</p>
          <p className="text-sm text-white">{formatDuration(stop.durationSeconds)}</p>
        </div>
      </div>

      <div className="bg-[#171717] border border-[#2C2C2C] rounded-xl p-6 mb-8">
        <h2 className="text-sm font-medium text-[#A0A0A0] mb-3">Descripción</h2>
        <p className="text-white text-sm leading-relaxed">{stop.description}</p>
      </div>

      {stop.culturalContext && (
        <div className="bg-[#171717] border border-[#2C2C2C] rounded-xl p-6 mb-8">
          <h2 className="text-sm font-medium text-[#A0A0A0] mb-3">Contexto cultural</h2>
          <p className="text-white text-sm leading-relaxed">{stop.culturalContext}</p>
        </div>
      )}

      <div className="bg-[#171717] border border-[#2C2C2C] rounded-xl p-6">
        <h2 className="text-sm font-medium text-[#A0A0A0] mb-4">Audio</h2>

        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-[#E6FF00] text-[#111111] flex items-center justify-center hover:bg-[#D6F500] transition-colors"
          >
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <div className="flex-1">
            <div className="h-2 bg-[#2C2C2C] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#E6FF00] transition-all"
                style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-[#6E6E6E]">{formatDuration(Math.floor(currentTime))}</span>
              <span className="text-xs text-[#6E6E6E]">{formatDuration(Math.floor(duration))}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-[#6E6E6E] font-mono break-all">{stop.audioSrc}</p>

        {audioError && (
          <p className="text-xs text-[#FF4D67] mt-2">Error: {audioError}</p>
        )}

        <audio
          ref={setAudioRef}
          src={stop.audioSrc}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onEnded={() => setPlaying(false)}
          onError={() => setAudioError('No se pudo cargar el audio')}
        />
      </div>

      <div className="mt-8 bg-[#0E0E0E] border border-[#2C2C2C] rounded-xl p-4">
        <p className="text-xs text-[#6E6E6E]">
          Para probar el geofencing, abrí la app en tu teléfono, andá físicamente a las coordenadas de esta parada,
          y verificá que el audio se dispare automáticamente al entrar en el radio de {stop.radiusMeters}m.
        </p>
      </div>
    </div>
  );
}
