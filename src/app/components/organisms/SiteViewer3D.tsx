import { useMemo, useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Sheet, SheetContent } from '@/app/components/ui/sheet';
import { X, Play, Pause } from 'lucide-react';
import { getSiteModel } from '@/lib/map/siteModels';
import { getHotspotsForPoi } from '@/lib/map/hotspots';
import type { HotspotDef } from '@/lib/map/hotspots';
import type { Poi } from '@/lib/map/pois';
import { SACSAYHUAMAN_TOUR } from '@/lib/tour/types';

interface SiteViewer3DProps {
  poi: Poi | null;
  open: boolean;
  onClose: () => void;
}

function Hotspot3D({ hotspot, color }: { hotspot: HotspotDef; color: string }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const [showDetail, setShowDetail] = useState(false);

  useFrame((state) => {
    if (ringRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 2.5) * 0.2;
      ringRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={hotspot.position}>
      <mesh
        ref={ringRef}
        onClick={(e) => { e.stopPropagation(); setShowDetail((v) => !v); }}
        onPointerOver={(e) => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { document.body.style.cursor = 'default'; }}
      >
        <torusGeometry args={[0.12, 0.025, 8, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>

      <mesh>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>

      <Html position={[0, 0.3, 0]} center distanceFactor={8}>
        <div className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-[10px] leading-tight whitespace-nowrap border border-white/10 select-none">
          {hotspot.label}
        </div>
      </Html>

      {showDetail && (
        <Html position={[0, -0.3, 0]} center distanceFactor={8}>
          <div
            className="w-60 p-3 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 shadow-2xl select-none relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setShowDetail(false); }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 1l8 8M9 1l-8 8" />
              </svg>
            </button>
            <p className="text-xs font-medium text-white mb-1 pr-4">{hotspot.label}</p>
            <p className="text-[11px] text-white/60 leading-relaxed">{hotspot.description}</p>
          </div>
        </Html>
      )}
    </group>
  );
}

function Scene({ poi }: { poi: Poi }) {
  const Model = useMemo(() => getSiteModel(poi.category, poi.id), [poi.category, poi.id]);
  const hotspots = useMemo(() => getHotspotsForPoi(poi.id, poi.category), [poi.id, poi.category]);
  const gridHelper = useMemo(() => {
    const grid = new THREE.GridHelper(10, 20, 'white', 'white');
    grid.position.y = -0.1;
    grid.material.transparent = true;
    grid.material.opacity = 0.15;
    return grid;
  }, []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 12, 4]} intensity={1.2} />
      <directionalLight position={[-4, 6, -4]} intensity={0.4} />
      <hemisphereLight args={['#b1e1ff', '#795c32', 0.6]} />
      <primitive object={gridHelper} />
      <Model color={poi.color} height={poi.extrusionHeight} />
      {hotspots.map((h) => (
        <Hotspot3D key={h.id} hotspot={h} color={poi.color} />
      ))}
      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.1}
        minDistance={2}
        maxDistance={12}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate
        autoRotateSpeed={0.8}
      />
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
    </div>
  );
}

function AudioBar({ audioSrc }: { audioSrc: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onData = () => {
      setDuration(audio.duration);
      setCurrent(audio.currentTime);
    };
    const onTime = () => setCurrent(audio.currentTime);
    const onEnded = () => setPlaying(false);

    audio.addEventListener('loadeddata', onData);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadeddata', onData);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.play().catch(() => setPlaying(false));
    else audio.pause();
  }, [playing]);

  useEffect(() => {
    setPlaying(false);
    setCurrent(0);
    setDuration(0);
  }, [audioSrc]);

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const fmt = (s: number) => {
    if (!s || !isFinite(s)) return '0:00';
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  };

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div className="bg-black/60 backdrop-blur-md border-t border-white/10">
      <audio ref={audioRef} src={audioSrc} preload="auto" />
      <div className="flex items-center gap-2.5 px-4 py-2.5">
        <button
          onClick={() => setPlaying((v) => !v)}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer group" onClick={seek}>
          <div className="h-full bg-white/40 rounded-full transition-all relative" style={{ width: `${pct}%` }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <span className="flex-shrink-0 text-[10px] text-white/40 font-mono tabular-nums w-20 text-right">
          {fmt(current)} / {fmt(duration)}
        </span>
      </div>
    </div>
  );
}

export function SiteViewer3D({ poi, open, onClose }: SiteViewer3DProps) {
  const audioSrc = useMemo(() => {
    if (!poi?.tourStopId) return null;
    const stop = SACSAYHUAMAN_TOUR.stops.find((s) => s.id === poi.tourStopId);
    return stop?.audioSrc ?? null;
  }, [poi]);

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 border-none bg-black"
      >
        <div className="relative w-full h-full flex flex-col bg-black">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <Suspense fallback={<LoadingFallback />}>
              {poi && (
                <Canvas
                  camera={{ position: [5, 3, 5], fov: 40 }}
                  gl={{ antialias: true, alpha: false }}
                  style={{ background: '#0a0a0a' }}
                >
                  <Scene poi={poi} />
                </Canvas>
              )}
            </Suspense>
          </div>

          {audioSrc && <AudioBar audioSrc={audioSrc} />}

          {poi && (
            <div className="bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
              <div className="px-6 pb-8 pt-12">
                <h2 className="text-white text-xl font-semibold">
                  {poi.name}
                </h2>
                <p className="text-white/60 text-sm mt-2 leading-relaxed line-clamp-3">
                  {poi.description}
                </p>
                <span className="inline-block mt-3 text-[10px] uppercase tracking-wider text-white/40 font-medium">
                  {poi.category === 'tour_stop' ? 'Parada del tour' : poi.category}
                </span>
              </div>
            </div>
          )}

          <div className="absolute top-4 left-4 text-[10px] text-white/30 uppercase tracking-wider pointer-events-none">
            Arrastra para rotar · Scroll para zoom
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
