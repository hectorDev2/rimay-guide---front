# Rimay Guide — Flujo de Usuario

> Cómo un usuario recorre la app de principio a fin

---

## Vista General

```
Llegada → Login → Splash → Player ↔ Chat ↔ Mapa → Cierre
                          ↕           ↕
                      Descarga    AddToHome
```

---

## 1. Llegada — Primer Contacto

### Pantalla: Loading inicial

Cuando el usuario abre la app por primera vez:

```
main.tsx
  ├─ BrowserRouter    → Routing SPA
  ├─ import "./i18n" → Carga traducciones (fallback local + Supabase)
  └─ <App />
       ├─ initializeAuth()    → supabase.auth.getSession()
       └─ fetchTourBySlug()   → Carga tour (Supabase → fallback hardcoded)
```

| Estado | Feedback visual |
|--------|----------------|
| Auth loading | Spinner centrado |
| Tour loading | SplashScreenSkeleton (imagen placeholder + stops esqueletales) |
| Error de carga | Pantalla de error con botón "Reintentar" |

### Pantalla: Login `/login`

Si no hay sesión activa, el usuario ve:

```
┌─────────────────────────────┐
│   [🌐 Language Switcher]    │
│                             │
│        Mountains BG         │
│     (hero image opacity)    │
│                             │
│  ┌───────────────────────┐  │
│  │   Bienvenido          │  │
│  │   Escuchá el Cusco    │  │
│  │                      │  │
│  │  ✉️ Correo           │  │
│  │  🔒 Contraseña       │  │
│  │                      │  │
│  │  [ Continuar ] 🟡    │  │
│  │                      │  │
│  │  ¿No tenés cuenta?   │  │
│  │  Registrate ────     │  │
│  │              o       │  │
│  │  [G] [🍎]            │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

**Acciones posibles:**
- Login con email + password (Supabase Auth)
- Login con Google OAuth
- Login con Apple OAuth
- Cambiar a modo registro (crear cuenta)
- Cambiar idioma (español / inglés)
- Si ya tiene sesión → redirige automáticamente a `/`

**Flujo de registro:**
```
Sign Up → Email confirmation screen
          "Revisá tu email"
          → Vuelve a login
```

---

## 2. Pantalla Principal — SplashScreen `/`

Después del login, el usuario llega al splash:

```
┌─────────────────────────────┐
│   [🌐 Language Switcher]    │
│                             │
│        Mountains BG         │
│     (hero con gradiente)    │
│                             │
│       ⛰️ Rimay Guide       │
│   "Escuchá el Cusco..."    │
│                             │
│  ┌───────────────────────┐  │
│  │ Sacsayhuamán         │  │
│  │ Fortaleza del Sol    │  │
│  │ 9 paradas · 45 min   │  │
│  │                       │  │
│  │ [▶ Iniciar narración] │  │ ← CTA principal
│  │                       │  │
│  │ [📍 Ver ubicación]    │  │ ← Abre LocationModal
│  │                       │  │
│  │ [∨ Ver paradas]       │  │ ← Scroll a lista de stops
│  │                       │  │
│  │ 📱 Guardar en inicio  │  │ ← AddToHomeScreen modal
│  │                       │  │
│  │ ─── Paradas ───────── │  │
│  │ ○ 1. Murallas...     │  │
│  │ ○ 2. Torreón...      │  │ ← Scrollable list
│  │ ● 3. Fortaleza... 🟡 │  │ ← Current stop (playing)
│  │ ○ 4. Plaza del Inca  │  │
│  │ ...                   │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

### Primer uso — Download Modal

Si es la primera vez que entra, aparece automáticamente:

```
┌────────────────────┐
│     📥             │
│                     │
│ Descarga el tour   │
│ antes de llegar    │
│                     │
│ Sacsayhuamán       │
│ (~5.1 MB)          │
│ Recomendamos Wi-Fi │
│                     │
│ [ Descargar ahora ] │
│                     │
│ Mantené esta       │
│ pantalla abierta   │
└────────────────────┘
```

