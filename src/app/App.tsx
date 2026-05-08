import { useState, useEffect } from 'react';
import { SplashScreen } from './screens/SplashScreen';
import { AudioPlayer } from './components/organisms/AudioPlayer';
import { TourStopsList, TourStop } from './components/organisms/TourStopsList';
import { LoginScreen } from './screens/LoginScreen';

const initialStops: TourStop[] = [
  { id: 1, name: 'Entrada Principal', duration: '4 min', status: 'current', audioSrc: '/voices/sacsayhuaman_es.mp3' },
  { id: 2, name: 'Murallas Ciclópeas', duration: '7 min', status: 'future', audioSrc: '/audio/placeholder.mp3' },
  { id: 3, name: 'Plaza del Inca', duration: '6 min', status: 'future', audioSrc: '/audio/placeholder.mp3' },
  { id: 4, name: 'La Gran Plaza', duration: '5 min', status: 'future', audioSrc: '/audio/placeholder.mp3' },
  { id: 5, name: 'Torre del Sol', duration: '8 min', status: 'future', audioSrc: '/audio/placeholder.mp3' },
  { id: 6, name: 'Sector de Rodaderos', duration: '4 min', status: 'future', audioSrc: '/audio/placeholder.mp3' },
  { id: 7, name: 'Cámara Ceremonial', duration: '6 min', status: 'future', audioSrc: '/audio/placeholder.mp3' },
  { id: 8, name: 'Piedra de los Doce Ángulos', duration: '3 min', status: 'future', audioSrc: '/audio/placeholder.mp3' },
  { id: 9, name: 'Mirador del Valle', duration: '2 min', status: 'future', audioSrc: '/audio/placeholder.mp3' },
];

const SCREENS = ['login', 'splash', 'player'] as const;
type Screen = typeof SCREENS[number];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [showStopsList, setShowStopsList] = useState(false);
  const [stops, setStops] = useState<TourStop[]>(initialStops);
  const [currentStop, setCurrentStop] = useState<TourStop | null>(() => {
    const initialCurrent = initialStops.find(s => s.status === 'current');
    if (initialCurrent) {
      return initialCurrent;
    }
    if (initialStops.length > 0) {
      return initialStops[0];
    }
    return null;
  });

  const updateStopsStatus = (selectedStopId: number) => {
    setStops(currentStops => currentStops.map(stop => ({
      ...stop,
      status: stop.id < selectedStopId ? 'completed' : stop.id === selectedStopId ? 'current' : 'future'
    })));
  };

  const handleStartTour = () => {
    const firstPlayableStop = stops.find(s => s.status !== 'completed') || stops[0];
    if (firstPlayableStop) {
      setCurrentStop(firstPlayableStop);
      updateStopsStatus(firstPlayableStop.id);
    }
    setCurrentScreen('player');
  };

  const handleShowAllStops = () => {
    setShowStopsList(true);
  };

  const handleSelectStop = (id: number) => {
    const selected = stops.find(s => s.id === id);
    if (selected) {
      setCurrentStop(selected);
      updateStopsStatus(id);
    }
    setShowStopsList(false);
    setCurrentScreen('player');
  };

  const handleNextPrev = (direction: 'next' | 'prev') => {
    if (!currentStop) return;
    const currentIndex = stops.findIndex(s => s.id === currentStop.id);
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < stops.length) {
      const newStop = stops[nextIndex];
      setCurrentStop(newStop);
      updateStopsStatus(newStop.id);
    }
  };

  const getScreenPosition = (screen: Screen) => {
    const screenIndex = SCREENS.indexOf(screen);
    const currentScreenIndex = SCREENS.indexOf(currentScreen);
    if (screenIndex === currentScreenIndex) {
      return 'translate-x-0';
    }
    if (screenIndex < currentScreenIndex) {
      return '-translate-x-full';
    }
    return 'translate-x-full';
  };

  return (
    <div className="size-full relative">
      <div className="h-full w-full max-w-md mx-auto relative bg-white shadow-2xl overflow-hidden">
        <div className={`absolute inset-0 h-full w-full transition-transform duration-500 ease-in-out ${getScreenPosition('splash')}`}>
          <SplashScreen
            onStartTour={handleStartTour}
            onShowAllStops={handleShowAllStops}
          />
        </div>

        <div className={`absolute inset-0 h-full w-full transition-transform duration-500 ease-in-out ${getScreenPosition('player')}`}>
          {currentStop && (
            <AudioPlayer
              key={currentStop.id}
              stop={currentStop}
              onShowStopsList={() => setShowStopsList(true)}
              onNext={() => handleNextPrev('next')}
              onPrev={() => handleNextPrev('prev')}
              nextStopName={stops.find(s => s.id === currentStop.id + 1)?.name}
            />
          )}
        </div>

        <div className={`absolute inset-0 h-full w-full transition-transform duration-500 ease-in-out ${getScreenPosition('login')}`}>
          <LoginScreen
            onLogin={() => setCurrentScreen('splash')}
            onSignUp={() => {}}
          />
        </div>

        {showStopsList && (
          <TourStopsList
            stops={stops}
            onClose={() => setShowStopsList(false)}
            onSelectStop={handleSelectStop}
          />
        )}
      </div>
    </div>
  );
}
