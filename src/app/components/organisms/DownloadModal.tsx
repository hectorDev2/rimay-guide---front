import { useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, Wifi, Smartphone } from 'lucide-react';
import { useTourStore } from '@/stores/tourStore';
import { fetchTourMediaUrls } from '@/services/contentService';

interface DownloadModalProps {
  onClose: () => void;
  onDownloadComplete: () => void;
}

function getUniqueAudioUrls(stops: { audioSrc: string }[]): string[] {
  return [...new Set(stops.map((s) => s.audioSrc))];
}

export function DownloadModal({ onClose, onDownloadComplete }: DownloadModalProps) {
  const tour = useTourStore((s) => s.tour);
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'downloading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const workerRef = useRef<Worker | null>(null);

  const handleDownload = useCallback(async () => {
    if (!tour) return;

    // Audio legado + todos los medios publicados (imágenes, galerías, audios).
    // Los model3d quedan fuera: se descargan bajo demanda al abrir el visor.
    let contentUrls: string[] = [];
    try {
      contentUrls = await fetchTourMediaUrls(tour.id);
    } catch {
      // sin conexión a la BD: se descarga al menos el audio legado
    }
    const urls = [...new Set([...getUniqueAudioUrls(tour.stops), ...contentUrls])];
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50" role="dialog" aria-modal="true" aria-label="Descargar tour">
      <div className="bg-[#171717] rounded-[30px] p-8 max-w-sm w-full border border-[#2C2C2C] shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
        <div className="flex justify-center mb-6">
          {status === 'done' ? (
            <CheckCircle2 className="w-20 h-20 text-[#AFFF00]" />
          ) : status === 'error' ? (
            <AlertCircle className="w-20 h-20 text-[#FF4D67]" />
          ) : (
            <div className="w-20 h-20 rounded-[22px] bg-[#1E1E1E] border border-[#2C2C2C] flex items-center justify-center">
              <Wifi className={`w-10 h-10 text-[#D4A843] ${isDownloading ? 'animate-pulse' : ''}`} />
            </div>
          )}
        </div>

        <h3 className="text-[22px] font-semibold text-white text-center mb-3 leading-tight">
          {status === 'done'
            ? '¡Tour listo para escuchar!'
            : status === 'error'
            ? 'Error de descarga'
            : status === 'downloading'
            ? 'Descargando…'
            : 'Llevate el tour sin internet'}
        </h3>
        <p className="text-center text-[#A6A6A6] text-[15px] mb-6">
          {status === 'done'
            ? 'Ya podés escuchar el tour aunque no haya señal en las ruinas.'
            : status === 'error'
            ? errorMsg
            : status === 'downloading'
            ? `Audios del tour · ${totalMb} MB`
            : 'En Sacsayhuamán la señal es inestable. Descargá ahora y escuchá sin cortes.'}
        </p>

        {status === 'downloading' && (
          <div className="mb-6">
            <div className="h-2 bg-[#2C2C2C] rounded-full overflow-hidden">
              <div className="h-full bg-[#D4A843] transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }} />
            </div>
            <p className="text-center text-sm text-[#6E6E6E] mt-2">{progress}%</p>
          </div>
        )}

        {status === 'idle' && (
          <>
            <button onClick={handleDownload}
              className="w-full h-14 rounded-full bg-[#D4A843] text-[#111111] font-semibold text-[15px] shadow-[0_8px_20px_rgba(212,168,67,0.3)] active:scale-[0.96] transition-all mb-3 flex items-center justify-center gap-2">
              <Wifi className="w-5 h-5" />
              Descargar con Wi-Fi
            </button>
            <button onClick={handleDownload}
              className="w-full h-14 rounded-full bg-[#1E1E1E] text-white text-[15px] font-medium border border-[#2C2C2C] active:scale-[0.96] transition-all mb-3 flex items-center justify-center gap-2">
              <Smartphone className="w-5 h-5 text-[#A6A6A6]" />
              Descargar igual con datos
            </button>
            <button onClick={onClose}
              className="w-full text-center text-[13px] text-[#6E6E6E] hover:text-white transition-colors py-2">
              Ahora no
            </button>
          </>
        )}

        {status === 'error' && (
          <button onClick={handleDownload}
            className="w-full h-14 rounded-full bg-[#D4A843] text-[#111111] font-semibold text-[15px] shadow-[0_8px_20px_rgba(212,168,67,0.3)] active:scale-[0.96] transition-all mb-4">
            Reintentar
          </button>
        )}

        {status === 'done' && (
          <button onClick={onClose}
            className="w-full h-14 rounded-full bg-[#D4A843] text-[#111111] font-semibold text-[15px] shadow-[0_8px_20px_rgba(212,168,67,0.3)] active:scale-[0.96] transition-all mb-4">
            Listo
          </button>
        )}

        {status === 'idle' && (
          <p className="text-xs text-center text-[#6E6E6E] mt-2">
            {totalMb} MB · ~30 seg en Wi-Fi
          </p>
        )}
      </div>
    </div>
  );
}