**Flujo de descarga real** (con Web Worker):
```
Click → Worker.postMessage({ urls, cacheName })
  └─ Worker: fetch + Cache API por cada URL
       └─ Progreso → onmessage → barra de progreso
            └─ 100% → "¡Descarga completa!"
                 └─ onClose → AddToHomeScreen modal
```

### Add to Home Screen (PWA)

Post-descarga:

```
┌────────────────────┐
│      📱            │
│                     │
│ Guardá Rimay en    │
│ tu pantalla de     │
│ inicio             │
│                     │
│ iOS: Compartir →   │
│ "Agregar a inicio" │
│                     │
│ Android: ⋮ →       │
│ "Agregar a inicio" │
│                     │
│ [ Entendido ]      │
│ [ Ahora no ]       │
└────────────────────┘
```

---

## 3. Reproductor de Audio — Player `/player?stopId=X`

### Acceso

Tres formas de llegar:

1. **Botón "Iniciar narración"** → `/player` (stop por defecto o último activo)
2. **Click en parada de la lista** → `/player?stopId=<id>`
3. **Geofencing automático** → detecta parada cercana y navega

### Pantalla del Player

```
┌─────────────────────────────┐
│  [← Volver]     [🟢 Off]   │
│                             │
│                             │
│   Parada 3 · Sacsayhuamán  │
│   Fortaleza del Sol         │
│                             │
│   ▌▌▌▌▌▌▌▌▌▌▌▌█▌▌▌▌▌    │ ← Waveform visual
│   ▌▌▌▌▌▌▌▌▌▌▌▌█▌▌▌▌▌    │    (48 barras animadas)
│   ▌▌▌▌▌▌▌▌▌▌▌▌█▌▌▌▌▌    │
│                             │
│   ───────────────────────   │ ← Seek bar con hover
│   1:23             5:30     │
│                             │
│      [⏮] [⏪15] [▶] [⏩15] [⏭]  │
│                             │
│  ┌───────────────────────┐  │
│  │ Siguiente: Mirador... │  │ ← Tap → lista de stops
│  └───────────────────────┘  │
│                             │
│                    [+ FAB] │ ← Widgets flotantes
│                             │
└─────────────────────────────┘
```

**Controles:**
| Botón | Acción |
|-------|--------|
| ⏮ | Parada anterior |
| ⏪15 | Retroceder 15s |
| ▶/⏸ | Play / Pause |
| ⏩15 | Avanzar 15s |
| ⏭ | Siguiente parada |

**Widgets FAB** (al tocar +):
| Widget | Acción |
|--------|--------|
| ❓ FAQ | Preguntas frecuentes (no implementado) |
| 💡 Sugerir | Enviar sugerencia (no implementado) |
| 💬 Bot | Abrir chat IA |

**Al terminar una parada:**
```
onEnded → markStopCompleted(stopId)
       → auto next (onNext)
       → Si es última parada → muestra "Fin del tour"
```

### MiniPlayer (barra flotante inferior)

Cuando hay audio reproduciéndose, aparece una barra fija en el footer:

```
┌─────────────────────────────────┐
│ [▶] Fortaleza del Sol  ████  1:23/5:30 │
└─────────────────────────────────┘
```

- Persiste entre rutas (splash, player, login)
- Muestra stop actual, progreso y controls
- Tap en barra → seek
- Tap en play/pause → toggle

---

## 4. Chat IA — Rimay IA

### Acceso

Desde cualquier pantalla vía `ChatButton` (FAB fijo) o desde el widget del Player.

### Pantalla de Chat

