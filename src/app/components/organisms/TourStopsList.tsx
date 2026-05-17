import { Check, Play } from 'lucide-react';

export interface TourStopDisplay {
  id: string;
  name: string;
  duration: string;
  status: 'completed' | 'current' | 'future';
  audioSrc: string;
  latitude: number;
  longitude: number;
}

interface TourStopsListProps {
  stops: TourStopDisplay[];
  onClose: () => void;
  onSelectStop: (id: string) => void;
}

export function TourStopsList({ stops, onClose, onSelectStop }: TourStopsListProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
            Sacsayhuamán
          </h3>
          <p className="text-sm text-[var(--muted-foreground)]">9 paradas · 45 min</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {stops.map((stop, index) => (
            <div key={stop.id} className="relative">
              <button
                onClick={() => onSelectStop(stop.id)}
                className={`w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-100 transition-all duration-200 ${
                  stop.status === 'current' ? 'bg-[#1a365d]/10' : ''
                } ${
                  stop.status === 'future' ? 'opacity-60 hover:opacity-100' : ''
                }`}
              >
                {stop.status === 'current' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1a365d]"></div>
                )}

                <div className="relative flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      stop.status === 'completed'
                        ? 'bg-[#1a365d]/80 text-white'
                        : stop.status === 'current'
                        ? 'bg-[#1a365d] text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {stop.status === 'completed' ? (
                      <Check className="w-5 h-5" />
                    ) : stop.status === 'current' ? (
                      <Play className="w-5 h-5" fill="white" />
                    ) : (
                      <span>{stop.id}</span>
                    )}
                  </div>

                  {index < stops.length - 1 && (
                    <svg
                      className="absolute top-12 left-1/2 -translate-x-1/2 h-4"
                      width="2"
                      height="16"
                    >
                      <pattern id={`dots-${stop.id}`} x="0" y="0" width="2" height="4" patternUnits="userSpaceOnUse">
                        <circle cx="1" cy="2" r="1" fill="#D1D5DB" />
                      </pattern>
                      <rect width="2" height="16" fill={`url(#dots-${stop.id})`} />
                    </svg>
                  )}
                </div>

                <div className="flex-1 text-left">
                  <h4 className={`mb-0.5 transition-colors ${
                    stop.status === 'current' ? 'font-semibold text-[#1a365d]' : ''
                  } ${
                    stop.status === 'completed' ? 'text-gray-500' : 'text-gray-800'
                  }`}>
                    {stop.name}
                  </h4>
                  <p className={`text-sm transition-colors ${
                    stop.status === 'completed' ? 'text-gray-400' : 'text-gray-500'
                  }`}>{stop.duration}</p>
                </div>

                {stop.status === 'current' && (
                  <div className="flex items-center gap-1 text-[#1a365d]">
                    <div className="w-2 h-2 bg-[#1a365d] rounded-full animate-pulse"></div>
                    <span className="text-xs">Reproduciendo</span>
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 bg-gray-200/50">
          <div className="h-12 flex items-center justify-center opacity-20">
            <svg width="100" height="20" viewBox="0 0 100 20">
              <pattern id="textile" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M0,10 L10,0 L20,10 L10,20 Z" fill="var(--terracotta)" opacity="0.5" />
              </pattern>
              <rect width="100" height="20" fill="url(#textile)" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
