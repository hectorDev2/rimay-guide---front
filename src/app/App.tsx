import { useState, useCallback, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate, useSearchParams } from 'react-router';
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { AudioPlayer } from './components/organisms/AudioPlayer';
import { TourStopsList, type TourStop } from './components/organisms/TourStopsList';
import { LocationModal } from './components/organisms/LocationModal';
import { DownloadModal } from './components/organisms/DownloadModal';
import { AddToHomeScreen } from './components/organisms/AddToHomeScreen';
import { DebugLocationPanel } from './components/organisms/DebugLocationPanel';
import { useAuthStore } from '@/stores/authStore';
import { useTourStore } from '@/stores/tourStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { INITIAL_STOPS } from '@/services/tourData';

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
  const [geoEnabled, setGeoEnabled] = useState(false);
  const autoNavRef = useRef(false);

  const currentStop = t.stops.find((s) => s.id === stopId) ?? t.currentStop;

  useEffect(() => {
    setGeoEnabled(true);
  }, []);

  useGeolocation({
    enabled: geoEnabled,
    stops: t.stops,
    onEnterStop: (detectedStopId) => {
      if (detectedStopId !== stopId) {
        t.handleSelectStop(detectedStopId);
      }
    },
  });

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

      <DebugLocationPanel stops={t.stops} onEnterStop={t.handleSelectStop} currentStopId={currentStop.id} />
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