```
┌─────────────────────────────┐
│ [💬] Rimay IA   [🟢] Conectado  [🗑] [✕] │
├─────────────────────────────┤
│                             │
│  Preguntas sugeridas:       │
│  [¿Qué es esta parada?]     │
│  [Contame sobre los Incas]  │
│  [¿Qué significa...?]      │
│  [¿Qué más puedo ver?]      │
│                             │
│  ┌─────────────────────┐    │
│  │ Rimay IA            │    │
│  │ ¡Hola! Soy tu guía  │    │
│  │ virtual...           │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ Tú                  │    │
│  │ ¿Qué es Sacsayhuamán?│   │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ Rimay IA            │    │
│  │ Sacsayhuamán es...  │    │
│  └─────────────────────┘    │
│                      ↓     │
│                             │
│ ────────────────────────── │
│ [Pregúntale a Rimay IA...] [➤] │
└─────────────────────────────┘
```

**Comportamiento híbrido online/offline:**

```
sendMessage()
  │
  ├─ Online (navigator.onLine)
  │    └─ Gemini API → buildSystemPrompt(currentStop, cultural context)
  │         └─ Streaming response → chatStore.streamingContent
  │              └─ Feedback (👍/👎) → updateFeedback()
  │
  └─ Offline
       └─ Fuse.js fuzzy search → KNOWLEDGE_BASE (16 items culturales)
            └─ Resultados rankeados por score de matching
```

**Base de conocimiento offline (16 items):**
- Sacsayhuamán, Imperio Inca, Arquitectura Inca
- Cosmovisión Andina, Pachamama, Inti Raymi
- Idioma Quechua, Hoja de Coca
- Cusco, Apus, Chicha de Jora
- El Puma, Qhapaq Ñan, Coricancha
- Machu Picchu, Sistema de Ceques, Mita, Quipus

**Persistencia:** mensajes guardados en `localStorage` (clave: `rimay-chat`), recargados al volver.

---

## 5. Mapa y Ubicación — LocationModal

### Acceso

Botón "📍 Ver ubicación" desde SplashScreen.

### Pantalla

```
┌─────────────────────────────┐
│         ───────             │ ← Handle
│  [🧭] Mapa del tour [🟢GPS]│
├─────────────────────────────┤
│                             │
│     ┌───────────────┐       │
│     │               │       │
│     │  MAPBOX GL    │       │
│     │  Satellite    │       │
│     │  streets v12  │       │
│     │  45° pitch    │       │
│     │               │       │ ← Edificios 3D
│     │  ● POI marker │       │    (fill-extrusion)
│     │  🔵 User dot  │       │
│     │  ○ Accuracy   │       │
│     │               │       │
│     └───────────────┘       │
│                             │
│  [📍 Activar GPS]           │ ← Si GPS no activo
│  [📍 Simular ubicación]     │ ← Para testing
│                             │
│  ─── Paradas (9) ────────  │
│  🟡 Murallas Ciclópeas 4:00│
│  ○ Torreón Muyucmarca  6:00│
│  ...                       │
│                             │
│  ─── Puntos de interés ─── │
│  🟫 Coricancha             │
│  🟦 Plaza de Armas         │
│  🟧 Qenqo                  │
│  ...                       │
└─────────────────────────────┘
```

**Geofencing automático:**
```
watchPosition (cada 5s, alta precisión)
  │
  ├─ Haversine a cada stop
  │    └─ ≤ 25m → onEnterStop(stopId)
  │         └─ Si es diferente stop activo:
  │              └─ navigate(/player?stopId=...)
  │
  └─ Update user marker + accuracy circle en mapa
```

**POI Popup (al clickear marcador):**
```
┌─────────────────────┐
│ 🏛️ Coricancha       │
│ El templo más...    │
│ templo              │
│                     │
│ [🖼️ Ver en 3D]      │
└─────────────────────┘
```

### Visor 3D (SiteViewer3D)

Al tocar "Ver en 3D" se abre un Sheet lateral:

