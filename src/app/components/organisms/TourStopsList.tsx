import { motion } from 'motion/react';
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-end"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Lista de paradas"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-[#171717] rounded-t-[30px] w-full max-h-[85vh] overflow-hidden flex flex-col border-t border-[#2C2C2C]/50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-[#2C2C2C] rounded-full" />
        </div>

        <div className="px-5 py-4 border-b border-[#2C2C2C]">
          <h3 className="text-[18px] font-semibold text-white mb-1">
            Sacsayhuamán
          </h3>
          <p className="text-[13px] text-[#6E6E6E]">9 paradas · 45 min</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {stops.map((stop, index) => (
            <div key={stop.id} className="relative">
              <button
                onClick={() => onSelectStop(stop.id)}
                className={`w-full px-5 py-4 flex items-center gap-4 transition-all duration-200 ${
                  stop.status === 'current' ? 'bg-[#E6FF00]/5' : ''
                } ${
                  stop.status === 'future' ? 'opacity-60 hover:opacity-100' : 'hover:bg-[#1E1E1E]'
                }`}
              >
                {stop.status === 'current' && (
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#E6FF00] shadow-[0_0_8px_rgba(230,255,0,0.5)]" />
                )}

                <div className="relative flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      stop.status === 'completed'
                        ? 'bg-[#AFFF00] text-[#111111]'
                        : stop.status === 'current'
                          ? 'bg-[#E6FF00] text-[#111111] shadow-[0_0_16px_rgba(230,255,0,0.3)]'
                          : 'bg-[#1E1E1E] text-[#6E6E6E] border border-[#2C2C2C]'
                    }`}
                  >
                    {stop.status === 'completed' ? (
                      <Check className="w-5 h-5" />
                    ) : stop.status === 'current' ? (
                      <Play className="w-5 h-5" fill="#111111" />
                    ) : (
                      <span className="text-[15px] font-medium">{stop.id}</span>
                    )}
                  </div>

                  {index < stops.length - 1 && (
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[2px] h-4">
                      <div className="w-full h-full" style={{
                        background: 'repeating-linear-gradient(0deg, #2C2C2C 0px, #2C2C2C 3px, transparent 3px, transparent 6px)'
                      }} />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-left">
                  <h4 className={`mb-0.5 transition-colors text-[15px] ${
                    stop.status === 'current' ? 'font-semibold text-[#E6FF00]' : ''
                  } ${
                    stop.status === 'completed' ? 'text-white/60' : 'text-white'
                  }`}>
                    {stop.name}
                  </h4>
                  <p className={`text-[11px] transition-colors ${
                    stop.status === 'completed' ? 'text-[#6E6E6E]' : 'text-[#6E6E6E]'
                  }`}>{stop.duration}</p>
                </div>

                {stop.status === 'current' && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#E6FF00] rounded-full shadow-[0_0_8px_rgba(230,255,0,0.6)] animate-pulse" />
                    <span className="text-[11px] text-[#E6FF00] font-medium">Reproduciendo</span>
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[#2C2C2C]">
          <button
            onClick={onClose}
            className="w-full h-14 rounded-full bg-[#1E1E1E] text-white text-[15px] font-medium flex items-center justify-center border border-[#2C2C2C] active:scale-[0.97] transition-all"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
