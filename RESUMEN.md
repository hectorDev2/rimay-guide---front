# Rimay Guide — Resumen Completo de la App

**Rimay Guide** es una **PWA offline-first** de audio-guías turísticas para sitios arqueológicos en Cusco, con un diseño **Dark Neon UI**. Desarrollada con React 18 + Vite 6 + TypeScript.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | React 18.3.1 |
| Bundler | Vite 6.3.5 |
| Routing | React Router 7 |
| Estado | Zustand 5 |
| Estilos | Tailwind CSS 4 + CSS custom properties |
| Animaciones | Motion (Framer Motion) |
| 3D | Three.js + React Three Fiber + Drei |
| Mapas | Mapbox GL + Leaflet |
| IA | Google Gemini API + Fuse.js (offline) |
| PWA | vite-plugin-pwa (Workbox) |
| Backend | Supabase (inicializado, sin uso activo) |
| Componentes | shadcn/ui (38 componentes Radix + Tailwind) |
| Drag & Drop | react-dnd |

---

## Estructura de Archivos

```
src/
├── main.tsx                    # Entry point: BrowserRouter > StrictMode > App
├── app/
│   ├── App.tsx                 # Orquestador: routing, auth guard, layout global
│   ├── components/
│   │   ├── atoms/              # Componentes base reutilizables
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── ImageWithFallback.tsx
│   │   │   ├── OfflineToast.tsx
│   │   │   └── PageTransition.tsx
│   │   ├── organisms/          # Componentes complejos de negocio
│   │   │   ├── AddToHomeScreen.tsx
│   │   │   ├── AudioPlayer.tsx
│   │   │   ├── ChatButton.tsx
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── DebugLocationPanel.tsx
│   │   │   ├── DownloadModal.tsx
│   │   │   ├── LocationModal.tsx
│   │   │   ├── MiniPlayer.tsx
│   │   │   ├── SiteViewer3D.tsx
│   │   │   ├── TourMap.tsx
│   │   │   └── TourStopsList.tsx
│   │   └── ui/                 # shadcn/ui (38 componentes)
│   ├── screens/
│   │   ├── SplashScreen.tsx    # Hero + lista de paradas + CTA
│   │   ├── LoginScreen.tsx     # Email + Google + Apple login
│   │   ├── NotFoundScreen.tsx  # 404
│   │   └── DesignSystem.tsx    # Style guide
├── hooks/
│   └── useGeolocation.ts       # watchPosition + Haversine + geofencing
├── lib/
│   ├── chat/
│   │   ├── constants.ts        # Base de conocimiento cultural (16 items + 9 stops)
│   │   ├── geminiClient.ts     # Gemini API streaming
│   │   ├── offlineSearch.ts    # Fuse.js fuzzy search offline
│   │   └── tourContext.ts      # System prompt builder contextual
│   ├── map/
│   │   ├── geofence.ts         # Haversine + proximity + extrusion polygons
│   │   ├── hotspots.ts         # 30+ hotspots 3D categorizados
│   │   ├── pois.ts             # 15 puntos de interés (9 stops + 6 culturales)
│   │   └── siteModels.tsx      # 6 modelos Three.js (fortaleza, templo, etc.)
│   ├── tour/
│   │   └── types.ts            # Interfaces + SACSAYHUAMAN_TOUR (9 stops hardcodeados)
│   └── supabaseClient.ts       # Cliente Supabase
├── services/
│   └── tourService.ts          # Mock fetching con delays simulados
├── stores/
│   ├── authStore.ts            # Auth mock (isAuthenticated: true default)
│   ├── tourStore.ts            # Tour actual, stop activo, progreso
│   ├── audioStore.ts           # Reproducción, tiempo, duración
│   ├── chatStore.ts            # Mensajes, streaming, localStorage persist
│   ├── locationStore.ts        # GPS position, activeStopId
│   └── mapStore.ts             # Mapbox estado, POIs, 3D viewer
├── styles/
│   ├── theme.css               # Design tokens: colores, sombras, radios, spacing
│   ├── tailwind.css            # Tailwind layers
│   └── index.css               # Global styles
├── public/
│   ├── pwa-192x192.png
│   ├── pwa-512x512.png
│   └── voices/
│       └── sacsayhuaman_es.mp3 # Único audio real (compartido por 9 stops)
└── workers/
    └── downloadWorker.ts       # Web Worker para descarga con Cache API
```

---

## Routing

