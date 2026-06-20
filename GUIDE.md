# Rimay Guide — Guía de Desarrollo

> PWA offline-first para audio-guías con geolocalización en sitios arqueológicos de Cusco.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| UI | React 18 + TypeScript + Tailwind CSS 4 |
| Bundler | Vite 6 + SWC |
| Routing | react-router v7 |
| State | Zustand 5 (6 stores desacopladas) |
| Animaciones | Motion |
| Mapas 3D | Mapbox GL JS (satellite, fill-extrusion) |
| Visor 3D | Three.js + React Three Fiber + Drei |
| IA | Gemini API + Fuse.js (offline fallback) |
| Auth | Supabase (email, Google, Apple) |
| DB | Supabase PostgreSQL + RLS |
| PWA | vite-plugin-pwa (Workbox, auto-update) |
| UI Library | Radix + shadcn/ui |
| i18n | i18next + react-i18next |

---

## Arquitectura

```
App.tsx (orquestador + auth guard)
  ├── screens/        ← páginas completas (Splash, Login, Player, NotFound)
  ├── organisms/      ← componentes complejos de negocio
  ├── atoms/          ← componentes base reutilizables
  ├── ui/             ← shadcn/ui (38 componentes)
  ├── stores/         ← Zustand (auth, tour, audio, chat, location, map)
  ├── hooks/          ← custom hooks (useGeolocation)
  ├── lib/            ← lógica de negocio pura
  │   ├── chat/       ← Gemini + Fuse.js + constants + tourContext
  │   ├── map/        ← POIs, geofence, siteModels, hotspots
  │   └── tour/       ← Types + SACSAYHUAMAN_TOUR
  ├── services/       ← fetch de datos
  └── workers/        ← Web Worker (descarga offline)
```

### Stores

| Store | Estado clave | Persiste |
|-------|-------------|----------|
| `authStore` | user, isAuthenticated | — |
| `tourStore` | tour, currentStopIndex, completedIds | — |
| `audioStore` | isPlaying, currentStopId, currentTime, duration | — |
| `chatStore` | messages, isOpen, isLoading, isOnline, currentSessionId, streamingContent | localStorage + Supabase |
| `locationStore` | position (lat/lng/accuracy), activeStopId, isWatching | — |
| `mapStore` | discoveredPoiIds, activePoi, center, zoom, pitch | — |

---

## Chat IA — Arquitectura

### Persistencia (3 capas)

```
Supabase (fuente de verdad)
  ├── chat_sessions(user_id, tour_id)
  └── chat_messages(session_id, role, content, feedback)

localStorage (caché offline)
  ├── rimay_chat_messages
  ├── rimay_chat_session
  └── rimay_chat_pending (cola de sync)

Zustand store (estado en memoria)
```

### Flujo

```
sendMessage(content, TourContext)
  ├── Online (Gemini API) → streaming response
  │     ├── upsert a Supabase (sesión creada lazy)
  │     └── processPendingSync() → drena cola offline
  └── Offline (Fuse.js)   → fuzzy search en knowledge base
        └── queuePendingSync() → cola para reconexión

Reconexión (window.online)
  └── processPendingSync() → upserta pendientes a Supabase

Feedback (thumbs up/down)
  └── toggle → UPDATE chat_messages.feedback
```

### Base de conocimiento offline

16 items culturales: Sacsayhuamán, Imperio Inca, arquitectura, cosmología, Pachamama, Inti Raymi, quechua, coca, Cusco, apus, chicha, puma, Qhapaq Ñan, Coricancha, Machu Picchu, ceques, mita, quipus.

---

## Tour: Sacsayhuamán

9 paradas, ~45 min de recorrido:

| # | Parada | Dur. |
|---|--------|------|
| 1 | Murallas Ciclópeas | 4' |
| 2 | Torreón de Muyucmarca | 6' |
| 3 | Sacsayhuamán — Fortaleza del Sol | 5'30" |
| 4 | Plaza del Inca | 5' |
| 5 | Templo de la Luna | 7' |
| 6 | Túneles Subterráneos | 8' |
| 7 | Mirador Panorámico | 4'30" |
| 8 | Roca Sagrada | 3' |
| 9 | Altar Ceremonial | 5' |

---

## Routes

| Path | Screen | Auth |
|------|--------|------|
| `/` | SplashScreen | ✅ |
| `/login` | LoginScreen | ❌ |
| `/player?stopId=X` | PlayerRoute | ✅ |
| `/tour/:slug` | TourRoute (redirect) | ✅ |
| `*` | NotFoundScreen | ❌ |

---

## PWA

- **Precache**: App shell completo (js, css, html)
- **Runtime**: imágenes (StaleWhileRevalidate, 30d), audio MP3 (CacheFirst, 90d), API (NetworkFirst, 5s)
- **Manifest**: standalone, theme #A0522D, icons 192+512

---

## Setup

```bash
npm install
cp .env.example .env  # configurar variables
npm run dev
```

### .env

```
VITE_MAPBOX_TOKEN=pk.xxx
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_GEMINI_API_KEY=AIza...  # opcional — sin esto el chat usa solo offline
```

### DB

Ejecutar `docs/supabase-schema.sql` en Supabase SQL Editor.

---

## Skills Disponibles

Este proyecto usa skills del framework **Gentleman** (`D:\gentleman\gentle-ai`). Skills activas:

| Skill | Trigger |
|-------|---------|
| `sdd-*` | `/sdd-new <change>`, `/sdd-apply`, etc. |
| `judgment-day` | "hacé judgment day" — review adversarial |
| `skill-creator` | "creá un skill para X" |
| `skill-registry` | "actualizá el skill registry" |

Registry en `.atl/skill-registry.md`.

---

## Estado Actual

### ✅ Funcional
- App demo completa, navegación entre pantallas
- Chat IA online (Gemini) + offline (Fuse.js) con persistencia Supabase
- Feedback en respuestas (thumbs up/down)
- Sincronización offline→online automática
- Mapbox 3D con geofencing
- Modelos 3D procedurales (6 categorías)
- Audio player con cola de reproducción
- Auth real con Supabase
- Design system Dark Neon

### ⚠️ Limitaciones
- 1 solo tour hardcodeado (Sacsayhuamán)
- 1 solo audio MP3 compartido por las 9 paradas
- Download offline mock (Web Worker sin conectar)
- Sin tests automatizados
- Sin CI/CD
- Sin feedback háptico

---

## Skills del Proyecto (opencode)

Registradas en `.atl/skill-registry.md`. Se cargan automáticamente al detectar el contexto apropiado.
