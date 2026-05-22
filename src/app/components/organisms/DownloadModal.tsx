import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTourStore } from '@/stores/tourStore';

interface DownloadModalProps {
  onClose: () => void;
  onDownloadComplete: () => void;
}

function getUniqueAudioUrls(stops: { audioSrc: string }[]): string[] {
  return [...new Set(stops.map((s) => s.audioSrc))];
}

export function DownloadModal({ onClose, onDownloadComplete }: DownloadModalProps) {
  const { t } = useTranslation();
  const tour = useTourStore((s) => s.tour);
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'downloading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const workerRef = useRef<Worker | null>(null);

  const handleDownload = useCallback(() => {
    if (!tour) return;

    const urls = getUniqueAudioUrls(tour.stops);
    if (urls.length === 0) {
      setErrorMsg('No hay audio para descargar');
      setStatus('error');
      return;
    }

    setIsDownloading(true);
    setStatus('downloading');
    setProgress(0);

    const worker = new Worker(
      new URL('@/workers/downloadWorker.ts', import.meta.url),
      { type: 'module' },
    );
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const msg = e.data;

      if (msg.type === 'progress') {
        setProgress(msg.percent);
      }

      if (msg.type === 'complete') {
        worker.terminate();
        workerRef.current = null;
        setProgress(100);
        setStatus('done');
        if (msg.failed.length > 0) {
          setErrorMsg(`Fallaron ${msg.failed.length} archivo(s)`);
          setStatus('error');
          return;
        }
        setTimeout(() => {
          onDownloadComplete();
          onClose();
        }, 800);
      }

      if (msg.type === 'error') {
        worker.terminate();
        workerRef.current = null;
        setErrorMsg(msg.message);
        setStatus('error');
      }
    };

    worker.onerror = () => {
      worker.terminate();
      workerRef.current = null;
      setErrorMsg('Error al iniciar la descarga');
      setStatus('error');
    };

    worker.postMessage({
      type: 'download',
      urls,
      cacheName: 'rimay-audio-v1',
    });
  }, [tour, onDownloadComplete, onClose]);

  const totalMb = tour ? (getUniqueAudioUrls(tour.stops).length * 0.572).toFixed(1) : '—';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50" role="dialog" aria-modal="true" aria-label={t('download.aria')}>
      <div className="bg-[#171717] rounded-[30px] p-8 max-w-sm w-full border border-[#2C2C2C] shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
        <div className="flex justify-center mb-6">
          <div className="relative">
            {status === 'done' ? (
              <CheckCircle2 className="w-20 h-20 text-[#AFFF00]" />
            ) : status === 'error' ? (
              <AlertCircle className="w-20 h-20 text-[#FF4D67]" />
            ) : (
              <Download className="w-20 h-20 text-[#E6FF00]" />
            )}
            {isDownloading && status !== 'done' && status !== 'error' && (
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
          {status === 'done' ? '¡Descarga completa!' : status === 'error' ? 'Error de descarga' : t('download.title')}
        </h3>
        <p className="text-center text-[#6E6E6E] text-[15px] mb-6">
          {status === 'done'
            ? 'Ya podés usar Rimay sin conexión'
            : status === 'error'
              ? errorMsg
              : `${tour?.name ?? 'Tour'} (${totalMb} MB) · Recomendamos Wi-Fi`
          }
        </p>

        {isDownloading && status !== 'error' && (
          <div className="mb-6">
            <div className="h-2 bg-[#2C2C2C] rounded-full overflow-hidden">
              <div className="h-full bg-[#E6FF00] transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }} />
            </div>
            <p className="text-center text-sm text-[#6E6E6E] mt-2">{progress}%</p>
          </div>
        )}

        {status === 'idle' && (
          <button onClick={handleDownload}
            className="w-full h-14 rounded-full bg-[#E6FF00] text-[#111111] font-semibold text-[15px] shadow-[0_8px_20px_rgba(230,255,0,0.3)] active:scale-[0.96] transition-all mb-4">
            {t('download.button')}
          </button>
        )}

        {status === 'error' && (
          <button onClick={handleDownload}
            className="w-full h-14 rounded-full bg-[#E6FF00] text-[#111111] font-semibold text-[15px] shadow-[0_8px_20px_rgba(230,255,0,0.3)] active:scale-[0.96] transition-all mb-4">
            Reintentar
          </button>
        )}

        {status === 'done' && (
          <button onClick={onClose}
            className="w-full h-14 rounded-full bg-[#E6FF00] text-[#111111] font-semibold text-[15px] shadow-[0_8px_20px_rgba(230,255,0,0.3)] active:scale-[0.96] transition-all mb-4">
            Listo
          </button>
        )}

        {status === 'idle' && (
          <p className="text-xs text-center text-[#6E6E6E]">
            {t('download.keepOpen')}
          </p>
        )}
      </div>
    </div>
  );
}
