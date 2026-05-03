import { Share } from 'lucide-react';

interface AddToHomeScreenProps {
  onClose: () => void;
  onSkip: () => void;
}

export function AddToHomeScreen({ onClose, onSkip }: AddToHomeScreenProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 bg-[var(--stone-gray)] rounded-3xl flex items-center justify-center shadow-lg">
              <svg className="w-16 h-16 text-[var(--terracotta)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12" y2="18" strokeLinecap="round" />
              </svg>
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[var(--inca-gold)] rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
          </div>
        </div>

        <h3 className="text-2xl text-center mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
          Guardá Rimay en tu pantalla de inicio
        </h3>
        <p className="text-center text-[var(--muted-foreground)] mb-6">
          Accedé sin abrir el navegador. Tu tour queda guardado.
        </p>

        <div className="bg-[var(--stone-gray)]/40 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-[var(--andean-blue)] rounded-lg flex items-center justify-center">
              <Share className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm mb-1">
                Tocá <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white rounded border border-[var(--border)]">
                  <Share className="w-3 h-3" />
                </span> → "Agregar a pantalla de inicio"
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-[var(--terracotta)] text-white hover:bg-[#8B4513] transition-colors mb-3"
        >
          Entendido
        </button>

        <button
          onClick={onSkip}
          className="w-full py-2 text-[var(--muted-foreground)] hover:text-[var(--dark-charcoal)] transition-colors"
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}
