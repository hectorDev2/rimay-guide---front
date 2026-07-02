# Rimay Guide — Status de la Aplicación

> Generado: 2026-06-14

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | React 18.3.1 + TypeScript |
| Bundler | Vite 6.3.5 |
| Routing | React Router 7 |
| Estado | Zustand 5 (6 stores) |
| Estilos | Tailwind CSS 4 + CSS custom properties |
| Animaciones | Motion (Framer Motion) |
| 3D | Three.js + React Three Fiber + Drei |
| Mapas | Mapbox GL JS (satellite-streets, fill-extrusion) |
| IA | Google Gemini API + Fuse.js (offline fallback) |
| PWA | vite-plugin-pwa (Workbox, auto-update) |
| Backend | Supabase (Auth + PostgreSQL) |
| UI Library | shadcn/ui (38 componentes Radix + Tailwind) |
| i18n | react-i18next + i18next |

---

## Puntos Fuertes

### Arquitectura
- **Stores desacopladas**: cada dominio (auth, tour, audio, chat, location, map) con su propio store Zustand. Sin providers, sin acoplamiento.
- **Container-Presentational**: `App.tsx` como container que orquesta toda la lógica; screens y organisms son puramente presentacionales.
- **Offline-first nativo**: Service Worker con Workbox, Cache API, Fuse.js como fallback offline para el chat.
- **Atomic Design (parcial)**: separación clara entre `atoms/`, `organisms/`, `screens/`. Fácil escalar a molecules y templates.

### UX / UI
- **Dark Neon UI consistente**: design tokens en `theme.css`, radios exagerados (22px default), sombras neon, paleta limitada y coherente.
- **Mobile-first**: todo en `max-w-md` centrado, bottom-sheets, FAB, gestures. Se siente como app nativa.
- **Waveform visualization**: las barras animadas del AudioPlayer dan feedback visual de progreso.
- **Transiciones con Motion**: page transitions, modales spring, AnimatePresence — la navegación se siente fluida.

### Funcionalidades Core
- **AudioPlayer completo**: play/pause, skip 15s, seek bar con hover tooltip, auto-next al terminar, cola de reproducción.
- **Chat híbrido IA**: Gemini API con streaming online + Fuse.js fuzzy search offline. Contexto cultural del tour actual.
- **Geolocalización activa**: watchPosition con Haversine cada 5s, geofencing ≤25m, detección automática de parada cercana.
- **Mapa 3D**: Mapbox GL con satélite real, fill-extrusion buildings, POI markers con popups, flyTo animations.
- **Visor 3D**: modelos procedurales por categoría (6 tipos) + modelo GLB real de Coricancha, hotspots interactivos.

### PWA
- **Precache de todo el shell**: JS, CSS, HTML, GLB.
- **Runtime caching**: imágenes (StaleWhileRevalidate, 30d), audio y GLB (CacheFirst, 90d), API (NetworkFirst, 5s timeout).
- **Manifest completo**: standalone, theme_color, icons.
- **AddToHomeScreen**: modal con instrucciones iOS/Android.

### Data
- **9 paradas de Sacsayhuamán con coordenadas reales** en ~~~types.ts~~~.
- **15 POIs totales**: 9 tour stops + 7 sitios culturales (Coricancha, Qenqo, Puka Pukara, Tambomachay, etc.).
- **Base de conocimiento del chat**: 16 ítems culturales (fundación del Cusco, cosmovisión inca, quechua, etc.).
- **30+ hotspots 3D categorizados** con descripciones históricas.

### Auth
- Autenticación real con Supabase: email/password, Google OAuth, Apple OAuth.
- Manejo de sesión con `onAuthStateChange`, loading states, redirects.
- Auth guard en rutas, error handling.
- Confirmación de email post-signup.

---

## Debilidades

### 3D y Visuales
| Problema | Detalle |
|----------|---------|
| Modelos procedurales muy básicos | Geometrías simples (box, cylinder, cone), colores planos, sin texturas. Se ven como prototipo, no como producto real. |
| Solo 1 GLB real | `model_qoricancha.glb` (4.6MB) es el único modelo 3D real. Los otros 14 POIs usan procedurales. |
| Sin LOD | Misma geometría sin importar la distancia de cámara. |
| Canvas se monta/desmonta | Latencia al abrir el visor 3D — el Canvas se crea desde cero cada vez. |
| Iluminación plana | Sin HDR, sin environment map, sin reflejos. Los modelos se ven mates y artificiales. |
| Sin animaciones de entrada | Los modelos aparecen de golpe, sin fade-in ni transición. |

