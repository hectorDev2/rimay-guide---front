import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';

interface ModelViewerProps {
  src: string;
  title?: string;
  description?: string;
  onClose: () => void;
}

function Model({ src }: { src: string }) {
  const { scene } = useGLTF(src);
  return <primitive object={scene} />;
}

/**
 * Visor 3D fullscreen para lugares Tipo 1.
 * Cargado con React.lazy: los lugares sin 3D nunca pagan el peso de three.js.
 */
export default function ModelViewer({ src, title, description, onClose }: ModelViewerProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-base font-semibold text-white">{title ?? 'Explorar en 3D'}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar visor 3D"
          className="rounded-full bg-white/10 px-4 py-2 text-sm text-white"
        >
          Cerrar
        </button>
      </div>
      <div className="min-h-0 flex-1">
        <Canvas dpr={[1, 2]} camera={{ fov: 45 }}>
          <Suspense fallback={null}>
            <Stage environment="city" intensity={0.6}>
              <Model src={src} />
            </Stage>
          </Suspense>
          <OrbitControls makeDefault enablePan={false} minDistance={1} maxDistance={12} />
        </Canvas>
      </div>
      {description && (
        <p className="max-h-28 overflow-y-auto p-4 text-sm text-white/80">{description}</p>
      )}
    </div>
  );
}
