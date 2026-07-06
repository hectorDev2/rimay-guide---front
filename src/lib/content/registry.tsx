import { lazy, Suspense, useState, type ComponentType } from 'react';
import type { ContentBlock } from './types';
import { blocksOfType } from './types';

/**
 * Registro de renderers de contenido.
 * Agregar un tipo nuevo (video, AR, ...) = crear el componente y sumarlo aquí
 * + un INSERT en content_types. Nada más se toca.
 */

export interface SectionProps {
  block: ContentBlock;
  /** Todos los bloques del lugar (para tipos que agrupan, como gallery) */
  allBlocks: ContentBlock[];
}

interface Renderer {
  Section: ComponentType<SectionProps>;
  /** Tipos que agrupan varios bloques en una sola sección (ej. gallery) */
  grouped?: boolean;
}

// --- Secciones -------------------------------------------------------------

function HeroImage({ block }: SectionProps) {
  if (!block.fileUrl) return null;
  return (
    <img
      src={block.fileUrl}
      alt={block.title ?? ''}
      className="h-56 w-full rounded-2xl object-cover"
      loading="eager"
    />
  );
}

function InfoSection({ block }: SectionProps) {
  if (!block.description) return null;
  return (
    <section aria-label={block.title ?? 'Historia'}>
      {block.title && <h2 className="mb-2 text-lg font-semibold">{block.title}</h2>}
      <p className="whitespace-pre-line text-sm leading-relaxed opacity-90">{block.description}</p>
    </section>
  );
}

function FunFacts({ block }: SectionProps) {
  if (!block.description) return null;
  return (
    <section aria-label={block.title ?? 'Datos curiosos'} className="rounded-2xl bg-white/5 p-4">
      <h2 className="mb-2 text-lg font-semibold">{block.title ?? 'Datos curiosos'}</h2>
      <p className="whitespace-pre-line text-sm leading-relaxed opacity-90">{block.description}</p>
    </section>
  );
}

function AudioGuideSection({ block }: SectionProps) {
  if (!block.fileUrl) return null;
  return (
    <section aria-label={block.title ?? 'Audioguía'}>
      {block.title && <h2 className="mb-2 text-lg font-semibold">{block.title}</h2>}
      <audio controls preload="metadata" src={block.fileUrl} className="w-full" />
    </section>
  );
}

function PhotoGallery({ block, allBlocks }: SectionProps) {
  const items = blocksOfType(allBlocks, 'gallery');
  // Solo el primer bloque gallery renderiza la sección completa
  if (items[0]?.id !== block.id) return null;
  return (
    <section aria-label="Galería">
      <h2 className="mb-2 text-lg font-semibold">Galería</h2>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
        {items.map((item) =>
          item.fileUrl ? (
            <figure key={item.id} className="w-64 shrink-0 snap-start">
              <img
                src={item.fileUrl}
                alt={item.title ?? ''}
                className="h-40 w-64 rounded-xl object-cover"
                loading="lazy"
              />
              {item.title && <figcaption className="mt-1 text-xs opacity-70">{item.title}</figcaption>}
            </figure>
          ) : null,
        )}
      </div>
    </section>
  );
}

// three.js solo se carga si el lugar tiene bloque model3d (lugares Tipo 1)
const ModelViewer = lazy(() => import('./ModelViewer'));

function Model3DEntry({ block }: SectionProps) {
  const [open, setOpen] = useState(false);
  const poster = typeof block.metadata.poster === 'string' ? block.metadata.poster : undefined;

  if (open && block.fileUrl) {
    return (
      <Suspense
        fallback={<div className="flex h-72 items-center justify-center text-sm opacity-70">Cargando modelo…</div>}
      >
        <ModelViewer src={block.fileUrl} title={block.title} description={block.description} onClose={() => setOpen(false)} />
      </Suspense>
    );
  }

  return (
    <section aria-label="Experiencia 3D">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative w-full overflow-hidden rounded-2xl bg-white/5 text-left"
      >
        {poster && <img src={poster} alt="" className="h-40 w-full object-cover opacity-80" />}
        <div className="p-4">
          <span className="text-base font-semibold">Explorar en 3D</span>
          {block.title && <p className="mt-1 text-sm opacity-80">{block.title}</p>}
        </div>
      </button>
    </section>
  );
}

// --- Registry ---------------------------------------------------------------

const registry: Record<string, Renderer> = {
  image: { Section: HeroImage },
  info: { Section: InfoSection },
  facts: { Section: FunFacts },
  audio: { Section: AudioGuideSection },
  gallery: { Section: PhotoGallery, grouped: true },
  model3d: { Section: Model3DEntry },
};

/**
 * Renderiza los bloques de un lugar en orden.
 * Tipos sin renderer registrado (ej. 'video' publicado antes de soportarse)
 * se ignoran: nunca hay secciones vacías ni errores.
 */
export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      {blocks.map((block) => {
        const renderer = registry[block.type];
        if (!renderer) return null;
        return <renderer.Section key={block.id} block={block} allBlocks={blocks} />;
      })}
    </>
  );
}
