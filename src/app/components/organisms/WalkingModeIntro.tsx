import { Footprints, Volume2, MapPin } from 'lucide-react';

interface WalkingModeIntroProps {
  onContinue: () => void;
}

const STEPS = [
  { Icon: MapPin, text: 'Te guiamos con una flecha y una ruta en el mapa hasta la próxima parada.' },
  { Icon: Volume2, text: 'Al llegar, el audio de la parada se reproduce solo — no tenés que hacer nada.' },
  { Icon: Footprints, text: 'Podés abrir el mapa, el chat o la historia del lugar en cualquier momento.' },
];

/**
 * Explicador de una sola vez antes de entrar al modo caminata (navegación
 * GPS con avance automático). Sin esto, el usuario cae directo en el
 * mecanismo sin saber qué esperar.
 */
export function WalkingModeIntro({ onContinue }: WalkingModeIntroProps) {
  return (
    <div
      className="fixed inset-0 bg-[#0E0E0E] flex flex-col items-center justify-center p-6 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Cómo funciona el modo caminata"
    >
      <div className="max-w-sm w-full">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-[#E6FF00]/15 rounded-full flex items-center justify-center">
            <Footprints className="w-10 h-10 text-[#E6FF00]" />
          </div>
        </div>

        <h3 className="text-[24px] font-semibold text-white text-center mb-8 leading-tight">
          Así funciona el modo caminata
        </h3>

        <div className="space-y-4 mb-10">
          {STEPS.map(({ Icon, text }, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#1E1E1E] border border-[#2C2C2C] flex items-center justify-center">
                <Icon className="w-4 h-4 text-[#E6FF00]" />
              </div>
              <p className="text-[15px] text-white/85 leading-relaxed pt-1.5">{text}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onContinue}
          className="w-full h-14 rounded-full bg-[#E6FF00] text-[#111111] font-semibold text-[15px] shadow-[0_8px_20px_rgba(230,255,0,0.3)] active:scale-[0.96] transition-all"
        >
          Entendido, empezar
        </button>
      </div>
    </div>
  );
}