| Path | Componente | Auth | Descripción |
|------|-----------|------|-------------|
| `/` | SplashScreen | ✅ | Hero + lista de paradas + modales (Location, Download, A2HS) |
| `/login` | LoginScreen | ❌ | Login con redirect param |
| `/player` | AudioPlayer + MiniPlayer + TourStopsList | ✅ | Reproductor con geolocalización |
| `/tour/:slug` | Redirige a `/` | ✅ | Solo acepta `sacsayhuaman` |
| `*` | NotFoundScreen | ❌ | 404 |

El auth guard en `App.tsx` redirige a `/login?redirect=<path>` si `!isAuthenticated`.

---

## Estado Global (Zustand — 6 stores)

| Store | Estado clave | Persistencia |
|-------|-------------|-------------|
| `authStore` | `user`, `isAuthenticated` (default `true`) | ❌ |
| `tourStore` | `tour`, `currentStopIndex`, `completedIds[]`, `downloadProgress` | ❌ |
| `audioStore` | `isPlaying`, `currentStopId`, `currentTime`, `duration` | ❌ |
| `chatStore` | `messages[]`, `isOpen`, `streamingContent` | ✅ localStorage |
| `locationStore` | `position`, `activeStopId`, `isWatching` | ❌ |
| `mapStore` | `discoveredPoiIds`, `activePoi`, `center`, `zoom`, `pitch` | ❌ |

---

## Data Flow

```
Usuario → Acción
  │
  ├─> Navegación → React Router → App.tsx (auth guard) → Screen + Organisms
  │
  ├─> "Iniciar narración" → navigate('/player') → AudioPlayer
  │     ├─> Play/Pause → audioStore
  │     ├─> Time update → audioStore
  │     ├─> On end → tourStore.markStopCompleted() + auto next
  │     └─> MiniPlayer lee audioStore (barra fija inferior)
  │
  ├─> GPS activado → useGeolocation hook
  │     ├─> watchPosition → locationStore.setPosition()
  │     ├─> Haversine check → findNearestStopInRange()
  │     ├─> Entered zone (≤25m) → onEnterStop(stopId)
  │     └─> TourMap actualiza marcador + edificios 3D
  │
  ├─> Chat abierto → chatStore.isOpen = true
  │     ├─> Online → Gemini API streaming (respuesta con contexto cultural)
  │     ├─> Offline → Fuse.js fuzzy search en knowledge base local
  │     └─> Mensajes persistidos en localStorage
  │
  └─> Mapa abierto → LocationModal → TourMap (Mapbox GL)
        ├─> 3D fill-extrusion buildings con altura real
        ├─> POI markers + geofencing activo
        ├─> Click POI → flyTo + popup → "Ver en 3D" → SiteViewer3D
        └─> SiteViewer3D: modelos Three.js con hotspots interactivos
```

---

## Componentes Destacados

### AudioPlayer
Reproductor completo con waveform visual, seek bar, play/pause, skip, y widgets FAB (chat, stops, mapa). Se integra con `audioStore` y `tourStore` para manejo de cola de reproducción.

### ChatPanel
Chat full-screen con IA que usa **Google Gemini** online o **Fuse.js** offline. La IA tiene personalidad de guía turístico y contexto del tour actual. Los mensajes persisten en localStorage.

### TourMap
Mapa satelital Mapbox GL con:
- Edificios 3D (fill-extrusion con alturas reales)
- POI markers con popups
- Marcador de ubicación del usuario + círculo de precisión
- Geofencing automático para detectar POIs cercanos

### SiteViewer3D
Visor 3D con Three.js que renderiza modelos arquitectónicos según el tipo de POI:
- **Fortaleza**: muros zigzag (típicos de Sacsayhuamán)
- **Templo**: formas trapezoidales con nichos
- **Santuario**: rocas esculpidas
- **Mirador**: plataforma elevada
- **Plaza**: espacio abierto rectangular
- **TourStop**: modelo genérico con esfera + cilindro

### MiniPlayer
Barra fija inferior que aparece cuando hay audio reproduciéndose. Muestra stop actual, progreso y controles básicos.

### LocationModal
Modal que contiene el TourMap, el visor 3D y la lista de POIs. Es el centro de navegación espacial de la app.

---

## Chat IA — Arquitectura Híbrida

