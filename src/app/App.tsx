import { useState, useCallback } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate, useSearchParams } from 'react-router';
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { AudioPlayer } from './components/organisms/AudioPlayer';
import { TourStopsList, type TourStop } from './components/organisms/TourStopsList';
import { LocationModal } from './components/organisms/LocationModal';
import { DownloadModal } from './components/organisms/DownloadModal';
import { AddToHomeScreen } from './components/organisms/AddToHomeScreen';
import { useAuthStore } from '@/stores/authStore';
import { useTourStore } from '@/stores/tourStore';

const INITIAL_STOPS: TourStop[] = [
  { id: 1, name: 'Murallas Ciclópeas', duration: '4:00', status: 'completed', audioSrc: '/audio/placeholder.mp3', latitude: -13.5078, longitude: -71.9815 },
  { id: 2, name: 'Torreón de Muyucmarca', duration: '6:00', status: 'completed', audioSrc: '/audio/placeholder.mp3', latitude: -13.5085, longitude: -71.9820 },
  { id: 3, name: 'Sacsayhuamán — Fortaleza del Sol', duration: '5:30', status: 'current', audioSrc: '/voices/sacsayhuaman_es.mp3', latitude: -13.5075, longitude: -71.9825 },
  { id: 4, name: 'Plaza del Inca', duration: '5:00', status: 'future', audioSrc: '/audio/placeholder.mp3', latitude: -13.5068, longitude: -71.9830 },
  { id: 5, name: 'Templo de la Luna', duration: '7:00', status: 'future', audioSrc: '/audio/placeholder.mp3', latitude: -13.5060, longitude: -71.9820 },
  { id: 6, name: 'Túneles Subterráneos', duration: '8:00', status: 'future', audioSrc: '/audio/placeholder.mp3', latitude: -13.5065, longitude: -71.9805 },
  { id: 7, name: 'Mirador Panorámico', duration: '4:30', status: 'future', audioSrc: '/audio/placeholder.mp3', latitude: -13.5070, longitude: -71.9795 },
  { id: 8, name: 'Roca Sagrada', duration: '3:00', status: 'future', audioSrc: '/audio/placeholder.mp3', latitude: -13.5075, longitude: -71.9790 },
  { id: 9, name: 'Altar Ceremonial', duration: '5:00', status: 'future', audioSrc: '/audio/placeholder.mp3', latitude: -13.5080, longitude: -71.9800 },
];

function getCurrentStop(stops: TourStop[]): TourStop {
  return stops.find((s) => s.status === 'current') ?? stops[0];
}

function getNextStopName(stops: TourStop[], currentId: number): string | undefined {
  const currentIndex = stops.findIndex((s) => s.id === currentId);
  if (currentIndex === -1 || currentIndex >= stops.length - 1) return undefined;
  return stops[currentIndex + 1].name;
}

function useTourStops() {
  const navigate = useNavigate();
  const [stops, setStops] = useState<TourStop[]>(INITIAL_STOPS);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showAddToHome, setShowAddToHome] = useState(false);
  const isDownloaded = useTourStore((s) => s.isDownloaded);
  const setDownloaded = useTourStore((s) => s.setDownloaded);

  const markStops = useCallback((targetId: number) => {
    setStops((prev) => {
      const targetIndex = prev.findIndex((s) => s.id === targetId);
      return prev.map((s) => {
        const idx = prev.findIndex((x) => x.id === s.id);
        if (idx < targetIndex) return { ...s, status: 'completed' as const };
        if (idx === targetIndex) return { ...s, status: 'current' as const };
        return { ...s, status: 'future' as const };
      });
    });
  }, []);

  const handleSelectStop = useCallback((id: number) => {
    markStops(id);
    navigate(`/player?stopId=${id}`);
  }, [markStops, navigate]);

  const handleNext = useCallback(() => {
    const current = getCurrentStop(stops);
    const idx = stops.findIndex((s) => s.id === current.id);
    if (idx >= stops.length - 1) return;
    handleSelectStop(stops[idx + 1].id);
  }, [stops, handleSelectStop]);

  const handlePrev = useCallback(() => {
    const current = getCurrentStop(stops);
    const idx = stops.findIndex((s) => s.id === current.id);
    if (idx <= 0) return;
    handleSelectStop(stops[idx - 1].id);
  }, [stops, handleSelectStop]);

  const handleDownloadComplete = () => {
    setDownloaded(true);
    setTimeout(() => setShowAddToHome(true), 500);
  };

  return {
    stops,
    currentStop: getCurrentStop(stops),
    showLocationModal,
    showDownloadModal,
    showAddToHome,
    isDownloaded,
    setShowLocationModal,
    setShowDownloadModal,
    setShowAddToHome,
    handleSelectStop,
    handleNext,
    handlePrev,
    handleDownloadComplete,
  };
}

function TourRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { slug } = useParams<{ slug: string }>();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=/tour/${slug}`} replace />;
  }

  return <SplashRoute />;
}

function SplashRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const t = useTourStops();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <SplashScreen
        tourName="Sacsayhuamán — Fortaleza del Sol"
        stops={t.stops}
        currentStopId={t.currentStop.id}
        onSelectStop={t.handleSelectStop}
        onShowLocation={() => t.setShowLocationModal(true)}
      />

      {t.showLocationModal && (
        <LocationModal
          stops={t.stops}
          onClose={() => t.setShowLocationModal(false)}
        />
      )}

      {t.showDownloadModal && (
        <DownloadModal
          onClose={() => t.setShowDownloadModal(false)}
          onDownloadComplete={t.handleDownloadComplete}
        />
      )}

      {t.showAddToHome && (
        <AddToHomeScreen
          onClose={() => t.setShowAddToHome(false)}
          onSkip={() => t.setShowAddToHome(false)}
        />
      )}
    </>
  );
}

function PlayerRoute() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [searchParams] = useSearchParams();
  const stopId = Number(searchParams.get('stopId')) || INITIAL_STOPS[2].id;
  const t = useTourStops();
  const [showStopsList, setShowStopsList] = useState(false);

  const currentStop = t.stops.find((s) => s.id === stopId) ?? t.currentStop;

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=/player?stopId=${stopId}`} replace />;
  }

  return (
    <>
      <AudioPlayer
        stop={currentStop}
        onShowStopsList={() => setShowStopsList(true)}
        onNext={t.handleNext}
        onPrev={t.handlePrev}
        nextStopName={getNextStopName(t.stops, currentStop.id)}
        onBack={() => navigate('/')}
      />

      {showStopsList && (
        <TourStopsList
          stops={t.stops}
          onClose={() => setShowStopsList(false)}
          onSelectStop={(id) => {
            setShowStopsList(false);
            t.handleSelectStop(id);
          }}
        />
      )}
    </>
  );
}

function LoginRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const redirect = searchParams.get('redirect') ?? '/';

  if (isAuthenticated) {
    return <Navigate to={redirect} replace />;
  }

  return (
    <LoginScreen
      onLogin={() => {
        login('', '');
        navigate(redirect, { replace: true });
      }}
      onSignUp={() => {}}
    />
  );
}

export default function App() {
  return (
    <div className="size-full relative">
      <div className="h-full w-full max-w-md mx-auto relative bg-white shadow-2xl overflow-hidden">
        <Routes>
          <Route path="/" element={<SplashRoute />} />
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/player" element={<PlayerRoute />} />
          <Route path="/tour/:slug" element={<TourRoute />} />
        </Routes>
      </div>
    </div>
  );
}
