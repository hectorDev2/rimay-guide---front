# Rimay Guide — Guía de Audio para Tours en Cusco

PWA offline-first para audio-guías con geolocalización en sitios arqueológicos de Cusco. **Dark Neon UI**, chat IA híbrido, mapas 3D y visor Three.js.

**Estrategia de contenido:** la experiencia base de cada parada es fotografías + audioguía + historia + datos curiosos (lugares *Tipo 2*). El 3D es una experiencia especial solo para lugares con modelos de alta calidad (*Tipo 1*). Cada parada tiene bloques de contenido dinámicos (`stop_contents`); un lugar "es Tipo 1" simplemente porque tiene un bloque `model3d` publicado — sin flags. Ver `docs/ARCHITECTURE-CONTENT.md`.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | React 18.3.1 + TypeScript 6 |
| Bundler | Vite 6.3.5 |
| Routing | React Router 7.13 (URL-based, QR-ready) |
| Estado | Zustand 5 (6 stores, persist en tour y map) |
| UI | Tailwind CSS 4.1 + shadcn/ui (38 Radix components) |
| Animaciones | Motion 12 + Vaul (bottom sheets) |
| Auth | Supabase Auth (email, Google, Apple, sesión persistente) |
| DB | Supabase PostgreSQL + RLS + chat_sessions |
| Mapa 3D | Mapbox GL JS 3.23 (satellite-streets, fill-extrusion, pitch 45°) |
| Visor 3D | Three.js 0.170 + React Three Fiber + Drei |
| Geolocalización | `navigator.geolocation.watchPosition` + Haversine ±25m |
| IA Híbrida | Gemini API (streaming) + Fuse.js (offline) |
| PWA | vite-plugin-pwa (Workbox, auto-update) |
| i18n | react-i18next + i18next |
| Tests | Vitest + jsdom + Testing Library (45 tests) |

---

## Flujo técnico

### 1. Autenticación

```
App monta → initializeAuth() → supabase.auth.getSession()
  ├── sesión existe → setea user en authStore → isAuthenticated: true
  ├── sin sesión → isAuthenticated: false → redirect /login?redirect=<path>
  └── onAuthStateChange → actualiza authStore automáticamente

LoginScreen
  ├── email/password → supabase.auth.signInWithPassword()
  ├── signUp → supabase.auth.signUp() → email de confirmación
  ├── Google → supabase.auth.signInWithOAuth({ provider: 'google' })
  └── Apple → supabase.auth.signInWithOAuth({ provider: 'apple' })
```

### 2. Routing

```
<Routes>
  /              → SplashRoute   (auth required, tour + modales)
  /login         → LoginRoute    (si auth, redirect, soporta signUp)
  /player        → PlayerRoute   (auth, stopId query param, geolocation)
  /tour/:slug    → TourRoute     (valida slug, redirect a SplashRoute)
  *              → NotFoundScreen
</Routes>
```

### 3. Datos

```
Tour Data Flow
  fetchTourBySlug('sacsayhuaman')
    ├── Supabase: tours + tour_stops (con RLS)
    ├── Hidratación: fetchContentsByTour() → audioSrc/culturalContext/imageUrl
    │   desde stop_contents (fuente de verdad; columnas legadas como fallback)
    └── Fallback: getHardcodedTour() desde data.ts (9 stops hardcodeados)

tourStore (persist)
  ├── tour, stops, currentStopIndex
  ├── isDownloaded, downloadProgress, isDownloading
  └── completedIds (persist: rimay-tour)

POIs (pois.ts): 16 puntos (9 tour + 7 culturales)
  └── Categorías: templo, fortaleza, plaza, santuario, mirador, mercado, barrio, tour_stop

chatStore (localStorage + Supabase)
  ├── messages[], isOpen, isLoading, isOnline
  ├── streamingContent (streaming en tiempo real)
  ├── currentSessionId + Supabase upsert
  └── feedback (rating 1/-1), pending sync queue
```

### 3b. Contenido dinámico por parada

