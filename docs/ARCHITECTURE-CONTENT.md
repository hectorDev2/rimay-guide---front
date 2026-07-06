# Arquitectura de contenido dinámico — Rimay Guide

**Fecha:** 2026-07-06 · **Estado:** Propuesta
**Contexto:** El 3D deja de ser universal y pasa a ser una experiencia especial de lugares Tipo 1. La experiencia base es fotos + audio + historia. La arquitectura debe aceptar tipos nuevos (AR, video, reconstrucciones) sin rediseño.

---

## 1. Principio rector

**El lugar no sabe qué contenido tiene; lo descubre.** Nada de columnas `has_model3d` ni flags por tipo. Cada lugar tiene una colección de bloques de contenido tipados, y tanto la UI como el admin se generan a partir de esa colección. Agregar AR o video en el futuro = registrar un tipo nuevo + un componente que lo renderiza. Cero cambios de esquema, cero cambios en pantallas existentes.

La clasificación Tipo 1 / Tipo 2 **no se modela como categoría**: un lugar "es Tipo 1" simplemente porque tiene un bloque `model3d` activo. Esto evita estados inconsistentes (categoría dice 3D pero no hay modelo).

## 2. Modelo de datos (Supabase / Postgres)

Se conserva `tour_stops` como entidad "Lugar" (ya tiene nombre, descripción, ubicación, radio, orden). Se agrega una tabla de contenidos y una de tipos:

```sql
-- Registro de tipos: agregar AR/video mañana = un INSERT
CREATE TABLE public.content_types (
  slug        TEXT PRIMARY KEY,          -- 'image' | 'gallery' | 'audio' | 'model3d' | ...
  label       TEXT NOT NULL,
  icon        TEXT,                      -- nombre de icono lucide para UI/admin
  media_kind  TEXT NOT NULL,             -- 'image' | 'audio' | 'model' | 'video' | 'none'
  enabled     BOOLEAN NOT NULL DEFAULT true
);

INSERT INTO content_types (slug, label, icon, media_kind) VALUES
  ('image',   'Imagen principal', 'image',   'image'),
  ('gallery', 'Galería',          'images',  'image'),
  ('audio',   'Audioguía',        'volume-2','audio'),
  ('info',    'Historia',         'book-open','none'),
  ('facts',   'Datos curiosos',   'sparkles', 'none'),
  ('model3d', 'Experiencia 3D',   'box',      'model');

CREATE TABLE public.stop_contents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_id     UUID NOT NULL REFERENCES tour_stops(id) ON DELETE CASCADE,
  type        TEXT NOT NULL REFERENCES content_types(slug),
  title       TEXT,
  description TEXT,
  file_path   TEXT,                      -- ruta en Supabase Storage (null para 'info'/'facts')
  metadata    JSONB NOT NULL DEFAULT '{}',
  "order"     INTEGER NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'published'
              CHECK (status IN ('draft','published','archived')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_stop_contents_lookup
  ON stop_contents (stop_id, status, "order");

ALTER TABLE stop_contents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published contents are public" ON stop_contents
  FOR SELECT USING (status = 'published');
-- escritura: solo rol admin (misma política que usa el panel actual)
```

### Por qué así

- **`metadata JSONB`** absorbe lo específico de cada tipo sin migrar el esquema: `model3d` guarda `{poster, sizeBytes, cameraPreset, annotations[]}`; `audio` guarda `{durationSeconds, lang, transcript}`; `gallery` agrupa ítems con `{items: [{path, caption}]}` o bien N filas `type='gallery'` ordenadas por `order` (recomendado: N filas, permite reordenar y traducir caption por fila).
- **`status`** permite cargar un modelo 3D en borrador y publicarlo cuando pase control de calidad — clave dado que el problema de origen fue calidad de modelos.
- **Un lugar Tipo 1** = tiene fila `model3d` publicada. **Tipo 2** = no la tiene. Sin flags.
- Los campos actuales `audio_src` e `imageUrl` de `tour_stops` se migran a filas `stop_contents` y quedan deprecados (migración de datos en `seed`/script, columnas se eliminan en una migración posterior).

### Traducciones

Se reutiliza la tabla `translations` existente con namespace `content:{content_id}` y keys `title`/`description`, igual que hoy con los stops. El servicio de contenido resuelve idioma en el mismo punto que `translationService`.

### Storage (Supabase Storage)

```
buckets/
  media/
    stops/{stop_id}/hero.webp
    stops/{stop_id}/gallery/{content_id}.webp
    stops/{stop_id}/audio/{lang}.mp3
    stops/{stop_id}/models/{content_id}.glb   (+ .draco / poster.webp)
```

Bucket público de solo lectura; escritura vía panel admin con política por rol. Los `.glb` pasan por `scripts/optimize-models.mjs` (ya existe) antes de publicarse.

## 3. Backend / capa de servicios

Sin servidor propio: se mantiene Supabase directo desde el cliente, como hoy.

```
src/services/contentService.ts      → getContentsByStop(stopId, lang)
src/services/admin/adminContentService.ts → CRUD + upload + reorder + publish
```

`getContentsByStop` devuelve el array ordenado y filtrado por `status='published'`, con URLs de Storage resueltas. Una sola query con `tour_stops` embebido:

