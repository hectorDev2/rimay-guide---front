import { useState } from 'react';

interface DownloadModalProps {
  onClose: () => void;
  onDownloadComplete: () => void;
}

export function DownloadModal({ onClose, onDownloadComplete }: DownloadModalProps) {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="inca-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M0,10 L10,0 L20,10 L10,20 Z" fill="var(--terracotta)" />
            </pattern>
            <rect width="100" height="100" fill="url(#inca-pattern)" />
          </svg>
        </div>

        <div className="relative">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <svg className="w-20 h-20 text-[var(--andean-blue)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M7 10l5 5 5-5"/>
                <path d="M12 15V3"/>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              </svg>
              {isDownloading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-24 h-24 -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="var(--inca-gold)"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${progress * 2.51} 251`}
                      className="transition-all duration-300"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          <h3 className="text-2xl text-center mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
            Descargá el tour antes de llegar
          </h3>
          <p className="text-center text-[var(--muted-foreground)] mb-6">
            Sacsayhuamán (35 MB) · Recomendamos Wi-Fi
          </p>

          {isDownloading && (
            <div className="mb-6">
              <div className="h-2 bg-[var(--stone-gray)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--inca-gold)] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-center text-sm text-[var(--muted-foreground)] mt-2">{progress}%</p>
            </div>
          )}

          {!isDownloading && (
            <button
              onClick={handleDownload}
              className="w-full py-4 rounded-2xl bg-[var(--terracotta)] text-white hover:bg-[#8B4513] transition-colors mb-4"
            >
              Descargar ahora
            </button>
          )}

          <p className="text-xs text-center text-[var(--muted-foreground)]">
            Mantené esta pantalla abierta durante la descarga
          </p>
        </div>
      </div>
    </div>
  );
}
