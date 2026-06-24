import { useTranslation } from 'react-i18next';
import { Share, Smartphone, MoreVertical } from 'lucide-react';

interface AddToHomeScreenProps {
  onClose: () => void;
  onSkip: () => void;
}

function detectPlatform(): 'ios' | 'android' | 'other' {
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'other';
}

export function AddToHomeScreen({ onClose, onSkip }: AddToHomeScreenProps) {
  const { t } = useTranslation();
  const platform = detectPlatform();

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50" role="dialog" aria-modal="true" aria-label={t('pwa.aria')}>
      <div className="bg-[#171717] rounded-[30px] p-8 max-w-sm w-full border border-[#2C2C2C] shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 bg-[#1E1E1E] rounded-[30px] flex items-center justify-center shadow-lg border border-[#2C2C2C]">
              <Smartphone className="w-16 h-16 text-[#E6FF00]" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#E6FF00] rounded-[14px] flex items-center justify-center shadow-[0_4px_12px_rgba(230,255,0,0.3)]">
              <svg className="w-6 h-6 text-[#111111]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
          </div>
        </div>

        <h3 className="text-[22px] font-semibold text-white text-center mb-3 leading-tight">
          {t('pwa.title')}
        </h3>
        <p className="text-center text-[#6E6E6E] text-[15px] mb-6">
          {t('pwa.subtitle')}
        </p>

        <div className="bg-[#1E1E1E] rounded-[22px] p-4 mb-6 border border-[#2C2C2C]">
          {platform === 'android' ? (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#E6FF00]/20 flex items-center justify-center">
                <MoreVertical className="w-4 h-4 text-[#E6FF00]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white leading-relaxed">
                  Tocá{' '}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#171717] rounded border border-[#2C2C2C]">
                    <MoreVertical className="w-3 h-3 text-white" />
                  </span>
                  {' '}en la barra del navegador y elegí{' '}
                  <span className="font-medium text-[#E6FF00]">Añadir a pantalla de inicio</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#E6FF00]/20 flex items-center justify-center">
                <Share className="w-4 h-4 text-[#E6FF00]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white leading-relaxed">
                  Tocá{' '}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#171717] rounded border border-[#2C2C2C]">
                    <Share className="w-3 h-3 text-white" />
                  </span>
                  {' '}y luego{' '}
                  <span className="font-medium text-[#E6FF00]">Agregar a pantalla de inicio</span>
                </p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full h-14 rounded-full bg-[#E6FF00] text-[#111111] font-semibold text-[15px] shadow-[0_8px_20px_rgba(230,255,0,0.3)] active:scale-[0.96] transition-all mb-3"
        >
          {t('pwa.gotIt')}
        </button>

        <button
          onClick={onSkip}
          className="w-full py-2 text-[#6E6E6E] hover:text-white transition-colors"
        >
          {t('pwa.notNow')}
        </button>
      </div>
    </div>
  );
}
