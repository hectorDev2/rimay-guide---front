import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate, useSearchParams, useLocation } from 'react-router';
import { AnimatePresence } from 'motion/react';
import { LogOut, AlertTriangle, RefreshCw } from 'lucide-react';
import { SplashScreen } from './screens/SplashScreen';
import { WalkingModeScreen } from './screens/WalkingModeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { NotFoundScreen } from './screens/NotFoundScreen';
import { LandingScreen } from './screens/LandingScreen';
import { AudioPlayer } from './components/organisms/AudioPlayer';
import { TourStopsList, type TourStopDisplay } from './components/organisms/TourStopsList';
import { LocationModal } from './components/organisms/LocationModal';
import { StopDetailSheet } from './components/organisms/StopDetailSheet';
import { DownloadModal } from './components/organisms/DownloadModal';
import { AddToHomeScreen } from './components/organisms/AddToHomeScreen';

import { Drawer } from 'vaul';
import { ChatButton } from './components/organisms/ChatButton';
import { ChatPanel } from './components/organisms/ChatPanel';
import { ErrorBoundary } from './components/atoms/ErrorBoundary';
import { OfflineToast } from './components/atoms/OfflineToast';
import { PageTransition } from './components/atoms/PageTransition';
import { SplashScreenSkeleton, AudioPlayerSkeleton } from './components/atoms/Skeleton';
import { MiniPlayer } from './components/organisms/MiniPlayer';
import { TourCompleteScreen } from './components/organisms/TourCompleteScreen';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useLocationPriming } from '@/hooks/useLocationPriming';
import { useAuthStore } from '@/stores/authStore';
import { useTourStore } from '@/stores/tourStore';
import { useChatStore } from '@/stores/chatStore';
import { toDisplayStops } from '@/lib/tour/types';
import { getHardcodedTour } from '@/lib/tour/data';
import { fetchTourBySlug } from '@/services/tourService';
import { RequireAdmin } from './admin/RequireAdmin';
import { AdminLayout } from './admin/AdminLayout';
import { AdminDashboardScreen } from './admin/screens/AdminDashboardScreen';
import { AdminToursScreen } from './admin/screens/AdminToursScreen';
import { AdminTourEditScreen } from './admin/screens/AdminTourEditScreen';
import { AdminStopsScreen } from './admin/screens/AdminStopsScreen';
import { AdminStopPreviewScreen } from './admin/screens/AdminStopPreviewScreen';
import { AdminStopContentScreen } from './admin/screens/AdminStopContentScreen';
import { AdminContentTypesScreen } from './admin/screens/AdminContentTypesScreen';
import { AdminTranslationScreen } from './admin/screens/AdminTranslationScreen';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './components/ui/alert-dialog';

const HAS_SEEN_SPLASH_KEY = 'rimay_has_seen_splash';
// Espaciado entre el modal de descarga y el de "agregar a inicio": mostrarlos
// pegados se siente como dos interrupciones apiladas en la primera sesión.
const ADD_TO_HOME_DELAY_MS = 2500;