```
content_types (registro de tipos: image, gallery, audio, info, facts, model3d)
  └── Agregar video/AR mañana = un INSERT (o el form del admin), sin migrar

stop_contents (bloques por parada)
  ├── type, title, description, file_path, metadata JSONB, order
  ├── status: draft → published → archived (flujo editorial)
  └── RLS: público solo published; escritura is_admin()

Frontend (src/lib/content/)
  ├── registry.tsx → <ContentBlocks>: renderiza según el type registrado
  │   ├── Tipos sin renderer se ignoran (nunca secciones vacías ni errores)
  │   └── model3d → ModelViewer lazy (three.js solo carga en lugares Tipo 1)
  ├── useStopContents(stopId) → hook con caché en memoria
  └── StopDetailSheet → detalle de parada 100% desde bloques (botón 📖 en player)

Admin
  ├── /admin/tours/:id/stops/:id/content → CRUD de bloques, orden,
  │   publicar/despublicar/archivar, upload a Storage (bucket media)
  └── /admin/content-types → habilitar/deshabilitar y registrar tipos nuevos

Audio: 9 narraciones por parada en /voices/{female,male}/parada_N_*.mp3
  (femenina por defecto; ambas voces en metadata.voices para futuro selector)
```

### 4. Geolocalización → Audio

```
useGeolocation hook (PlayerRoute)
  │
  ├─ watchPosition (high accuracy, cada 5s)
  ├─ Haversine a cada stop (≤25m = en rango)
  │
  ├─ En rango → onEnterStop(stopId)
  │   ├── locationStore.setNearbyStop() → banner "Estás cerca de X"
  │   ├── Auto-cambio de stop (si diferente al actual)
  │   └── mapStore.markDiscovered()
  │
  └─ locationStore
      ├── position (lat/lng/accuracy/timestamp)
      ├── error, isWatching
      ├── activeStopId, nearbyStop
      └── stopWatching()
```

### 5. Mapa 3D (TourMap)

```
Mapbox GL JS
  ├── style: satellite-streets-v12
  ├── pitch: 45° → perspectiva 3D
  ├── fill-extrusion layer: polígonos extruidos por POI
  │   └── color y altura por categoría
  ├── marcadores DOM (click → flyTo zoom:17 pitch:60)
  ├── popup HTML con nombre, descripción, "Ver en 3D"
  ├── userMarker azul + accuracyCircle (GPS real)
  └── NavigationControl + geofencing activo
```

### 6. Visor 3D (SiteViewer3D)

Solo accesible en lugares **Tipo 1**: el botón "3D" del mapa aparece únicamente si la parada tiene un bloque `model3d` publicado (`has3DExperience()`).

```
Three.js + R3F + Drei
  │
  ├─ Canvas (shadows, antialias, fov:40)
  ├─ Iluminación: ambient + 2× directional + hemisphere
  ├─ Texturas procedurales: CanvasTexture con bump maps (piedra)
  ├─ Modelo por categoría:
  │   ├─ templo     → pirámide escalonada + columnas trapezoidales
  │   ├─ fortaleza  → muros zigzag + torres circulares
  │   ├─ santuario  → roca deformada + altar
  │   ├─ mirador    → torre escalonada + barandas
  │   ├─ plaza      → plataforma + mojones
  │   └─ tour_stop  → cono marcador + cartel
  ├─ GLB real: model_qoricancha.glb (4.6 MB optimizado)
  ├─ Hotspots: anillos pulsantes + labels HTML + tooltips
  ├─ OrbitControls (auto-rotate, damping, sin pan)
  └─ AudioBar: mini reproductor integrado
```

### 7. Chat IA — Arquitectura Híbrida

```
sendMessage()
  │
  ├─ ¿Online (navigator.onLine + VITE_GEMINI_API_KEY)?
  │     ├─ ✅ → Gemini API (gemini-3-flash-preview) streaming
  │     │     ├─ System prompt con contexto cultural del tour
  │     │     ├─ Streaming response → chatStore.streamingContent
  │     │     └─ Supabase upsert (chat_sessions + chat_messages)
  │     │
  │     └─ ❌ → Fuse.js fuzzy search
  │           ├─ Knowledge base: 19 ítems culturales + 9 stops
  │           ├─ Tokeniza query → fuzzy match
  │           └─ Respuesta local con matching scores
  │
  └─ Persistencia dual: localStorage + Supabase
      ├─ Messages: rimay_chat_messages (localStorage)
      └─ Session: rimay_chat_session + supabase.chat_messages
```

