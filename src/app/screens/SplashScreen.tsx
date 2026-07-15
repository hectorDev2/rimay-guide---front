import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Footprints, MapPin, ChevronDown, Smartphone } from 'lucide-react';
import { ImageWithFallback } from '../components/atoms/ImageWithFallback';
import { LanguageSwitcher } from '../components/atoms/LanguageSwitcher';
import type { TourStopDisplay } from '../components/organisms/TourStopsList';

interface SplashScreenProps {
  tourName: string;
  stops: TourStopDisplay[];
  currentStopId: string;
  onSelectStop: (id: string) => void;
  onStartRoute: () => void;
  onShowLocation: () => void;
  onShowAddToHome: () => void;
}

export function SplashScreen({
  tourName,
  stops,
  currentStopId,
  onSelectStop,
  onStartRoute,
  onShowLocation,
  onShowAddToHome,
}: SplashScreenProps) {
  const { t } = useTranslation();
  const stopsRef = useRef<HTMLDivElement>(null);

  const scrollToStops = () => {
    stopsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="h-full flex flex-col bg-[#0E0E0E] overflow-y-auto">
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=85"
          alt="Sacsayhuamán megalithic stones at golden hour"
          className="w-full h-full object-cover opacity-50"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E] via-[#0E0E0E]/40 to-transparent" />
      </div>

      <div className="absolute top-4 left-4 z-10">
        <LanguageSwitcher />
      </div>

      <div className="relative flex-1 flex flex-col justify-between text-white">
        <div className="pt-[52px] px-5 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[22px] bg-white/10 backdrop-blur-[20px] border border-white/10 mb-5 shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="#E6FF00" strokeWidth="2" className="w-8 h-8">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-[40px] font-bold drop-shadow-lg leading-tight">
            Rimay Guide
          </h1>
          <p className="text-white/60 mt-2 text-[15px] font-medium">
            {t('login.subtitle')}
          </p>
        </div>

        <div className="bg-[#171717] rounded-t-[30px] px-5 pt-6 pb-5 shadow-[0_-10px_30px_rgba(0,0,0,0.35)] mt-8 border-t border-[#2C2C2C]/50">
          <h2 className="text-[24px] font-semibold text-white mb-1">
            {tourName}
          </h2>
          <div className="flex items-center gap-2 text-[13px] text-[#6E6E6E] mb-6">
            <span>{t('splash.stops', { count: stops.length })}</span>
            <span className="w-1 h-1 rounded-full bg-[#6E6E6E]" />
            <span>{t('splash.duration', { min: 45 })}</span>
          </div>

          <div className="space-y-3 mb-6">
            <button
              onClick={onStartRoute}
              className="w-full h-14 rounded-full bg-[#E6FF00] text-[#111111] font-semibold text-[15px] flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(230,255,0,0.3)] active:scale-[0.96] transition-all"
            >
              <Footprints className="w-5 h-5" />
              {t('splash.start')}
            </button>

            <button
              onClick={onShowLocation}
              className="w-full h-14 rounded-full bg-[#1E1E1E] text-white text-[15px] font-medium flex items-center justify-center gap-2 border border-[#2C2C2C] active:scale-[0.96] transition-all"
            >
              <MapPin className="w-5 h-5 text-[#E6FF00]" />
              {t('splash.viewLocation')}
            </button>

            <button
              onClick={scrollToStops}
              className="w-full h-14 rounded-full text-[#A6A6A6] text-[15px] font-medium flex items-center justify-center gap-2 active:scale-[0.96] transition-all"
            >
              <ChevronDown className="w-5 h-5" />
              {t('splash.viewStops')}
            </button>

            <button
              onClick={onShowAddToHome}
              className="w-full text-center text-[13px] text-[#6E6E6E] hover:text-white transition-colors flex items-center justify-center gap-1.5 py-1"
            >
              <Smartphone className="w-3.5 h-3.5" />
              {t('pwa.title')}
            </button>
          </div>

          <div ref={stopsRef} className="border-t border-[#2C2C2C] pt-4">
            <h3 className="text-[11px] font-semibold text-[#6E6E6E] uppercase tracking-wider mb-3">
              {t('splash.tourStopsTitle')}
            </h3>
            <div className="space-y-1">
              {stops.map((stop, index) => {
                const isActive = stop.id === currentStopId;

                return (
                  <button
                    key={stop.id}
                    onClick={() => onSelectStop(stop.id)}
                    className={`w-full flex items-center gap-3 py-3 px-3 rounded-[16px] text-left transition-all ${
                      isActive
                        ? 'bg-[#E6FF00]/10 border border-[#E6FF00]/20'
                        : 'hover:bg-[#1E1E1E] border border-transparent'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] font-medium ${
                        stop.status === 'completed'
                          ? 'bg-[#AFFF00] text-[#111111]'
                          : isActive
                            ? 'bg-[#E6FF00] text-[#111111]'
                            : 'bg-[#1E1E1E] text-[#6E6E6E]'
                      }`}
                    >
                      {stop.status === 'completed' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-[15px] truncate ${
                        isActive ? 'text-[#E6FF00] font-medium' : 'text-white'
                      }`}>
                        {stop.name}
                      </p>
                      <p className="text-[11px] text-[#6E6E6E]">{stop.duration}</p>
                    </div>

                    {isActive && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-[#E6FF00] rounded-full shadow-[0_0_8px_rgba(230,255,0,0.6)] animate-pulse" />
                        <span className="text-[11px] text-[#E6FF00] font-medium">{t('player.playing')}</span>
                      </div>
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
