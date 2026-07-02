import { motion } from 'motion/react';
import { Map, ArrowLeft, Share2 } from 'lucide-react';

interface TourCompleteScreenProps {
  tourName: string;
  totalStops: number;
  totalMinutes: number;
  onExploreMap: () => void;
  onGoHome: () => void;
}

export function TourCompleteScreen({
  tourName,
  totalStops,
  totalMinutes,
  onExploreMap,
  onGoHome,
}: TourCompleteScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full bg-[#0E0E0E] flex flex-col"
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 rounded-[30px] bg-[#1E1E1E] border border-[#2C2C2C] flex items-center justify-center mb-8 shadow-lg">
          <svg viewBox="0 0 24 24" fill="none" stroke="#D4A843" strokeWidth="1.5" className="w-12 h-12">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>

        <h1 className="text-[32px] font-bold text-white mb-2">
          Completaste
        </h1>
        <p className="text-[20px] font-medium text-[#D4A843] mb-6">
          {tourName}
        </p>

        <div className="flex items-center gap-6 mb-8">
          <div className="text-center">
            <p className="text-[28px] font-bold text-white">{totalStops}</p>
            <p className="text-[13px] text-[#6E6E6E]">paradas</p>
          </div>
          <div className="w-px h-10 bg-[#2C2C2C]" />
          <div className="text-center">
            <p className="text-[28px] font-bold text-white">{totalMinutes}</p>
            <p className="text-[13px] text-[#6E6E6E]">minutos</p>
          </div>
          <div className="w-px h-10 bg-[#2C2C2C]" />
          <div className="text-center">
            <p className="text-[28px] font-bold text-white">{totalStops}/9</p>
            <p className="text-[13px] text-[#6E6E6E]">completadas</p>
          </div>
        </div>

        <p className="text-[15px] text-[#A6A6A6] mb-10 leading-relaxed max-w-xs">
          Recorriste {totalMinutes} minutos de historia inca por las {totalStops} paradas de {tourName}.
        </p>

        <div className="w-full space-y-3 max-w-sm">
          <button
            onClick={onExploreMap}
            className="w-full h-14 rounded-full bg-[#D4A843] text-[#111111] font-semibold text-[15px] flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(212,168,67,0.3)] active:scale-[0.96] transition-all"
          >
            <Map className="w-5 h-5" />
            Explorar el mapa
          </button>

          <button
            onClick={onGoHome}
            className="w-full h-14 rounded-full bg-[#1E1E1E] text-white text-[15px] font-medium border border-[#2C2C2C] flex items-center justify-center gap-2 active:scale-[0.96] transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al inicio
          </button>
        </div>
      </div>
    </motion.div>
  );
}
