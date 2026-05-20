# Rimay Guide PWA — Guía de Audio para Tours en Cusco

Aplicación web progresiva (PWA) para audio-guías con geolocalización de sitios arqueológicos en Cusco. Diseño Dark Neon UI con glassmorphism.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Bundler**: Vite 6
- **Routing**: react-router v7
- **State**: Zustand (5 stores)
- **UI**: Tailwind CSS v4 + shadcn/ui + Motion (Framer Motion)
- **3D**: Three.js + React Three Fiber + Drei
- **Mapa**: Mapbox GL JS
- **IA**: Google Gemini API + Fuse.js (offline search)
- **PWA**: vite-plugin-pwa (Workbox)

## Design System

Dark neon con acento #E6FF00 sobre fondo #0E0E0E. Tipografía Poppins. Todos los tokens definidos en `src/styles/theme.css` y documentados en `DesignSystem.tsx`.

## Features

- 🎵 **Audio Player** con waveform, seek, neon glow, mini player flotante
- 🗺️ **Mapa interactivo** con paradas y puntos de interés (Mapbox)
- 🏛️ **Visor 3D** de sitios arqueológicos con hotspots interactivos
- 🤖 **Chat IA** offline/online con Gemini sobre cultura inca
- 📍 **Geolocalización** con detección de entrada a zonas de parada
- 📥 **Descarga offline** de tours con service worker
- 🏠 **Instalable** como PWA

## Getting Started

```bash
npm install
npm run dev
```

### Entorno

Crear un archivo `.env` en la raíz:

```env
VITE_MAPBOX_TOKEN=tu_token
VITE_GEMINI_API_KEY=tu_api_key
VITE_SUPABASE_URL=tu_url
VITE_SUPABASE_ANON_KEY=tu_key
```

Sin API keys, la app funciona en modo demo:
- Chat opera offline con contenido local
- Mapa muestra fallback
- Audio usa archivos locales en `src/public/voices/`

## Estructura

```
src/
├── app/
│   ├── components/
│   │   ├── atoms/        # Componentes base (ErrorBoundary, PageTransition, etc.)
│   │   ├── organisms/    # Componentes de negocio (AudioPlayer, ChatPanel, TourMap, etc.)
│   │   └── ui/           # shadcn/ui
│   └── screens/          # Pantallas (Splash, Login, Player, DesignSystem)
├── hooks/                # Custom hooks (useGeolocation)
├── lib/                  # Lógica de dominio (chat, map, tour types)
├── services/             # Servicios
├── stores/               # Zustand stores (auth, chat, location, map, tour, audio)
├── styles/               # CSS (Tailwind v4, theme tokens)
└── workers/              # Web Workers
```

## Demo Mode

La app arranca con `isAuthenticated: true` y un usuario demo, permitiendo navegar todo el flujo sin login.