```
sendMessage()
  │
  ├─> ¿Online?
  │     ├─> ✅ → geminiClient.handleOnlineQuery()
  │     │     ├─> Construye system prompt con contexto del tour
  │     │     ├─> Envía a Gemini API (gemini-3-flash-preview)
  │     │     └─> Streaming response → chatStore.streamingContent
  │     │
  │     └─> ❌ → offlineSearch.handleOfflineQuery()
  │           ├─> Tokeniza query
  │           ├─> Fuse.js fuzzy search en knowledge base
  │           └─> Respuesta local con matching scores
  │
  └─> Messages guardados en localStorage (clave: rimay_chat_messages)
```

### Base de Conocimiento (16 items)
Cubre: Fundación del Cusco, Cosmovisión Inca, Arquitectura Inca, Quechua, el Inti, la Chakana, cuentos y leyendas, etc.

---

## Datos Turísticos

### 9 Paradas de Sacsayhuamán

| # | Parada | Coordenadas |
|---|--------|------------|
| 1 | Puerta Principal y control | -13.5095, -71.9820 |
| 2 | Explanada principal | -13.5093, -71.9818 |
| 3 | Muros Zigzag (primera muralla) | -13.5090, -71.9815 |
| 4 | Muros Zigzag (segunda/sexta) | -13.5087, -71.9812 |
| 5 | Muros Zigzag (tercera/quinta) | -13.5085, -71.9810 |
| 6 | Rodadero / Suchuna | -13.5080, -71.9830 |
| 7 | Trono del Inca | -13.5085, -71.9835 |
| 8 | Mirador / Vista panorámica | -13.5088, -71.9805 |
| 9 | Puerta del Sol / Inti Punku | -13.5075, -71.9825 |

### 15 Puntos de Interés
9 stops + 6 culturales: Coricancha, Plaza de Armas, Qenqo, Puka Pukara, Tambomachay, San Blas, Mercado San Pedro.

---

## Geolocalización

El hook `useGeolocation`:
- Usa `navigator.geolocation.watchPosition` con intervalo configurable (default 5s)
- Calcula distancia Haversine a cada stop
- Umbral de entrada: **25 metros** del centro del POI
- Al entrar en zona: dispara `onEnterStop(stopId)`
- Actualiza `locationStore` continuamente

---

## PWA

- **Service Worker**: generado por vite-plugin-pwa con Workbox
- **Estrategias de cache**:
  - Imágenes: StaleWhileRevalidate (30 días)
  - MP3: CacheFirst (90 días)
  - API: NetworkFirst (timeout 5s)
- **Manifest**: nombre "Rimay Guide", theme #A0522D, background #F5F0E8, display standalone
- **AddToHomeScreen**: modal con instrucciones para iOS/Android

---

## Design Tokens (Dark Neon Theme)

Definidos en `src/styles/theme.css`:

```css
:root {
  --bg-primary: #0E0E0E;
  --bg-surface: #171717;
  --bg-card: #202020;
  --color-primary: #E6FF00;       /* Neon amarillo */
  --color-success: #AFFF00;
  --color-destructive: #FF4D67;
  --radius-xs: 10px;
  --radius-sm: 16px;
  --radius-md: 22px;
  --radius-lg: 30px;
  --radius-xl: 40px;
  --radius-pill: 999px;
  --font-primary: 'Poppins', sans-serif;
  --shadow-card: 0 4px 30px rgba(0,0,0,0.3);
  --shadow-neon: 0 0 20px rgba(230,255,0,0.2);
}
```

---

## Estado Actual y Limitaciones

### ✅ Funcional
- App 100% funcional en modo demo
- Navegación completa entre pantallas
- Chat IA con fallback offline
- Mapbox 3D con geofencing
- Modelos 3D en Three.js
- Audio player con cola de reproducción
- Diseño responsive mobile-first (max-w-md centrado)

### ⚠️ Mock / Placeholder
- **Login**: simula delay, sin backend real
- **Descarga**: barra de progreso con `setInterval` (el Web Worker no se usa)
- **Tour data**: hardcodeado en `types.ts`, solo `sacsayhuaman`
- **Audio**: 1 solo archivo MP3 real, compartido por los 9 stops
- **Supabase**: inicializado pero no conectado
- **Auth**: `isAuthenticated: true` por defecto, sin persistencia de sesión
- **Sin tests**, sin CI/CD

### 📐 Patrones de Arquitectura
- **Atomic Design**: implementado parcialmente (quarks, atoms, organisms, screens). Faltan molecules y templates.
- **Container-Presentational**: App.tsx como container; screens/organisms presentacionales
- **Stores desacopladas**: cada dominio con su store Zustand, sin providers
- **Offline-first**: Service Worker + Fuse.js fallback + Cache API