### MVP Features
| Problema | Detalle |
|----------|---------|
| 1 solo audio para 9 stops | `sacsayhuaman_es.mp3` es el mismo archivo para todas las paradas. El tour audio no funciona como tal. |
| 1 solo tour hardcodeado | `SACSAYHUAMAN_TOUR` en `types.ts`. No hay soporte multi-tour. |
| Download mock | `DownloadModal` muestra progreso falso con `setInterval`. El `downloadWorker.ts` existe pero no se invoca. |
| Falta persistencia | `locationStore` y `mapStore` no persisten — `discoveredPoiIds` se pierde al recargar. |
| Sin pruebas | 0 tests en todo el proyecto. |

### Arquitectura
| Problema | Detalle |
|----------|---------|
| Atomic Design incompleto | Faltan `molecules/` y `templates/`. El salto de atoms a organisms es grande. |
| Dependencias pesadas no usadas | MUI completo, recharts, react-slick, cmdk, embla-carousel, drag-n-drop — engordan el bundle sin beneficio. |
| Sin limpieza de imports | Muchos imports no utilizados, ESLint sin configurar. |
| Sin CI/CD | No hay pipeline de deploy automatizado. |

### UX
| Problema | Detalle |
|----------|---------|
| Sin skeleton loaders | El spinner genérico no informa qué está cargando. |
| Transiciones abruptas entre stops | El cambio de stop en el player es instantáneo, sin crossfade. |
| Sin feedback háptico | No se usa `navigator.vibrate` en geofence enter. |
| OrbitControls sin restricciones | El usuario puede hacer zoom extremo y "salirse" del modelo 3D. |
| Sin soporte para comandos de voz | No hay "siguiente parada", "reproducir", etc. |

### PWA
| Problema | Detalle |
|----------|---------|
| Download offline no funcional | El modal de descarga existe pero no descarga nada realmente. |
| Sin sincronización en background | No hay Background Sync para acciones offline. |
| Sin periodic background sync | No se actualiza contenido en background. |

---

## Mejoras por Prioridad

### 🔴 Críticas — MVP no sale sin esto

1. **Audio real por stop**
   - 9 pistas de narración independientes, una por parada
   - Reemplazar el MP3 único compartido
   - Ubicación: `src/public/voices/` — actualmente solo `sacsayhuaman_es.mp3`
   - Archivos afectados: `src/lib/tour/types.ts`, `src/app/components/organisms/AudioPlayer.tsx`

2. **Modelo GLB de Sacsayhuamán**
   - Mínimo 1 modelo real del complejo principal
   - Usar pipeline existente (`scripts/optimize-models.mjs`) con `gltf-transform` + `gltfpack`
   - Categoría: `fortaleza` (POI `sacsayhuaman-fortaleza`)

3. **Download funcional**
   - Conectar `downloadWorker.ts` con el modal (`DownloadModal.tsx`)
   - Cache API real con progreso por URL
   - Archivos afectados: `src/workers/downloadWorker.ts`, `src/app/components/organisms/DownloadModal.tsx`, `src/stores/tourStore.ts`

### 🟡 Alta Prioridad

4. **Sistema multi-tour**
   - Desacoplar `SACSAYHUAMAN_TOUR` de `types.ts`
   - Schema Supabase: `tours` + `tour_stops` + `user_progress`
   - Cargar tour por slug desde `tourService.ts` (ya conectado a Supabase, pero sin datos)

5. **Persistencia de mapStore**
   - Agregar Zustand `persist` middleware a `mapStore`
   - Persistir `discoveredPoiIds`, `center`, `zoom`, `pitch`

6. **LOD + texturas para modelos procedurales**
   - Al menos textures vía CanvasTexture o shader básico
   - Alternativa: sustituir todos los procedurales por GLBs reales

7. **Skeleton loaders**
   - SplashScreen skeleton mientras carga el tour
   - LocationModal skeleton mientras Mapbox inicializa
   - AudioPlayer skeleton mientras carga metadata

8. **Tests**
   - Unitarios: stores (Zustand), hooks (useGeolocation), utils (geofence, haversine)
   - Integración: flujo player (play → timeupdate → end → next)
   - Sin framework definido — usar Vitest (ya disponible vía Vite)

### 🟢 Media Prioridad

9. **Molecules layer**
   - Extraer: `StopCard`, `POIMarker`, `HotspotTooltip`, `AudioSeekBar`, `StopListItem`
   - De `organisms/` a `components/molecules/`

