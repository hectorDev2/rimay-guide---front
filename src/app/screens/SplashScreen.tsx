import { useRef } from 'react';
import { Play, MapPin } from 'lucide-react';
import { ImageWithFallback } from '../components/atoms/ImageWithFallback';
import type { TourStop } from '../components/organisms/TourStopsList';

interface SplashScreenProps {
  tourName: string;
  stops: TourStop[];
  currentStopId: number;
  onSelectStop: (id: number) => void;
  onShowLocation: () => void;
}

export function SplashScreen({
  tourName,
  stops,
  currentStopId,
  onSelectStop,
  onShowLocation,
}: SplashScreenProps) {
  const stopsRef = useRef<HTMLDivElement>(null);

  const scrollToStops = () => {
    stopsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="h-full flex flex-col bg-black overflow-y-auto">
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=85"
          alt="Sacsayhuamán megalithic stones at golden hour"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      <div className="relative flex-1 flex flex-col justify-between text-white text-center">
        {/* Hero */}
        <div className="pt-16 px-6">
          <div className="inline-block p-3 bg-[var(--terracotta)]/70 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-white">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-5xl drop-shadow-md" style={{ fontFamily: 'var(--font-heading)' }}>
            Rimay Guide
          </h1>
          <p className="text-white/80 mt-2 text-base">
            Escuchá el Cusco como lo cuenta su gente
          </p>
        </div>

        {/* Bottom Sheet */}
        <div className="bg-white rounded-t-3xl p-6 text-gray-800 text-left shadow-2xl mt-8">
          <h2 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            {tourName}
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <span>Tour de {stops.length} paradas</span>
            <span>·</span>
            <span>45 min aprox.</span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-8">
            <button
              onClick={() => onSelectStop(currentStopId)}
              className="w-full py-4 rounded-2xl bg-[var(--terracotta)] text-white hover:bg-[#8B4513] transition-colors shadow-lg shadow-[var(--terracotta)]/30 flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" fill="white" />
              Iniciar narración
            </button>

            <button
              onClick={onShowLocation}
              className="w-full py-4 rounded-2xl border-2 border-[var(--andean-blue)]/30 text-[var(--andean-blue)] hover:bg-[var(--andean-blue)]/5 transition-colors flex items-center justify-center gap-2"
            >
              <MapPin className="w-5 h-5" />
              Ver ubicación
            </button>

            <button
              onClick={scrollToStops}
              className="w-full py-4 rounded-2xl border-2 border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Ver todas las paradas
            </button>
          </div>

          {/* Stops List */}
          <div ref={stopsRef} className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Paradas del tour
            </h3>
            <div className="space-y-1">
              {stops.map((stop, index) => {
                const isActive = stop.id === currentStopId;

                return (
                  <button
                    key={stop.id}
                    onClick={() => onSelectStop(stop.id)}
                    className={`w-full flex items-center gap-3 py-3 px-3 rounded-xl text-left transition-colors ${
                      isActive
                        ? 'bg-[var(--terracotta)]/10 border border-[var(--terracotta)]/20'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium ${
                        stop.status === 'completed'
                          ? 'bg-[var(--sage-green)] text-white'
                          : isActive
                            ? 'bg-[var(--terracotta)] text-white'
                            : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {stop.status === 'completed' ? '✓' : index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm truncate ${
                          isActive ? 'text-[var(--terracotta)] font-medium' : 'text-gray-800'
                        }`}
                      >
                        {stop.name}
                      </p>
                      <p className="text-xs text-gray-400">{stop.duration}</p>
                    </div>

                    {isActive && (
                      <Play className="w-4 h-4 text-[var(--terracotta)] flex-shrink-0" fill="currentColor" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