### 8. PWA — Service Worker

```
vite-plugin-pwa (registerType: autoUpdate)
  ├── precache (≤5MB): JS, CSS, HTML, MP3, GLB, PNG, SVG
  ├── runtimeCaching:
  │   ├── images (Unsplash) → StaleWhileRevalidate (30d, 50 entries)
  │   ├── audio MP3        → CacheFirst (90d, cache: rimay-audio-v1)
  │   ├── modelos GLB      → CacheFirst (90d, cache: rimay-models-v1)
  │   └── API calls        → NetworkFirst (5s timeout, cache: api-cache)
  └── manifest: Rimay Guide, theme #A0522D, standalone, portrait
```

### 9. Offline Download

```
DownloadModal
  ├── Se muestra automáticamente al primer ingreso (si !isDownloaded)
  ├── URLs: audio legado + fetchTourMediaUrls() (imágenes/galerías/audios
  │   publicados de stop_contents); los model3d se cargan bajo demanda
  ├── downloadWorker.ts (Web Worker, Cache API)
  │   ├── postMessage({ type: 'download', urls, cacheName })
  │   ├── fetch + Cache API por cada URL
  │   ├── postMessage progreso (current, total, percent)
  │   └── soporta cancelación
  └── Al completar → AddToHomeScreen prompt
```

### 10. Modelos 3D — Pipeline de optimización

```
Modelos fuente (.glb, sin optimizar en src/public/models/source/)
  │
  ├─ 1. gltf-transform resize (texturas → 1024px)
  ├─ 2. gltfpack -cc -si 0.5 (compresión meshopt + simplificación 50%)
  │     Extensiones: EXT_meshopt_compression + KHR_mesh_quantization
  │     Decodificador: MeshoptDecoder (drei lo configura automático en useGLTF)
  │
  └─ Output → src/public/ (4-6 MB típico, ≤ 5 MB para precache Workbox)

Prebuild hook: npm run build → npm run optimize:models (automático)
Script manual: npm run optimize:models
Origen: src/public/models/source/*.glb
Destino: src/public/*.glb
```

**Resultado típico (Qoricancha)**:

| Métrica | Original (Tripo AI) | Optimizado | Reducción |
|---------|---------------------|------------|-----------|
| Archivo | 59 MB | 4.6 MB | 92% |
| Triángulos | 1.89M | 947K | 50% |
| Texturas | 2048px × 3 (JPEG) | 1024px × 3 | 75% |
| GPU VRAM | 125 MB | 18.2 MB | 85% |
| Descarga 3G | ~3 min | ~5 seg | 97% |

El pipeline está en `scripts/optimize-models.mjs`. Requiere `@gltf-transform/cli` y `gltfpack` instalados globalmente.

---

## Estructura de carpetas

```
src/
├── app/
│   ├── App.tsx                  # Container principal: routing + auth guard + layout
│   ├── components/
│   │   ├── atoms/               # ErrorBoundary, PageTransition, OfflineToast,
│   │   │                        # ImageWithFallback, Skeleton, LanguageSwitcher
│   │   ├── organisms/           # AudioPlayer, TourMap, ChatPanel, LocationModal,
│   │   │                        # MiniPlayer, TourCompleteScreen, SiteViewer3D,
│   │   │                        # DownloadModal, AddToHomeScreen, ChatButton,
│   │   │                        # TourStopsList, DebugLocationPanel
│   │   ├── figma/               # Componentes generados desde Figma
│   │   └── ui/                  # shadcn/ui (38 componentes Radix)
│   ├── admin/                   # AdminLayout, RequireAdmin + screens/
│   │   └── screens/             # Dashboard, Tours, Stops, StopContent (bloques),
│   │                            # ContentTypes, StopPreview, Translations
│   └── screens/                 # SplashScreen, LoginScreen, NotFoundScreen
├── hooks/                       # useGeolocation, useStopContents (bloques con caché)
├── i18n/                        # react-i18next + fallbacks ES/EN
├── lib/
│   ├── chat/                    # geminiClient, offlineSearch, constants (28 items), tourContext
│   ├── content/                 # types (ContentBlock), registry (<ContentBlocks>),
│   │                            # ModelViewer (visor 3D lazy)
│   ├── map/                     # pois (16 POIs), geofence, hotspots (30+), siteModels
│   ├── tour/                    # types (Tour/TourStop), data (9 stops hardcodeados)
│   └── supabase/                # types, supabaseClient
├── services/                    # tourService, contentService, translationService
│   └── admin/                   # adminTourService, adminStopService,
│                                # adminContentService, schemas (zod)
├── stores/                      # authStore, tourStore, audioStore, chatStore,
│                                # locationStore, mapStore (con tests)
├── styles/                      # index.css, tailwind.css, theme.css (design tokens)
├── public/                      # model_qoricancha.glb, PWA icons
│   ├── voices/female|male/      # 9 narraciones por parada × 2 voces
│   └── models/source/           # modelos sin optimizar
├── workers/                     # downloadWorker.ts (Web Worker)
└── test/                        # setup.ts (vitest + jsdom + Testing Library)
```

