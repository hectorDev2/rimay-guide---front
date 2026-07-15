import { MapPin, Navigation } from 'lucide-react';

interface LocationPrimerProps {
  onContinue: () => void;
}

/**
 * Se muestra antes de disparar el permiso nativo de geolocalización del
 * navegador. Explicar el "por qué" primero mejora mucho la tasa de
 * aceptación frente al diálogo nativo pedido en frío.
 */
export function LocationPrimer({ onContinue }: LocationPrimerProps) {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Activar ubicación"
    >
      <div className="bg-[#171717] rounded-[30px] p-8 max-w-sm w-full border border-[#2C2C2C] shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24 bg-[#E6FF00]/15 rounded-full flex items-center justify-center">
            <MapPin className="w-11 h-11 text-[#E6FF00]" />
          </div>
        </div>

        <h3 className="text-[22px] font-semibold text-white text-center mb-3 leading-tight">
          Necesitamos tu ubicación
        </h3>
        <p className="text-center text-[#6E6E6E] text-[15px] mb-6">
          La usamos para guiarte a pie entre paradas y avisarte cuando llegás a cada lugar. Nunca se comparte ni se guarda en un servidor.
        </p>

        <div className="bg-[#1E1E1E] rounded-[22px] p-4 mb-6 border border-[#2C2C2C] flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#E6FF00]/20 flex items-center justify-center">
            <Navigation className="w-4 h-4 text-[#E6FF00]" />
          </div>
          <p className="text-sm text-white leading-relaxed">
            Tu navegador va a pedirte permiso ahora — elegí <span className="font-medium text-[#E6FF00]">Permitir</span> para que el recorrido funcione.
          </p>
        </div>

        <button
          onClick={onContinue}
          className="w-full h-14 rounded-full bg-[#E6FF00] text-[#111111] font-semibold text-[15px] shadow-[0_8px_20px_rgba(230,255,0,0.3)] active:scale-[0.96] transition-all"
        >
          Activar ubicación
        </button>
      </div>
    </div>
  );
}