```ts
supabase.from('tour_stops')
  .select('*, stop_contents(*)')
  .eq('tour_id', tourId)
  .eq('stop_contents.status', 'published')
  .order('order', { referencedTable: 'stop_contents' });
```

### Offline (PWA)

El `downloadWorker` existente se extiende para precachear por tour: recorre `stop_contents` y descarga según `media_kind`. Los `model3d` son los más pesados → se descargan **bajo demanda o con Wi-Fi** (flag en settings), nunca bloquean la descarga base del tour. La experiencia Tipo 2 funciona 100 % offline; el visor 3D muestra el poster si el modelo aún no está en caché.

## 4. Frontend dinámico

### Registro de renderers (el corazón de la extensibilidad)

```ts
// src/lib/content/registry.tsx
export interface ContentBlock {
  id: string; type: string; title?: string; description?: string;
  fileUrl?: string; metadata: Record<string, unknown>; order: number;
}

type Renderer = {
  Section: React.ComponentType<{ block: ContentBlock; stop: TourStop }>;
  tabIcon?: string;          // si aporta tab/acción propia (ej. "Explorar en 3D")
  preload?: (block: ContentBlock) => Promise<void>;
};

const registry: Record<string, Renderer> = {
  image:   { Section: HeroImage },
  gallery: { Section: PhotoGallery },
  audio:   { Section: AudioGuidePlayer },
  info:    { Section: InfoSection },
  facts:   { Section: FunFacts },
  model3d: { Section: Model3DEntry, tabIcon: 'box' },  // lazy: React.lazy + Suspense
};
```

La pantalla de lugar (`StopDetailScreen`) hace:

```tsx
{blocks.map(b => {
  const R = registry[b.type];
  return R ? <R.Section key={b.id} block={b} stop={stop} /> : null; // tipo desconocido → se ignora
})}
```

Consecuencias directas de este diseño:

- **Nunca hay secciones vacías**: si no hay bloque, no hay componente. Un lugar Tipo 2 muestra Información / Galería / Audio; uno Tipo 1 muestra además el botón "Explorar en 3D". Es el mismo screen.
- **Tipos desconocidos se ignoran silenciosamente**: se puede publicar contenido `video` en la BD antes de que la app lo soporte; las versiones viejas de la PWA no rompen.
- **Agregar AR/video** = crear el componente + una entrada en `registry` + un INSERT en `content_types`. Nada más.
- El visor 3D (`@react-three/fiber`, ya en deps) se carga con `React.lazy` para que los lugares Tipo 2 jamás paguen el peso de three.js.

### UX

- **Tipo 2 (mayoría):** hero image → título/nombre quechua → player de audio persistente (sticky) → historia → datos curiosos → galería swipeable → mapa. Completa por sí misma; el 3D nunca se menciona ni se sugiere.
- **Tipo 1:** todo lo anterior + una card destacada "Explorar en 3D" con poster del objeto. El visor abre fullscreen: rotación/zoom (OrbitControls, ya disponible vía drei), hotspots de información contextual desde `metadata.annotations`. El foco es el **objeto de exposición** (pieza, escultura), no el edificio.
- En el mapa, los lugares Tipo 1 pueden llevar un badge distintivo (derivado de la presencia del bloque, no de un flag).

## 5. Panel administrativo

Se extiende el admin existente (`src/app/admin`, `adminStopService`):

- En la edición de un stop, nueva pestaña **Contenido**: lista de bloques con drag-and-drop (`order`), badge de estado (borrador/publicado) y botón "Agregar contenido" cuyo menú se genera desde `content_types` (`enabled=true`) — el admin también es dinámico.
- Cada tipo tiene un formulario propio (mismo patrón registry, versión admin): upload de imagen con recorte, upload de audio con duración autodetectada, upload de `.glb` con **preview 3D integrado** para validar calidad antes de publicar y límite de tamaño (p. ej. 15 MB post-optimización).
- Flujo editorial: subir → borrador → previsualizar como usuario → publicar. `archived` en lugar de borrar, para poder restaurar.
- Validación con `zod` en `services/admin/schemas.ts`, discriminada por `type` (patrón ya usado).

## 6. Escalabilidad futura

| Futuro | Qué se toca | Qué NO se toca |
|---|---|---|
| Video | INSERT en `content_types` + `VideoSection` en registry | esquema, screens, admin shell |
| AR | ídem + componente WebXR lazy | ídem |
| Reconstrucción histórica | ídem (probablemente `metadata.timeline`) | ídem |
| Nuevo idioma | filas en `translations` | todo lo demás |
| App nativa futura | misma API Supabase; el registry se replica en el otro cliente | modelo de datos |

## 7. Plan de implementación

1. Migración: `content_types` + `stop_contents` + RLS + índice.
2. Script de migración de datos: `audio_src` / imagen actual → filas `stop_contents`.
3. `contentService` + registry + refactor de `StopDetailScreen` a render dinámico.
4. Pestaña Contenido en admin (CRUD + upload + orden + estados).
5. Visor 3D lazy con poster/fallback + descarga diferida en `downloadWorker`.
6. Deprecar `audio_src`/`imageUrl` en `tour_stops` (migración de limpieza).

Los pasos 1–3 dejan la app funcionando igual que hoy pero sobre la base nueva; 4–5 habilitan la estrategia Tipo 1/Tipo 2.
