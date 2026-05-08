import { ImageWithFallback } from '../components/atoms/ImageWithFallback';

interface SplashScreenProps {
  onStartTour: () => void;
  onShowAllStops: () => void;
}

export function SplashScreen({ onStartTour, onShowAllStops }: SplashScreenProps) {
  return (
    <div className="h-full flex flex-col bg-black">
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=85"
          alt="Sacsayhuamán megalithic stones at golden hour"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
      </div>

      <div className="relative flex-1 flex flex-col justify-between text-white text-center">
        <div className="pt-16 px-6">
          <div className="inline-block p-3 bg-[#1a365d]/70 backdrop-blur-sm rounded-2xl mb-4 shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8 text-white">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-5xl drop-shadow-md" style={{ fontFamily: 'var(--font-heading)' }}>Rimay Guide</h1>
          <p className="text-white/80 mt-2 text-base">Escuchá el Cusco como lo cuenta su gente</p>
        </div>

        <div className="bg-white rounded-t-3xl p-8 text-gray-800 text-left shadow-2xl">
          <h2 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Sacsayhuamán — Fortaleza del Sol</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <span>Tour de 9 paradas</span>
            <span>•</span>
            <span>45 min aprox.</span>
          </div>
          <div className="space-y-4">
            <button onClick={onStartTour} className="w-full py-4 rounded-2xl bg-[#1a365d] text-white hover:bg-[#1a365d]/90 transition-colors shadow-lg shadow-[#1a365d]/30">
              Iniciar narración
            </button>
            <button onClick={onShowAllStops} className="w-full py-4 rounded-2xl border-2 border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors">
              Ver todas las paradas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
