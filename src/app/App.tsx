import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate, useSearchParams } from 'react-router';
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { AudioPlayer } from './components/organisms/AudioPlayer';
import { TourStopsList, type TourStopDisplay } from './components/organisms/TourStopsList';
import { LocationModal } from './components/organisms/LocationModal';
import { DownloadModal } from './components/organisms/DownloadModal';
import { AddToHomeScreen } from './components/organisms/AddToHomeScreen';
import { DebugLocationPanel } from './components/organisms/DebugLocationPanel';
import { useAuthStore } from '@/stores/authStore';
import { useTourStore } from '@/stores/tourStore';
import { useChatStore } from '@/stores/chatStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { SACSAYHUAMAN_TOUR, toDisplayStops } from '@/lib/tour/types';

function useTourStops() {
  const navigate = useNavigate();
  const tour = useTourStore((s) => s.tour) ?? SACSAYHUAMAN_TOUR;
  const completedIds = useTourStore((s) => s.completedIds);
  const [currentStopId, setCurrentStopId] = useState(tour.stops[2]?.id ?? tour.stops[0]?.id);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showAddToHome, setShowAddToHome] = useState(false);
  const isDownloaded = useTourStore((s) => s.isDownloaded);
  const setDownloaded = useTourStore((s) => s.setDownloaded);

  const stops = useMemo(
    () => toDisplayStops(tour.stops, new Set(completedIds), currentStopId),
    [tour.stops, completedIds, currentStopId],
  );

  const currentStop = stops.find((s) => s.status === 'current') ?? stops[0];

  const getNextStopName = useCallback((id: string): string | undefined => {
    const idx = stops.findIndex((s) => s.id === id);
    if (idx === -1 || idx >= stops.length - 1) return undefined;
    return stops[idx + 1].name;
  }, [stops]);

  const handleSelectStop = useCallback((id: string) => {
    setCurrentStopId(id);
    navigate(`/player?stopId=${id}`);
  }, [navigate]);

  const handleNext = useCallback(() => {
    const idx = stops.findIndex((s) => s.id === currentStop.id);
    if (idx >= stops.length - 1) return;
    handleSelectStop(stops[idx + 1].id);
  }, [stops, currentStop, handleSelectStop]);

  const handlePrev = useCallback(() => {
    const idx = stops.findIndex((s) => s.id === currentStop.id);
    if (idx <= 0) return;
    handleSelectStop(stops[idx - 1].id);
  }, [stops, currentStop, handleSelectStop]);

  const handleDownloadComplete = () => {
    setDownloaded(true);
    setTimeout(() => setShowAddToHome(true), 500);
  };

  return {
    stops,
    currentStop,
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
    getNextStopName,
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
  const paramId = searchParams.get('stopId');
  const t = useTourStops();
  const [showStopsList, setShowStopsList] = useState(false);
  const [geoEnabled, setGeoEnabled] = useState(false);
  const autoNavRef = useRef(false);

  const currentStop = paramId
    ? t.stops.find((s) => s.id === paramId) ?? t.currentStop
    : t.currentStop;

  useEffect(() => {
    setGeoEnabled(true);
  }, []);

  useGeolocation({
    enabled: geoEnabled,
    stops: t.stops,
    onEnterStop: (detectedStopId) => {
      if (detectedStopId !== currentStop.id) {
        t.handleSelectStop(detectedStopId);
      }
    },
  });

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=/player?stopId=${currentStop.id}`} replace />;
  }

  return (
    <>
      <AudioPlayer
        stop={currentStop}
        onShowStopsList={() => setShowStopsList(true)}
        onNext={t.handleNext}
        onPrev={t.handlePrev}
        nextStopName={t.getNextStopName(currentStop.id)}
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