function useTourStops() {
  const navigate = useNavigate();
  const tour = useTourStore((s) => s.tour)!;
  const completedIds = useTourStore((s) => s.completedIds);
  const [currentStopId, setCurrentStopId] = useState(tour.stops[0]?.id);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadPrompted, setDownloadPrompted] = useState(false);
  const [showAddToHome, setShowAddToHome] = useState(false);
  const isDownloaded = useTourStore((s) => s.isDownloaded);
  const setDownloaded = useTourStore((s) => s.setDownloaded);

  useEffect(() => {
    if (isDownloaded || downloadPrompted) return;
    setDownloadPrompted(true);

    // En la primerísima visita dejamos que explore el splash sin
    // interrupciones; recién en la próxima vez que vuelva a esta pantalla
    // (misma sesión o una nueva) se le ofrece descargar el tour offline.
    const isFirstEverVisit = !localStorage.getItem(HAS_SEEN_SPLASH_KEY);
    localStorage.setItem(HAS_SEEN_SPLASH_KEY, '1');
    if (isFirstEverVisit) return;

    const timer = setTimeout(() => setShowDownloadModal(true), 2500);
    return () => clearTimeout(timer);
  }, [isDownloaded, downloadPrompted]);

  const stops = useMemo(
    () => toDisplayStops(tour.stops, new Set(completedIds), currentStopId),
    [tour.stops, completedIds, currentStopId],
  );

  // Buscar primero por id: si la parada actual ya está completada, su status
  // no es 'current' y el fallback anterior devolvía siempre la parada 1,
  // dejando prev/next inoperativos.
  const currentStop =
    stops.find((s) => s.id === currentStopId) ??
    stops.find((s) => s.status === 'current') ??
    stops[0];

  const getNextStopName = useCallback((id: string): string | undefined => {
    const idx = stops.findIndex((s) => s.id === id);
    if (idx === -1 || idx >= stops.length - 1) return undefined;
    return stops[idx + 1].name;
  }, [stops]);

  const setCurrentStopIndex = useTourStore((s) => s.setCurrentStopIndex);

  const handleSelectStop = useCallback((id: string) => {
    setCurrentStopId(id);
    const idx = tour.stops.findIndex((s) => s.id === id);
    if (idx >= 0) setCurrentStopIndex(idx);
    navigate(`/player?stopId=${id}`);
  }, [navigate, tour.stops, setCurrentStopIndex]);

  // fromId permite navegar relativo a la parada visible (URL), no al estado interno
  const handleNext = useCallback((fromId?: string) => {
    const idx = stops.findIndex((s) => s.id === (fromId ?? currentStop.id));
    if (idx === -1 || idx >= stops.length - 1) return;
    handleSelectStop(stops[idx + 1].id);
  }, [stops, currentStop, handleSelectStop]);

  const handlePrev = useCallback((fromId?: string) => {
    const idx = stops.findIndex((s) => s.id === (fromId ?? currentStop.id));
    if (idx <= 0) return;
    handleSelectStop(stops[idx - 1].id);
  }, [stops, currentStop, handleSelectStop]);

  const handleDownloadComplete = () => {
    setDownloaded(true);
    setTimeout(() => setShowAddToHome(true), ADD_TO_HOME_DELAY_MS);
  };

  return {
    stops,
    currentStop,
    setCurrentStopId,
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

  return <Navigate to="/tour" replace />;
}

function WalkRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/walk" replace />;
  }

  return <WalkingModeScreen />;
}

