# Rimay Guide — Guía de Audio para Tours en Cusco

PWA offline-first para audio-guías con geolocalización en sitios arqueológicos de Cusco.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | React 18 + TypeScript |
| Bundler | Vite 6 |
| Routing | react-router v7 (URL-based, QR-ready) |
| State | Zustand (auth, tour, location, map, chat) |
| UI | Tailwind CSS v4 + shadcn/ui + Motion |
| Auth | Supabase Auth (email, Google, Apple) |
| DB | Supabase PostgreSQL + RLS |
| Mapa 3D | Mapbox GL JS (satellite-streets, fill-extrusion, pitch 45°) |
| Visor 3D | Three.js + React Three Fiber + Drei |
| Geolocalización | `navigator.geolocation.watchPosition` + Haversine |
| PWA | vite-plugin-pwa (Workbox, auto-update) |
| IA | Gemini API (opcional, fallback offline con Fuse.js) |

---

## Flujo técnico

### 1. Autenticación

```
App monta → initialize() → supabase.auth.getSession()
  ├── sesión existe → setea user en authStore → isAuthenticated: true
  └── sin sesión → isAuthenticated: false → redirect /login

LoginScreen
  ├── email/password → supabase.auth.signInWithPassword()
  ├── Google → supabase.auth.signInWithOAuth({ provider: 'google' })
  └── Apple → supabase.auth.signInWithOAuth({ provider: 'apple' })

onAuthStateChange → actualiza authStore automáticamente
```

### 2. Routing

```
<Routes>
  /              → SplashRoute  (requiere auth, sino → /login)
  /login         → LoginRoute   (si ya auth, → redirect)
  /player?stopId=X → PlayerRoute (requiere auth)
  /tour/:slug    → TourRoute    (QR code: /tour/sacsayhuaman)
  *              → NotFoundScreen
</Routes>
```

### 3. Datos

```
Supabase PostgreSQL
  ┌─ tours (slug, name, description)
  ├─ tour_stops (lat, lng, radius, audioSrc, order)
  └─ user_progress (user_id, stop_id, completed)

App.tsx
  ├─ SACSAYHUAMAN_TOUR (types.ts) ← 9 stops con coordenadas reales
  └─ POIS (pois.ts) ← 16 POIs (9 tour + 7 culturales)

tourStore
  ├─ tour, stops, currentStopIndex
  ├─ isDownloaded, downloadProgress
  └─ completedIds (Set<string>)
```

### 4. Geolocalización → Audio

```
useGeolocation hook (PlayerRoute, LocationModal)
  │
  ├─ watchPosition (high accuracy, cada 5s)
  ├─ Haversine a cada stop (≤25m = en rango)
  │
  ├─ PlayerRoute: onEnterStop(id) → setNearbyStop → banner "Estás cerca de X"
  │   └─ [Reproducir] → navigate(/player?stopId=X) → AudioPlayer
  │
  └─ LocationModal: setPosition → TourMap actualiza userMarker + accuracyCircle
      └─ findActivePoi() → geofence detection (arrived ≤ geofenceRadius)
```

### 5. Mapa 3D (TourMap)

```
Mapbox GL JS
  ├─ style: satellite-streets-v12 (satélite real)
  ├─ pitch: 45° → perspectiva 3D
  ├─ fill-extrusion layer: 16 polígonos extruidos (25m² c/u)
  │   └─ color y altura por categoría del POI
  ├─ marcadores DOM (click → flyTo zoom:17 pitch:60)
  ├─ popup HTML con nombre, descripción, botón "Ver en 3D"
  ├─ userMarker azul + accuracyCircle (GPS real o simulado)
  └─ NavigationControl
```

### 6. Visor 3D (SiteViewer3D)

```
Three.js + R3F + Drei
  │
  ├─ Canvas (shadows, antialias, fov:40)
  ├─ Iluminación: ambient + 2× directional + hemisphere
  ├─ Modelo procedural por categoría:
  │   ├─ templo     → pirámide escalonada + columnas trapezoidales
  │   ├─ fortaleza  → muros zigzag + torres circulares
  │   ├─ santuario  → roca deformada + altar
  │   ├─ mirador    → torre escalonada + barandas
  │   ├─ plaza      → plataforma + mojones
  │   └─ tour_stop  → cono marcador + cartel
  ├─ Hotspots: anillos pulsantes + labels HTML + tooltips
  ├─ OrbitControls (auto-rotate, damping, sin pan)
  └─ AudioBar: mini reproductor integrado
```

### 7. PWA — Service Worker

```
vite-plugin-pwa (Workbox, registerType: autoUpdate)
  ├─ precache: JS, CSS, HTML, GLB
  ├─ runtimeCaching:
  │   ├─ images (Unsplash) → StaleWhileRevalidate (30d)
  │   ├─ audio MP3       → CacheFirst (90d)
  │   ├─ modelos GLB     → CacheFirst (90d)
  │   └─ API calls       → NetworkFirst (5s timeout)
  └─ manifest: name, icons, theme_color (#A0522D), standalone
```

### 8. Offline Download

```
downloadWorker.ts (Web Worker)
  ├─ postMessage({ type: 'download', urls, cacheName })
  ├─ fetch + Cache API por cada URL
  ├─ postMessage progreso (current, total, percent)
  └─ soporta cancelación
```

### 9. Modelos 3D — Pipeline de optimización

```
Modelos fuente (.glb, sin optimizar)
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
│   ├── components/
│   │   ├── atoms/          # ErrorBoundary, PageTransition, OfflineToast
│   │   ├── organisms/      # AudioPlayer, TourMap, ChatPanel, LocationModal
│   │   └── ui/             # shadcn/ui (Button, Input, etc.)
│   ├── screens/            # LoginScreen, SplashScreen, NotFoundScreen
│   └── App.tsx             # Router + providers
├── hooks/                  # useGeolocation
├── lib/
│   ├── map/                # pois, geofence, siteModels, hotspots
│   └── tour/               # types (TourStop, SACSAYHUAMAN_TOUR)
├── services/               # tourData, tourService
├── stores/                 # authStore, tourStore, locationStore, mapStore, chatStore
├── styles/                 # index.css, tailwind.css, theme.css
├── public/                 # modelos 3D (.glb), assets estáticos
│   └── models/source/      # modelos sin optimizar (origen del pipeline)
└── workers/                # downloadWorker
```

```
scripts/
└── optimize-models.mjs     # pipeline de compresión gltf-transform + gltfpack
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

Sin estas, `npm run optimize:models` y el `prebuild` hook fallarán. Si no trabajás con modelos 3D, podés saltearlas.

### Variables de entorno (.env)

```env
VITE_MAPBOX_TOKEN=pk.xxx
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx
```

La app requiere Supabase Auth y Mapbox. Sin token de Mapbox, el mapa muestra un fallback informativo.

### Base de datos

Ejecutar `docs/supabase-schema.sql` en el SQL Editor de Supabase para crear tablas, datos semilla y políticas RLS. Usuario de prueba: `turista@rimay.pe` / `Rimay2025!` (crear vía `scripts/create-test-user.mjs`).

---

## Stores

| Store | Estado |
|-------|--------|
| `authStore` | user, isAuthenticated, login/signUp/socialLogin/logout |
| `tourStore` | tour, stops, currentStopIndex, isDownloaded, completedIds |
| `locationStore` | position (lat/lng/accuracy), isWatching, activeStopId |
| `mapStore` | isReady, activePoi, showPopup, show3DViewer, flyToPoi |
| `chatStore` | isOpen, messages, toggle/send/reset |