10. **Optimización de bundles**
    - Auditar y remover: MUI, recharts, react-slick, cmdk, embla-carousel, drag-n-drop
    - Potencial ahorro: ~2.4MB

11. **Transiciones entre stops**
    - Crossfade en AudioPlayer al cambiar de stop
    - Animación de waveform al reiniciar

12. **Environment HDR para R3F**
    - Agregar `Environment` de drei con skybox
    - Los modelos procedurales se verían 10x mejores

13. **Streaming de audio progresivo**
    - No esperar a que cargue el audio completo
    - Usar `preload="metadata"` y comenzar reproducción parcial

### 🔵 Nice to Have

14. **QR scanner**
    - La ruta `/tour/:slug` ya existe
    - Agregar botón de escaneo con cámara

15. **Feedback háptico**
    - `navigator.vibrate(50)` al entrar en geofence
    - `navigator.vibrate([30, 50, 30])` al completar parada

16. **Comandos de voz**
    - Web Speech API para "siguiente", "anterior", "reproducir", "pausa"

17. **Storybook**
    - Catálogo de componentes atómicos y moleculares

18. **CI/CD**
    - GitHub Actions + Vercel/Cloudflare Pages
    - Tests automáticos en PR

---

## Archivos Clave

| Archivo | Rol |
|---------|-----|
| `src/app/App.tsx` | Container principal, routing, auth guard, tour loading |
| `src/app/screens/SplashScreen.tsx` | Hero + lista de stops + CTAs |
| `src/app/components/organisms/AudioPlayer.tsx` | Reproductor con waveform, seek, controles |
| `src/app/components/organisms/SiteViewer3D.tsx` | Visor 3D con R3F, hotspots, audio integrado |
| `src/app/components/organisms/LocationModal.tsx` | Modal de mapa + POIs + visor 3D |
| `src/app/components/organisms/TourMap.tsx` | Mapbox GL con 3D, markers, geofencing |
| `src/app/components/organisms/ChatPanel.tsx` | Chat IA con Gemini + Fuse.js fallback |
| `src/app/components/organisms/DownloadModal.tsx` | Modal de descarga offline (mock) |
| `src/lib/tour/types.ts` | Tour/TourStop interfaces + SACSAYHUAMAN_TOUR |
| `src/lib/map/siteModels.tsx` | 6 modelos procedurales + Qoricancha GLB |
| `src/lib/map/pois.ts` | 15 POIs con coordenadas, colores, geofence |
| `src/lib/map/hotspots.ts` | 30+ hotspots interactivos con descripciones |
| `src/lib/map/geofence.ts` | Haversine + proximity + extrusion polygons |
| `src/hooks/useGeolocation.ts` | watchPosition + geofencing automático |
| `src/stores/authStore.ts` | Auth Supabase con login/signup/social |
| `src/stores/tourStore.ts` | Tour actual, progreso, descarga (con persist) |
| `src/stores/mapStore.ts` | Estado del mapa, POIs, visor 3D |
| `src/stores/audioStore.ts` | Reproducción, tiempo, duración |
| `src/stores/locationStore.ts` | Posición GPS, error, watching |
| `src/stores/chatStore.ts` | Mensajes, streaming, persistencia localStorage |
| `src/services/tourService.ts` | Fetch de tour desde Supabase |
| `src/workers/downloadWorker.ts` | Web Worker para descarga offline (sin usar) |
| `src/public/model_qoricancha.glb` | Único modelo GLB real (4.6MB) |
| `scripts/optimize-models.mjs` | Pipeline de compresión 3D |
| `src/styles/theme.css` | Design tokens Dark Neon |

---

## Métricas Clave

| Métrica | Valor |
|---------|-------|
| Archivos fuente | ~68 |
| Líneas de código | ~8,500 |
| Stores Zustand | 6 |
| Dependencias | ~45 directas |
| Modelos 3D procedurales | 6 categorías |
| Modelos GLB reales | 1 (Qoricancha, 4.6MB) |
| Hotspots 3D | 30+ |
| POIs | 15 (9 tour + 7 culturales) |
| Stops por tour | 9 |
| Tours disponibles | 1 (Sacsayhuamán) |
| Archivos de audio | 1 MP3 (compartido) |
| Tests | 0 |
| Componentes shadcn/ui | 38 |
| Cobertura i18n | Parcial (login, splash, player, chat, location) |
