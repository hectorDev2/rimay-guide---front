import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';

interface DownloadModalProps {
  onClose: () => void;
  onDownloadComplete: () => void;
}

export function DownloadModal({ onClose, onDownloadComplete }: DownloadModalProps) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onDownloadComplete();
            onClose();
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50" role="dialog" aria-modal="true" aria-label={t('download.aria')}>
      <div className="bg-[#171717] rounded-[30px] p-8 max-w-sm w-full border border-[#2C2C2C] shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Download className="w-20 h-20 text-[#E6FF00]" />
            {isDownloading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-24 h-24 -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#E6FF00" strokeWidth="6" fill="none"
                    strokeDasharray={`${progress * 2.51} 251`}
                    className="transition-all duration-300" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </div>
        </div>

        <h3 className="text-[22px] font-semibold text-white text-center mb-3 leading-tight">
          {t('download.title')}
        </h3>
        <p className="text-center text-[#6E6E6E] text-[15px] mb-6">
          Sacsayhuamán (35 MB) · Recomendamos Wi-Fi
        </p>

        {isDownloading && (
          <div className="mb-6">
            <div className="h-2 bg-[#2C2C2C] rounded-full overflow-hidden">
              <div className="h-full bg-[#E6FF00] transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }} />
            </div>
            <p className="text-center text-sm text-[#6E6E6E] mt-2">{progress}%</p>
          </div>
        )}

        {!isDownloading && (
          <button onClick={handleDownload}
            className="w-full h-14 rounded-full bg-[#E6FF00] text-[#111111] font-semibold text-[15px] shadow-[0_8px_20px_rgba(230,255,0,0.3)] active:scale-[0.96] transition-all mb-4">
            {t('download.button')}
          </button>
        )}

        <p className="text-xs text-center text-[#6E6E6E]">
          {t('download.keepOpen')}
        </p>
      </div>
    </div>
  );
}
