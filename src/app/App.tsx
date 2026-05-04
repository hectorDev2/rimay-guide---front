import { useState } from 'react';
import { SplashScreen } from './screens/SplashScreen';
import { DownloadModal } from './components/organisms/DownloadModal';
import { AudioPlayer } from './components/organisms/AudioPlayer';
import { TourStopsList } from './components/organisms/TourStopsList';
import { AddToHomeScreen } from './components/organisms/AddToHomeScreen';
import { DesignSystem } from './screens/DesignSystem';
import { LoginScreen } from './screens/LoginScreen';

type Screen = 'splash' | 'player' | 'design-system' | 'login';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showStopsList, setShowStopsList] = useState(false);
  const [showAddToHome, setShowAddToHome] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const handleDownloadComplete = () => {
    setIsDownloaded(true);
    setTimeout(() => {
      setShowAddToHome(true);
    }, 500);
  };

  const handleStartTour = () => {
    setCurrentScreen('player');
  };

  const handleShowAllStops = () => {
    setShowStopsList(true);
  };

  const handleSelectStop = (id: number) => {
    setShowStopsList(false);
    setCurrentScreen('player');
  };

  return (
    <div className="size-full relative">
      <div className="h-full w-full max-w-md mx-auto relative bg-white shadow-2xl">
        {currentScreen === 'splash' && (
          <SplashScreen
            onStartTour={handleStartTour}
            onShowAllStops={handleShowAllStops}
            isDownloaded={isDownloaded}
            onShowDownload={() => setShowDownloadModal(true)}
          />
        )}

        {currentScreen === 'player' && (
          <AudioPlayer onShowStopsList={() => setShowStopsList(true)} />
        )}

        {currentScreen === 'design-system' && <DesignSystem />}

        {currentScreen === 'login' && (
          <LoginScreen
            onLogin={() => setCurrentScreen('splash')}
            onSignUp={() => {}}
          />
        )}

        {showDownloadModal && (
          <DownloadModal
            onClose={() => setShowDownloadModal(false)}
            onDownloadComplete={handleDownloadComplete}
          />
        )}

        {showStopsList && (
          <TourStopsList
            onClose={() => setShowStopsList(false)}
            onSelectStop={handleSelectStop}
          />
        )}

        {showAddToHome && (
          <AddToHomeScreen
            onClose={() => setShowAddToHome(false)}
            onSkip={() => setShowAddToHome(false)}
          />
        )}
      </div>

      <div className="fixed bottom-6 right-6 flex gap-2 z-50">
        <button
          onClick={() => setCurrentScreen('splash')}
          className={`px-4 py-2 rounded-lg text-xs shadow-lg transition-colors ${
            currentScreen === 'splash'
              ? 'bg-[var(--terracotta)] text-white'
              : 'bg-white text-[var(--dark-charcoal)] border border-[var(--border)]'
          }`}
        >
          Splash
        </button>
        <button
          onClick={() => setCurrentScreen('player')}
          className={`px-4 py-2 rounded-lg text-xs shadow-lg transition-colors ${
            currentScreen === 'player'
              ? 'bg-[var(--terracotta)] text-white'
              : 'bg-white text-[var(--dark-charcoal)] border border-[var(--border)]'
          }`}
        >
          Player
        </button>
        <button
          onClick={() => setCurrentScreen('design-system')}
          className={`px-4 py-2 rounded-lg text-xs shadow-lg transition-colors ${
            currentScreen === 'design-system'
              ? 'bg-[var(--terracotta)] text-white'
              : 'bg-white text-[var(--dark-charcoal)] border border-[var(--border)]'
          }`}
        >
          Design
        </button>
        <button
          onClick={() => setCurrentScreen('login')}
          className={`px-4 py-2 rounded-lg text-xs shadow-lg transition-colors ${
            currentScreen === 'login'
              ? 'bg-[var(--terracotta)] text-white'
              : 'bg-white text-[var(--dark-charcoal)] border border-[var(--border)]'
          }`}
        >
          Login
        </button>
      </div>
    </div>
  );
}