```
┌─────────────────────┐
│ [✕]                 │
│                     │
│   ┌───────────┐     │
│   │           │     │
│   │  MODELO   │     │ ← Three.js Canvas
│   │  3D       │     │    (procedural o GLB)
│   │           │     │
│   │  ● Hotspot│     │ ← Puntos interactivos
│   │           │     │
│   └───────────┘     │
│                     │
│ [▶] ████████ 1:23  │ ← Audio integrado
│                     │
│ Coricancha          │
│ El templo del...    │
│ templo              │
│                     │
│ Arrastra para       │
│ rotar · Scroll zoom │
└─────────────────────┘
```

**Modelos 3D por categoría:**

| Categoría | Modelo | Textura |
|-----------|--------|---------|
| Templo | Pirámide escalonada + columnas trapezoidales | Stone procedural + bump map |
| Fortaleza | Muros zigzag + torres circulares | Stone procedural + bump map |
| Santuario | Roca deformada + altar | Stone procedural + bump map |
| Mirador | Torre escalonada 4 niveles | Stone procedural + bump map |
| Plaza | Plataforma + mojones | Stone procedural + bump map |
| Tour Stop | Cono marcador + cartel | Stone procedural + bump map |
| Coricancha | GLB real (4.6MB) | Texturas originales |

**Hotspots interactivos:** 30+ puntos con:
- Anillo pulsante animado
- Label flotante
- Tooltip con descripción histórica al click
- Categorizados por tipo de sitio

---

## 6. Lista de Paradas — TourStopsList

### Acceso

Desde el Player, tap en "Siguiente: X" o en el botón de lista.

### Pantalla

```
┌─────────────────────────────┐
│         ───────             │
│                             │
│  Sacsayhuamán              │
│  9 paradas · 45 min        │
│                             │
│  │ ● Murallas Ciclópeas 4:00│ ← Completada ✓
│  │                         │
│  │ ● Torreón Muyucmarca 6:00│ ← Completada ✓
│  │                         │
│  │ ▶ Sacsayhuamán...  5:30 │ ← Actual 🟡
│  │   Fortaleza del Sol     │
│  │                         │
│  │ ○ Plaza del Inca   5:00 │ ← Futura
│  │                         │
│  │ ○ Templo de la Luna 7:00│
│  │   ...                   │
│                             │
│  [ Cerrar ]                 │
└─────────────────────────────┘
```

**Estados visuales:**
| Estado | Indicador |
|--------|-----------|
| ✅ Completada | Check verde + nombre tachado |
| ▶ Actual | Número en neon + barra lateral + pulso |
| ○ Futura | Número gris + opacidad reducida |

---

## 7. Cierre de Sesión

Desde cualquier pantalla, botón de logout (top-right):

```
Click → Alert dialog:
  "¿Estás seguro de que querés cerrar sesión?"
  [Cancelar] [Cerrar sesión]
  → logout() → navigate(/login)
```

---

## Resumen de Rutas

| Ruta | Componente | Auth | Props |
|------|-----------|------|-------|
| `/` | SplashRoute | ✅ | tourName, stops, currentStop, handlers |
| `/login` | LoginRoute | ❌ | onLogin, onSignUp, isSignUpMode |
| `/player` | PlayerRoute | ✅ | stopId (query param) |
| `/tour/:slug` | TourRoute | ✅ | slug (redirect a `/`) |
| `*` | NotFoundScreen | ❌ | — |

## Componentes Globales

| Componente | Posición | Condición |
|-----------|----------|-----------|
| `OfflineToast` | Top | Cuando `!navigator.onLine` |
| `LogoutButton` | Top-right | Cuando `isAuthenticated` |
| `ChatButton` | Fixed bottom-right | Siempre visible |
| `ChatPanel` | Full-screen overlay | Cuando `chatStore.isOpen` |
| `MiniPlayer` | Fixed bottom | Cuando `audioStore.isPlaying` |
