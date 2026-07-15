import { useMemo } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { useStopContents } from '@/hooks/useStopContents';
import { ContentBlocks } from '@/lib/content/registry';

interface StopDetailSheetProps {
  stopId: string;
  stopName: string;
  onClose: () => void;
  /** Oculta el bloque de audio porque ya hay un reproductor de fondo para esta parada. */
  hideAudio?: boolean;
}

/**
 * Detalle de una parada, construido 100% desde sus bloques de contenido.
 * hideAudio excluye 'audio' cuando el player ya lo está reproduciendo en
 * segundo plano; si no, se muestra (ej. al abrir una parada desde el mapa
 * que no es la que está sonando).
 * Si el lugar tiene bloque model3d aparece "Explorar en 3D"; si no, la
 * experiencia se siente completa sin él.
 */
export function StopDetailSheet({ stopId, stopName, onClose, hideAudio = true }: StopDetailSheetProps) {
  const { blocks, loading } = useStopContents(stopId);
  const visibleBlocks = useMemo(
    () => (hideAudio ? blocks.filter((b) => b.type !== 'audio') : blocks),
    [blocks, hideAudio],
  );

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
      aria-label={stopName}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-[#171717] rounded-t-[30px] w-full h-[88vh] overflow-hidden flex flex-col border-t border-[#2C2C2C]/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0">
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-[#2C2C2C] rounded-full" />
          </div>
          <div className="px-5 pb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white truncate pr-4">{stopName}</h3>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1E1E1E] hover:bg-[#2C2C2C] flex items-center justify-center text-[#A6A6A6]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-6 text-white">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-[#6E6E6E] text-sm">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#E6FF00] border-t-transparent" />
              Cargando contenido...
            </div>
          ) : visibleBlocks.length === 0 ? (
            <p className="py-16 text-center text-sm text-[#6E6E6E]">
              Todavía no hay contenido adicional para este lugar.
            </p>
          ) : (
            <ContentBlocks blocks={visibleBlocks} />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
