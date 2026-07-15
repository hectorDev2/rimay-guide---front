import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Map, ArrowLeft, Share2, Link2, Check } from 'lucide-react';

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
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = `🏔️ ¡Completé el tour "${tourName}" con Rimay Guide! ${totalStops} paradas y ${totalMinutes} minutos de historia inca.`;
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Rimay Guide', text: shareText, url: shareUrl });
        return;
      } catch {
        // usuario canceló o no soportado: caemos al menú manual
      }
    }
    setShowShareMenu((v) => !v);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard no disponible
    }
  };

  const encoded = encodeURIComponent(`${shareText} ${shareUrl}`);
  const shareLinks = [
    { name: 'WhatsApp', href: `https://wa.me/?text=${encoded}`, color: '#25D366' },
    { name: 'X', href: `https://twitter.com/intent/tweet?text=${encoded}`, color: '#FFFFFF' },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, color: '#1877F2' },
  ];

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
            onClick={handleShare}
            className="w-full h-14 rounded-full bg-[#E6FF00] text-[#111111] font-semibold text-[15px] flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(230,255,0,0.3)] active:scale-[0.96] transition-all"
          >
            <Share2 className="w-5 h-5" />
            Compartir mi logro
          </button>

          <AnimatePresence>
            {showShareMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-center gap-2 py-1">
                  {shareLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 h-11 rounded-full bg-[#1E1E1E] border border-[#2C2C2C] flex items-center justify-center text-[13px] font-medium hover:bg-[#2C2C2C] transition-all active:scale-95"
                      style={{ color: link.color }}
                    >
                      {link.name}
                    </a>
                  ))}
                  <button
                    onClick={handleCopy}
                    aria-label="Copiar enlace"
                    className="w-11 h-11 rounded-full bg-[#1E1E1E] border border-[#2C2C2C] flex items-center justify-center text-white hover:bg-[#2C2C2C] transition-all active:scale-95"
                  >
                    {copied ? <Check className="w-4 h-4 text-[#AFFF00]" /> : <Link2 className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
