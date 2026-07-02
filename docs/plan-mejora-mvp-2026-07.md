# Plan de Mejora del MVP — Rimay Guide

> Generado: 2026-07-01. Reemplaza las prioridades de `STATUS.md` (2026-06-14), varias de las cuales ya se resolvieron.

## 1. Qué se resolvió desde el último status (verificado en código/git)

| Ítem de STATUS.md | Estado real hoy |
|---|---|
| Download mock | Resuelto — `downloadWorker.ts` conectado a `DownloadModal.tsx` (commit `c7882f7`) |
| `mapStore` sin persistencia | Resuelto — `persist` middleware activo, guarda `discoveredPoiIds`, `center`, `zoom`, `pitch` |
| Sistema multi-tour | Resuelto a nivel de tipos (`Tour`/`TourStop` desacoplados, `tourService.ts` lee de Supabase con fallback), pero **sigue habiendo un solo tour cargado** (`sacsayhuaman`) |
| Sin tests | Resuelto — 45 tests (Vitest) sobre geofence, tipos, `tourStore`, `mapStore` |
| Skeleton loaders | Resuelto (commit `badbc80`) |
| Texturas en modelos procedurales | Resuelto — CanvasTexture + bump maps (commit `f04b08d`) |
| Dependencias pesadas (MUI, recharts, react-slick, cmdk, embla) | Resuelto — no aparecen en `package.json` actual |
| i18n / LandingScreen | Se agregó `LandingScreen` con selector de idioma y fix de race condition ES/EN |

## 2. Gaps que siguen abiertos (verificado)

1. **Audio sigue siendo un solo MP3 compartido para las 9 paradas** (`src/public/voices/sacsayhuaman_es.mp3`, referenciado igual en las 9 entradas de `src/lib/tour/data.ts`). Esto es el hueco más grave: la "audio-guía" no guía nada distinto por parada.
2. **Un solo tour real** (`sacsayhuaman`) — la arquitectura multi-tour existe pero no hay contenido de un segundo tour para validarla.
3. **Un solo modelo GLB real** (Qoricancha). Las otras 14 POIs siguen usando geometría procedural (ya con texturas, pero sin ser el sitio real).
4. Sin CI/CD.
5. Auditoría de bundle: falta confirmar tamaño final tras la limpieza de dependencias (no hay build report reciente).

## 3. Investigación — cómo resolver los gaps críticos

**Narración por parada (el bloqueante #1).** Grabar 9 narraciones profesionales es la opción de mayor calidad pero de costo/tiempo alto. Alternativa validada para MVP: TTS de voz natural en español.
- ElevenLabs y Murf.ai destacan por naturalidad y acentos regionales (Perú/LatAm) — mejor opción para un tono cálido de guía turística.
- Fish Audio y Deepgram Aura-2 son más baratos y con streaming de baja latencia, pero pensados para casos conversacionales más que narrativos.
- Recomendación: generar las 9 narraciones con ElevenLabs (o Murf), revisión editorial del guion en español (y quechua si se quiere mantener `nameQuechua`), exportar MP3 y aplicar el mismo pipeline de precache que ya existe (Workbox `CacheFirst`, 90d).
Fuentes: [ElevenLabs Spanish TTS](https://elevenlabs.io/text-to-speech/spanish), [Murf.ai Spanish TTS](https://murf.ai/text-to-speech/spanish), [Top TTS APIs 2026 — AssemblyAI](https://www.assemblyai.com/blog/top-text-to-speech-apis), [Gradium — Best TTS APIs 2026](https://gradium.ai/content/best-text-to-speech-apis-2026)

**Modelos 3D adicionales.** El pipeline actual (Tripo AI → gltf-transform → gltfpack) ya es el enfoque recomendado para 2026: Tripo3D P1 genera low-poly listo para producción a ~$0.28–0.35 por modelo, formato GLB nativo, uso comercial permitido. Es la ruta más barata para pasar de 1 a 3–4 modelos reales (los POIs más visitados: Sacsayhuamán fortaleza, Qenqo, Tambomachay) sin tocar el pipeline de optimización que ya funciona.
Fuentes: [Tripo3D](https://www.tripo3d.ai/), [Meshy vs Tripo 2026](https://www.meshy.ai/compare/meshy-vs-tripo), [Poyo — Tripo P1 pricing](https://poyo.ai/models/tripo-p1-3d)

**Reproducción en background / lock screen.** La app usa `<audio>` nativo, que es la base correcta. Falta exponer Media Session API (metadata + controles de lock screen/notificación) — implementación estándar, <100 líneas, soportada ampliamente. Limitación a tener presente: en iOS PWA no hay background sync real, así que la app debe seguir abierta (en background del SO, no cerrada) para mantener audio y GPS activos; esto ya es una limitación conocida de iOS y no tiene solución dentro de una PWA.
Fuentes: [What PWA Can Do Today — Audio](https://whatpwacando.today/audio/), [PWA iOS limitations 2026](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide), [Prototyp — PWA audio playback](https://prototyp.digital/blog/what-we-learned-about-pwas-and-audio-playback)

## 4. Roadmap priorizado

### 🔴 Crítico — bloquea el MVP real
1. **Narración única por parada.** Generar 9 audios con TTS (ElevenLabs/Murf), revisar guion, subir a `src/public/voices/`, actualizar `audioSrc` en `src/lib/tour/data.ts` (y seed de Supabase si se usa esa fuente).
2. **Media Session API.** Agregar metadata (título, imagen, artista="Rimay Guide") y controles de lock screen en `AudioPlayer.tsx`/`audioStore.ts`.

### 🟡 Alta prioridad
3. **Segundo tour completo** (ej. Qenqo o Valle Sagrado) para validar que la arquitectura multi-tour funciona de punta a punta: datos en Supabase, `tourService.ts`, ruta `/tour/:slug`, QR.
4. **2–3 modelos GLB reales adicionales** vía Tripo AI para los POIs más visitados, usando el pipeline existente.
5. **CI/CD básico**: GitHub Actions con `npm test` + `npm run build` en cada PR, deploy automático a Vercel (ya hay `vercel.json`).

### 🟢 Media prioridad
6. Auditoría de bundle post-limpieza de dependencias (medir con `vite build --report` o `rollup-plugin-visualizer`) para confirmar el ahorro y detectar nuevas dependencias pesadas.
7. `molecules/` layer (extraer `StopCard`, `POIMarker`, `HotspotTooltip`, etc.) — sigue pendiente de `STATUS.md`.
8. Crossfade entre paradas en `AudioPlayer`.

### 🔵 Nice to have
9. QR scanner para `/tour/:slug`.
10. Feedback háptico (`navigator.vibrate`) en geofence.
11. Comandos de voz (Web Speech API).

## 5. Siguiente paso sugerido

Empezar por el ítem #1 (narración por parada) — es el que más impacta la percepción de "producto real" vs. prototipo, y no depende de ningún otro punto del roadmap. ¿Querés que arme los 9 guiones en español (y el prompt/flujo para generarlos con TTS) como siguiente paso?
