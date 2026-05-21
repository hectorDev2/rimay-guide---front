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
  ├─ precache: JS, CSS, HTML
  ├─ runtimeCaching:
  │   ├─ images (Unsplash) → StaleWhileRevalidate (30d)
  │   ├─ audio MP3       → CacheFirst (90d)
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
└── workers/                # downloadWorker
```

---

## Setup

```bash
npm install
npm run dev
```

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