function SplashRoute() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const t = useTourStops();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <PageTransition>
      <SplashScreen
        tourName={useTourStore.getState().tour?.name ?? 'Sacsayhuamán — Fortaleza del Sol'}
        stops={t.stops}
        currentStopId={t.currentStop.id}
        onSelectStop={t.handleSelectStop}
        onStartRoute={() => navigate('/walk')}
        onShowLocation={() => t.setShowLocationModal(true)}
        onShowAddToHome={() => t.setShowAddToHome(true)}
      />

      <AnimatePresence>
        {t.showLocationModal && (
          <LocationModal
            stops={t.stops}
            onClose={() => t.setShowLocationModal(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {t.showDownloadModal && (
          <DownloadModal
            onClose={() => t.setShowDownloadModal(false)}
            onDownloadComplete={t.handleDownloadComplete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {t.showAddToHome && (
          <AddToHomeScreen
            onClose={() => t.setShowAddToHome(false)}
            onSkip={() => t.setShowAddToHome(false)}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}

function PlayerRoute() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [searchParams] = useSearchParams();
  const paramId = searchParams.get('stopId');
  const t = useTourStops();
  const completedIds = useTourStore((s) => s.completedIds);
  const tour = useTourStore((s) => s.tour);
  const [showStopsList, setShowStopsList] = useState(false);
  const [showStopDetail, setShowStopDetail] = useState(false);
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [showTourComplete, setShowTourComplete] = useState(false);
  // El auto-avance por proximidad es una comodidad pasiva: si el usuario
  // nunca pasó por /walk o "Ver ubicación", no le disparamos el permiso de
  // GPS en frío solo por haber abierto el reproductor de audio.
  const { primed: geoPrimed } = useLocationPriming();

  const totalStops = t.stops.length;
  const allCompleted = totalStops > 0 && completedIds.length >= totalStops;

  useEffect(() => {
    if (allCompleted) setShowTourComplete(true);
  }, [allCompleted]);

  const currentStop = paramId
    ? t.stops.find((s) => s.id === paramId) ?? t.currentStop
    : t.currentStop;

  // Sincronizar el estado interno del hook (y el índice global para el chat)
  // con la parada indicada en la URL.
  const { setCurrentStopId } = t;
  const setCurrentStopIndex = useTourStore((s) => s.setCurrentStopIndex);
  useEffect(() => {
    if (!paramId) return;
    const idx = t.stops.findIndex((s) => s.id === paramId);
    if (idx >= 0) {
      setCurrentStopId(paramId);
      setCurrentStopIndex(idx);
    }
  }, [paramId]);

  useEffect(() => {
    setGeoEnabled(true);
  }, []);

  useGeolocation({
    enabled: geoEnabled && geoPrimed,
    stops: t.stops.map(({ id, name, latitude, longitude, status }) => ({
      id,
      name,
      latitude,
      longitude,
      status,
    })),
    onEnterStop: (detectedStopId) => {
      if (detectedStopId !== currentStop.id) {
        t.handleSelectStop(detectedStopId);
      }
    },
  });

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=/player?stopId=${currentStop.id}`} replace />;
  }

  if (showTourComplete) {
    return (
      <PageTransition>
        <TourCompleteScreen
          tourName={tour?.name ?? 'Sacsayhuamán'}
          totalStops={totalStops}
          totalMinutes={tour?.totalDurationMinutes ?? 45}
          onExploreMap={() => { navigate('/'); t.setShowLocationModal(true); }}
          onGoHome={() => navigate('/')}
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <AudioPlayer
        stop={currentStop}
        onShowStopsList={() => setShowStopsList(true)}
        onNext={() => {
          // En la última parada, "siguiente" finaliza el tour
          if (!t.getNextStopName(currentStop.id)) {
            setShowTourComplete(true);
          } else {
            t.handleNext(currentStop.id);
          }
        }}
        onPrev={() => t.handlePrev(currentStop.id)}
        nextStopName={t.getNextStopName(currentStop.id)}
        onBack={() => navigate('/tour')}
        onShowDetails={() => setShowStopDetail(true)}
        onStartWalk={() => navigate('/walk')}
      />

      <AnimatePresence>
        {showStopDetail && (
          <StopDetailSheet
            stopId={currentStop.id}
            stopName={currentStop.name}
            onClose={() => setShowStopDetail(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
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
      </AnimatePresence>

    </PageTransition>
  );
}

function ChatWrapper({ showButton = true }: { showButton?: boolean }) {
  const isOpen = useChatStore((s) => s.isOpen);
  const toggleChat = useChatStore((s) => s.toggleChat);

  return (
    <>
      {showButton && <ChatButton />}
      <Drawer.Root open={isOpen} onOpenChange={(o) => { if (!o) toggleChat(); }}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-40" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md h-[80vh] rounded-t-[30px] bg-[#0E0E0E] border-t border-[#2C2C2C] flex flex-col">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-[#2C2C2C] rounded-full" />
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatPanel onClose={() => toggleChat()} />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}

const RESEND_COOLDOWN_S = 30;

function LoginRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const signUp = useAuthStore((s) => s.signUp);
  const resendConfirmation = useAuthStore((s) => s.resendConfirmation);
  const clearError = useAuthStore((s) => s.clearError);
  const error = useAuthStore((s) => s.error);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [showConfirmEmail, setShowConfirmEmail] = useState(false);
  const [signUpEmail, setSignUpEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSent, setResendSent] = useState(false);

  const redirect = searchParams.get('redirect') ?? '/tour';

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (isAuthenticated) {
    return <Navigate to={redirect} replace />;
  }

  if (showConfirmEmail) {
    return (
      <div className="min-h-screen w-full bg-[#0E0E0E] flex flex-col items-center justify-center px-6">
        <div className="bg-[#171717] rounded-[30px] p-8 max-w-sm w-full border border-[#2C2C2C] text-center">
          <div className="w-16 h-16 rounded-full bg-[#E6FF00]/20 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-[#E6FF00]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-[22px] font-semibold text-white mb-2">Revisá tu email</h2>
          <p className="text-[#6E6E6E] text-[15px] mb-2">
            Te enviamos un link de confirmación a
          </p>
          <p className="text-white font-medium text-[15px] mb-6">{signUpEmail}</p>

          {error && (
            <div className="mb-4 p-3 rounded-[16px] bg-[#FF4D67]/10 border border-[#FF4D67]/20 text-[#FF4D67] text-[13px] text-center">
              {error}
            </div>
          )}

          <button
            onClick={async () => {
              clearError();
              setResendSent(false);
              try {
                await resendConfirmation(signUpEmail, redirect);
                setResendSent(true);
                setResendCooldown(RESEND_COOLDOWN_S);
              } catch {
                // el error ya se muestra arriba desde el store
              }
            }}
            disabled={resendCooldown > 0}
            className="w-full h-14 rounded-full bg-[#E6FF00] text-[#111111] font-semibold text-[15px] active:scale-[0.96] transition-all disabled:opacity-50"
          >
            {resendCooldown > 0
              ? `Reenviar en ${resendCooldown}s`
              : resendSent
                ? 'Reenviado ✓ — probá de nuevo'
                : 'Reenviar email de confirmación'}
          </button>

          <button
            onClick={() => {
              setShowConfirmEmail(false);
              setIsSignUpMode(true);
              clearError();
            }}
            className="w-full h-12 mt-3 rounded-full bg-transparent border border-[#2C2C2C] text-white/80 font-medium text-[14px] hover:bg-[#1E1E1E] transition-all"
          >
            Editar email
          </button>

          <button
            onClick={() => {
              setShowConfirmEmail(false);
              setIsSignUpMode(false);
              clearError();
            }}
            className="w-full h-10 mt-2 text-[#6E6E6E] text-[13px] hover:text-white transition-colors"
          >
            Volver a iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <LoginScreen
      onLogin={() => navigate(redirect, { replace: true })}
      onSignUp={async (email: string, password: string) => {
        await signUp(email, password, redirect);
        setSignUpEmail(email);
        setShowConfirmEmail(true);
      }}
      isSignUpMode={isSignUpMode}
      onToggleMode={() => {
        setIsSignUpMode(!isSignUpMode);
        clearError();
      }}
      redirectPath={redirect}
      initialEmail={signUpEmail}
    />
  );
}

function LogoutButton() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="absolute top-4 right-[68px] z-40 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-label="Cerrar sesión"
      >
        <LogOut className="w-5 h-5" />
      </button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cerrar sesión</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que querés cerrar sesión?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await logout();
                useChatStore.getState().resetLocal();
              }}
            >
              Cerrar sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const initializeAuth = useAuthStore((s) => s.initialize);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setTour = useTourStore((s) => s.setTour);
  const tour = useTourStore((s) => s.tour);
  const [isTourLoading, setIsTourLoading] = useState(!tour);
  const [tourError, setTourError] = useState<string | null>(null);
  const isLandingPage = location.pathname === '/';
  const isAdminPage = location.pathname.startsWith('/admin');
  const wasAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (wasAuthenticated.current && !isAuthenticated && !isAdminPage) {
      navigate('/login', { replace: true });
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, isAdminPage, navigate]);

  useEffect(() => {
    if (isAdminPage) return;
    if (tour) return;

    const TIMEOUT_MS = 3000;
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout cargando tour')), TIMEOUT_MS)
    );

    Promise.race([fetchTourBySlug('sacsayhuaman'), timeout])
      .then(setTour)
      .catch((err) => {
        if (err.message === 'Timeout cargando tour') {
          const fallback = getHardcodedTour('sacsayhuaman');
          if (fallback) {
            setTour(fallback);
            return;
          }
        }
        setTourError(err.message);
      })
      .finally(() => setIsTourLoading(false));
  }, [tour, setTour, isAdminPage]);

  const retry = useCallback(() => {
    setIsTourLoading(true);
    setTourError(null);
    const TIMEOUT_MS = 5000;
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout cargando tour')), TIMEOUT_MS)
    );
    Promise.race([fetchTourBySlug('sacsayhuaman'), timeout])
      .then(setTour)
      .catch((err) => {
        if (err.message === 'Timeout cargando tour') {
          const fallback = getHardcodedTour('sacsayhuaman');
          if (fallback) { setTour(fallback); return; }
        }
        setTourError(err.message);
      })
      .finally(() => setIsTourLoading(false));
  }, [setTour]);

  if (isAdminPage) {
    return (
      <ErrorBoundary>
        <div className="size-full dark">
          <Routes location={location} key={location.pathname}>
            <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
              <Route index element={<AdminDashboardScreen />} />
              <Route path="tours" element={<AdminToursScreen />} />
              <Route path="tours/new" element={<AdminTourEditScreen />} />
              <Route path="tours/:tourId" element={<AdminTourEditScreen />} />
              <Route path="tours/:tourId/stops" element={<AdminStopsScreen />} />
              <Route path="tours/:tourId/stops/:stopId/preview" element={<AdminStopPreviewScreen />} />
              <Route path="tours/:tourId/stops/:stopId/content" element={<AdminStopContentScreen />} />
              <Route path="content-types" element={<AdminContentTypesScreen />} />
              <Route path="translations" element={<AdminTranslationScreen />} />
            </Route>
            <Route path="*" element={<NotFoundScreen />} />
          </Routes>
        </div>
      </ErrorBoundary>
    );
  }

  if (isAuthLoading) {
    return (
      <div className="size-full relative dark">
        <div className="h-full w-full max-w-md mx-auto relative bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[var(--terracotta)]/30 border-t-[var(--terracotta)] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (isTourLoading) {
    return (
      <div className="size-full relative dark">
        <div className="h-full w-full max-w-md mx-auto relative bg-background">
          <SplashScreenSkeleton />
        </div>
      </div>
    );
  }

  if (tourError) {
    return (
      <div className="size-full relative dark">
        <div className="h-full w-full max-w-md mx-auto relative bg-background flex flex-col items-center justify-center gap-4 px-6">
          <AlertTriangle className="w-12 h-12 text-[var(--terracotta)]" />
          <p className="text-white/60 text-center text-[15px]">{tourError}</p>
          <button
            onClick={retry}
            className="h-12 px-6 rounded-full bg-[#E6FF00] text-[#111111] font-semibold text-[15px] flex items-center gap-2 active:scale-[0.96] transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="size-full relative dark">
        <div className={isLandingPage ? "size-full bg-background" : "h-full w-full max-w-md mx-auto relative bg-background text-foreground overflow-y-auto"}>
          {!isLandingPage && <OfflineToast />}
          {!isLandingPage && <LogoutButton />}
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<LandingScreen />} />
              <Route path="/tour" element={<SplashRoute />} />
              <Route path="/walk" element={<WalkRoute />} />
              <Route path="/login" element={<LoginRoute />} />
              <Route path="/player" element={<PlayerRoute />} />
              <Route path="/tour/:slug" element={<TourRoute />} />
              <Route path="*" element={<NotFoundScreen />} />
            </Routes>
          </AnimatePresence>
          {/* Sin FAB de chat en /login (tapaba el selector de idioma) ni en
              /walk (el modo caminar ya tiene su propio chip de chat); el
              drawer sigue montado en /walk para que ese chip lo abra */}
          {!isLandingPage && location.pathname !== '/login' && (
            <ChatWrapper showButton={location.pathname !== '/walk'} />
          )}
          {/* En /player y /walk el MiniPlayer es redundante: ambas pantallas
              ya muestran su propio reproductor */}
          {!isLandingPage && location.pathname !== '/player' && location.pathname !== '/walk' && <MiniPlayer />}
        </div>
      </div>
    </ErrorBoundary>
  );
}