```
scripts/
├── optimize-models.mjs          # pipeline gltf-transform + gltfpack
└── create-test-user.mjs         # usuario de prueba para Supabase
```

```
supabase/
├── migrations/                  # init, cultural-context, content-blocks
│                                # (+ drop-legacy-content-columns, fechada a futuro)
├── seed.sql                     # datos semilla (tours, stops, translations)
├── seed_contents.sql            # bloques de contenido demo (idempotente)
├── update_voices.sql            # narraciones por parada (female/male)
└── config.toml                  # configuración local Supabase
```

---

## Setup

```bash
npm install
npm run dev
```

### Dependencias globales (para optimización de modelos 3D)

```bash
npm i -g @gltf-transform/cli gltfpack
```

Sin estas, `npm run optimize:models` fallará. Si no trabajás con modelos 3D, podés saltearlas.

### Variables de entorno (.env)

```env
VITE_MAPBOX_TOKEN=pk.xxx
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx
VITE_GEMINI_API_KEY=AIza...  # opcional, sin esto el chat usa solo offline
```

### Tests

```bash
npm test              # vitest run (45 tests)
npm run test:watch    # modo watch
```

### Base de datos

Orden de ejecución en el SQL Editor de Supabase (o `supabase db push` para las migraciones):

1. Migraciones de `supabase/migrations/` (crean tablas, `content_types`, `stop_contents`, RLS, bucket `media`)
2. `supabase/seed.sql` — tours, paradas y traducciones
3. `supabase/seed_contents.sql` — bloques de contenido demo (Tipo 2 completo en las 9 paradas + `model3d` en 2)
4. `supabase/update_voices.sql` — narraciones por parada (voz femenina por defecto, ambas en `metadata.voices`)

La migración `drop-legacy-content-columns` está fechada a futuro: aplicarla solo después de desplegar el frontend que hidrata desde `stop_contents`.

Usuario de prueba: `turista@rimay.pe` / `Rimay2025!` (crear vía `scripts/create-test-user.mjs`).

---

## Stores

| Store | Estado clave | Persistencia |
|-------|-------------|-------------|
| `authStore` | user, isAuthenticated, isLoading, error | ❌ (maneja sesión vía Supabase) |
| `tourStore` | tour, currentStopIndex, completedIds, isDownloaded, downloadProgress, isDownloading | ✅ `rimay-tour` (completedIds, isDownloaded) |
| `audioStore` | isPlaying, currentStopId/Name, currentTime, duration, audioRef | ❌ |
| `locationStore` | position (lat/lng/accuracy/timestamp), error, isWatching, activeStopId, nearbyStop | ❌ |
| `mapStore` | isReady, discoveredPoiIds (Set), activePoi, showPopup, center, zoom, pitch, pendingFlyToPoiId, show3DViewer | ✅ `rimay-map` (discoveredPoiIds, center, zoom, pitch) |
| `chatStore` | messages[], isOpen, isLoading, isOnline, streamingContent, currentSessionId | ✅ localStorage + Supabase sync |
