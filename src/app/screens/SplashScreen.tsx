import { ImageWithFallback } from '../components/atoms/ImageWithFallback';

interface SplashScreenProps {
  onStartTour: () => void;
  onShowAllStops: () => void;
  isDownloaded: boolean;
  onShowDownload: () => void;
}

export function SplashScreen({ onStartTour, onShowAllStops, isDownloaded, onShowDownload }: SplashScreenProps) {
  return (
    <div className="h-full flex flex-col bg-[var(--warm-white)]">
      <div className="relative h-[45vh] overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=85"
          alt="Sacsayhuamán megalithic stones at golden hour"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--warm-white)]"></div>

        <div className="absolute top-8 left-0 right-0 text-center px-6">
          <div className="inline-block px-4 py-2 bg-[var(--terracotta)] rounded-lg mb-2">
            <svg className="w-6 h-6 inline-block mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="text-4xl text-white drop-shadow-lg" style={{ fontFamily: 'var(--font-heading)' }}>Rimay Guide</h1>
          <p className="text-white/90 mt-1 text-sm">Escuchá el Cusco como lo cuenta su gente</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-8 flex flex-col">
        <div className="mb-6">
          <h2 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Sacsayhuamán — Fortaleza del Sol</h2>
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <span>Parada 3 de 9</span>
            <span>•</span>
            <span>Plaza del Inca</span>
          </div>
        </div>

        <div className="space-y-3 mt-auto">
          {isDownloaded ? (
            <button
              onClick={onStartTour}
              className="w-full py-4 rounded-2xl bg-[var(--terracotta)] text-white hover:bg-[#8B4513] transition-colors"
            >
              Iniciar narración
            </button>
          ) : (
            <button
              onClick={onShowDownload}
              className="w-full py-4 rounded-2xl bg-[var(--terracotta)] text-white hover:bg-[#8B4513] transition-colors"
            >
              Descargar tour
            </button>
          )}

          <button
            onClick={onShowAllStops}
            className="w-full py-4 rounded-2xl border-2 border-[var(--terracotta)] text-[var(--terracotta)] hover:bg-[var(--terracotta)]/5 transition-colors"
          >
            Ver todas las paradas
          </button>
        </div>

        {isDownloaded && (
          <div className="mt-6 p-4 bg-[var(--sage-green)]/10 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-[var(--sage-green)]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span className="text-sm text-[var(--dark-charcoal)]">Sin conexión · Audio descargado ✓</span>
          </div>
        )}
      </div>
    </div>
  );
}
