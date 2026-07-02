import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Wifi, WifiOff } from 'lucide-react';

export function OfflineToast() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      setMessage(t('offline.restored'));
      setShow(true);
      setTimeout(() => setShow(false), 3000);
    };

    const goOffline = () => {
      setIsOnline(false);
      setMessage(t('offline.mode'));
      setShow(true);
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [t]);

  if (!show) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 rounded-full text-[13px] font-medium flex items-center gap-2 shadow-lg transition-all duration-300 ${
        isOnline
          ? 'bg-[#AFFF00] text-[#111111]'
          : 'bg-[#FFB84D] text-[#111111]'
      }`}
    >
      {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
      {message}
    </div>
  );
}
