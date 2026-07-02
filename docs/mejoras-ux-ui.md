# Rimay Guide — Propuesta de Mejoras UX/UI

> Una guía de audio para Cusco merece una experiencia tan rica como el lugar que describe. Esta propuesta no busca rediseñar por diseñar: cada cambio apunta a reducir fricción, aumentar presencia y hacer que el usuario llegue al audio más rápido.

---

## Principios que guían esta propuesta

**Presencia sobre interfaz.** El objetivo de la app es que el usuario escuche mientras camina, no que mire la pantalla. Cada pantalla debería requerir el mínimo de atención visual posible.

**Andino, no genérico.** La app vive en Cusco y habla de cultura inca. La identidad visual debería reflejarlo sin caer en el cliché del sol dorado. Hay una oportunidad real de crear un lenguaje visual propio.

**Offline first, siempre.** El usuario está en una fortaleza de piedra sin señal. La app tiene que comunicar en todo momento si está online u offline, y qué funcionalidades cambian.

---

## Sistema de diseño propuesto

### Paleta

| Nombre | Hex | Uso |
|--------|-----|-----|
| Piedra | `#2C2A25` | Fondo principal |
| Tierra | `#8B6E52` | Acentos secundarios, bordes |
| Oro Inca | `#D4A843` | CTA principal, stop activa, progreso |
| Niebla | `#F0EDE8` | Texto principal |
| Kañiwa | `#6B5B4E` | Texto secundario, subtítulos |
| Cielo Andino | `#4A7FA5` | GPS activo, links, estados online |

Fondo oscuro tierra + texto crema + un solo acento dorado. No hay colores de marca por defecto (azul Material, verde iOS). Esta paleta es exclusivamente esta app.

### Tipografía

- **Display:** Playfair Display Italic — para nombres de sitios y títulos de paradas. Evoca antigüedad sin ser kitsch.
- **Body:** Inter 400/500 — neutral, legible en movimiento, ideal para instrucciones y UI.
- **Data:** JetBrains Mono — tiempos de audio, coordenadas, progreso numérico. Da carácter técnico a los datos.

### Elemento firma

**Líneas de ceque.** El sistema de ceques era la red de líneas sagradas que irradiaban desde el Coricancha. Se usa como motivo gráfico sutil: líneas delgadas que convergen desde el centro en backgrounds, separadores y el ícono de la app. No decorativo — conceptualmente correcto.

---

## Pantalla a pantalla

---

### 1. Login

**Problema actual:** Formulario genérico. Podría ser cualquier app.

**Propuesta:**

El hero no es solo una imagen de fondo con opacidad: es un video loop corto (5s, sin sonido, ~800KB comprimido) de las murallas ciclópeas al amanecer, con niebla. Cuando el usuario toca el campo de email, el video pausa y el overlay sube suavemente a 70% de opacidad para dar contraste al formulario.

El título cambia de "Bienvenido" a:

```
Rimay
— Habla, en quechua —
Escuchá el Cusco
```

El botón "Continuar" se convierte en un botón full-width con texto "Entrar al tour" (más directo, más del dominio de la app).

Los botones de Google/Apple se mantienen pero con fondo `Tierra` y borde `Oro Inca`, no el estilo blanco genérico.

**Micro-mejora de error:** En vez de un toast rojo genérico, el mensaje de error aparece inline bajo el campo afectado en texto pequeño `Niebla` con ícono de advertencia. Menos disruptivo.

---

### 2. SplashScreen (pantalla principal)

**Problema actual:** Tres CTAs apiladas verticalmente compiten entre sí. El usuario no sabe qué hacer primero.

**Jerarquía propuesta — una sola acción principal:**

```
┌─────────────────────────────┐
│  [ES/EN]         [salir]    │
│                             │
│   ── video/imagen hero ──   │
│   Sacsayhuamán              │
│   Fortaleza del Sol         │
│   9 paradas · 45 min        │
│                             │
│   ████████████████  [▶]    │ ← CTA único, full width
│   Iniciar tour              │
│                             │
│  ─── Paradas ──────────     │
│  ✓ Murallas Ciclópeas  4'  │
│  ✓ Torreón Muyucmarca  6'  │
│  ▶ Fortaleza del Sol   5'  │ ← activa
│  ○ Plaza del Inca      5'  │
│  ○ Templo de la Luna   7'  │
│  ...                       │
└─────────────────────────────┘
```

El botón "Ver ubicación" y "Guardar en inicio" se mueven a un menú secundario o al ícono de mapa (top-right). No deben competir con el CTA principal.

**Lista de paradas mejorada:**

Cada stop tiene un estado visual claro:
- Completada: check `Oro Inca` + nombre en `Kañiwa` (desaturado)
- Activa: borde lateral dorado + pulso suave + número en `Oro Inca`
- Futura: número en `Kañiwa` + opacidad 60%

La duración de cada stop va en `JetBrains Mono` para diferenciarla del nombre.

**Download Modal — mejora crítica:**

El modal actual pide descargar sin contexto de por qué importa. Propuesta:

```
┌────────────────────────────┐
│  Sin Wi-Fi en Sacsayhuamán │
│                            │
│  Descargá el tour ahora    │
│  para escucharlo sin señal │
│  cuando estés adentro.     │
│                            │
│  ████░░░░░░░░░  0%        │ ← barra de progreso real
│  5.1 MB · ~30s en Wi-Fi   │
│                            │
│  [ Descargar con Wi-Fi ]   │
│  [ Descargar igual ]       │
│  [ Ahora no ]              │
└────────────────────────────┘
```

El copy explica el *por qué* (no hay señal en las ruinas), no solo el *qué*. Dos opciones de descarga reconocen que el usuario puede querer hacerlo igual con datos móviles.

---

### 3. Player de Audio

**Problema actual:** La waveform visual de 48 barras es decorativa, no informativa. El seek bar está separado de la waveform visualmente cuando podría ser la misma cosa.

**Propuesta — waveform interactiva como seek:**

La waveform es el seek bar. Las barras a la izquierda del cursor de tiempo se pintan en `Oro Inca`; las de la derecha en `Tierra`. Al hacer tap en cualquier barra, se navega a ese momento. Al arrastrar, el audio hace scrubbing.

Esto elimina el seek bar separado y hace la interfaz más compacta.

```
┌─────────────────────────────┐
│  [←]            [🟢 GPS]   │
│                             │
│  Parada 3                   │
│  Fortaleza del Sol          │
│  Sacsayhuamán               │
│                             │
│  ████████████░░░░░░░░░░░░   │ ← waveform = seek
│  1:23                  5:30 │
│                             │
│   [⏮]  [⏪15]  [▶]  [⏩15]  [⏭]  │
│                             │
│  ┌──────────────────────┐   │
│  │ ▷ Siguiente          │   │
│  │   Mirador del Sol    │   │
│  └──────────────────────┘   │
│                             │
│                      [+]    │
└─────────────────────────────┘
```

**FAB (+) mejorado:**

En lugar de abrirse como lista vertical, los widgets se despliegan en arco (radial menu) desde el botón. Más rápido, más elegante, menos espacio ocupado.

```
         [💬]
      [💡]   
   [❓]       [+]
```

**Al terminar una parada:**

No solo "auto-next". Mostrar por 3 segundos:

```
┌──────────────────────────┐
│  ✓ Fortaleza del Sol    │
│    completada            │
│                          │
│  Siguiente en 3s →       │
│  Mirador del Sol         │
│  [ Pausar ]              │
└──────────────────────────┘
```

El usuario puede pausar el auto-avance. Hoy no puede.

**MiniPlayer:**

El MiniPlayer actual no tiene indicación del stop completado vs. total. Propuesta:

```
┌───────────────────────────────────────┐
│ [⏸]  Fortaleza del Sol  ·  3/9  ██▌  │
└───────────────────────────────────────┘
```

`3/9` indica progreso en el tour completo. `██▌` es el progreso dentro del audio actual.

---

### 4. Chat IA

**Problema actual:** El chat se abre como pantalla full-screen. Interrumpe completamente el player. El usuario pierde el contexto de dónde está.

**Propuesta — Sheet modal en lugar de pantalla completa:**

El chat se abre como un bottom sheet que ocupa 75% de la pantalla. El player queda visible (y en pausa silenciosa) en el 25% superior. Cuando se cierra el chat, el audio continúa.

```
┌─────────────────────────────┐
│  [← Player]  Fortaleza... │ ← contexto visible
├─────────────────────────────┤
│                             │
│  [Rimay IA] ···             │
│  ¡Hola! ¿Qué querés saber  │
│  sobre Sacsayhuamán?        │
│                             │
│  [Tú]                       │
│  ¿Cuántas piedras tiene?    │
│                             │
│  [Rimay IA]                 │
│  Se estima que...           │
│                             │
│ ─────────────────────────── │
│ [Pregúntale a Rimay...]  [➤]│
└─────────────────────────────┘
```

**Preguntas sugeridas — mejora:**

Las 4 preguntas sugeridas actuales son genéricas. Propuesta: que sean contextuales a la parada activa, generadas desde el mismo sistema prompt.

En vez de `¿Qué es esta parada?` → `¿Por qué las piedras encajan sin mortero?` (específica a Sacsayhuamán).

**Estado offline más honesto:**

Cuando está offline, el chip que hoy dice "Conectado" debería decir "Modo offline — respuestas limitadas" en `Cielo Andino` con ícono de nube tachada.

---

### 5. Mapa (LocationModal)

**Problema actual:** El GPS activo vs. inactivo no tiene suficiente contraste visual. El usuario puede no saber si el geofencing está funcionando.

**Propuesta:**

Estado del GPS como pill persistente en el header:

```
[🔵 GPS activo · 15m precisión]
```

```
[⚪ GPS inactivo — tocá para activar]
```

**Geofencing — feedback anticipado:**

Cuando el usuario está a menos de 100m de una parada (pero aún no en los 25m de trigger), mostrar un aviso discreto:

```
┌──────────────────────────┐
│ 🟡 Cerca de Parada 4    │
│    Mirador del Sol · 80m │
└──────────────────────────┘
```

Esto prepara al usuario para lo que va a pasar, reduce la sorpresa de la navegación automática.

**POI Popup — mejora:**

El botón "Ver en 3D" es muy prominente para una feature secundaria. Propuesta: el popup muestra una miniatura estática del modelo 3D (screenshot precalculado), y el botón es más pequeño y discreto.

---

### 6. Lista de Paradas (TourStopsList)

**Problema actual:** La lista es plana. Todas las paradas tienen el mismo peso visual excepto por el color del indicador.

**Propuesta — agrupamiento por zona:**

Si las 9 paradas de Sacsayhuamán se agrupan geográficamente (ej: Zona Exterior, Zona Central, Zona Alta), la lista se vuelve un mapa mental además de una lista de reproducción.

```
─── Zona Exterior ──────────────
✓ Murallas Ciclópeas     4'
✓ Torreón Muyucmarca     6'

─── Zona Central ───────────────
▶ Fortaleza del Sol      5:30  ← actual
○ Plaza del Inca         5'

─── Zona Alta ──────────────────
○ Templo de la Luna      7'
○ Mirador Principal      4'
...
```

Si no hay agrupamiento geográfico real en los datos, al menos diferenciar visualmente completas / activa / pendientes con más espacio entre secciones.

---

## Flujos nuevos propuestos

### Modo "Caminando" (Hands-Free)

Un toggle en el Player activa el modo caminata:
- La pantalla baja brillo automáticamente al 20% (ahorra batería)
- Se deshabilita el tap accidental en seek
- El geofencing automático avanza al siguiente stop sin notificación interruptiva
- Se activa con "Caminando" y se desactiva tocando la pantalla dos veces seguidas

### Onboarding en contexto (no tutorial)

En lugar de un modal de tutorial al primer uso, mostrar tooltips contextuales la primera vez que el usuario llega a cada pantalla:

- Primera vez en Player → tooltip apunta al seek: "Tocá para saltar"
- Primera vez que entra al mapa → tooltip en GPS: "Activá para avanzar automáticamente"

Aparecen una sola vez, se descartan con tap, no bloquean la acción.

### Feedback al terminar el tour

Hoy el tour termina y no pasa nada especial. Propuesta de pantalla de cierre:

```
┌─────────────────────────────┐
│                             │
│         ⛰️                 │
│                             │
│  Completaste               │
│  Sacsayhuamán              │
│                             │
│  9 paradas · 45 min        │
│  de historia inca           │
│                             │
│  [ Compartir ]              │
│  [ Explorar el mapa ]       │
│  [ Volver al inicio ]       │
│                             │
└─────────────────────────────┘
```

---

## Mejoras de accesibilidad

- Todos los controles del Player tienen labels `aria-label` descriptivos (no solo iconos)
- El contraste entre `Niebla` sobre `Piedra` cumple WCAG AA (ratio ~10:1)
- El MiniPlayer tiene altura mínima de 56px para ser tapeable con el pulgar
- Los mensajes de error no dependen solo del color (incluyen ícono + texto)
- `prefers-reduced-motion`: las animaciones de waveform y pulsación de stop activa se desactivan si el usuario las tiene apagadas en el sistema

---

## Prioridades de implementación

Ordenadas por impacto vs. esfuerzo:

### Alta prioridad (bajo esfuerzo, alto impacto)

- Copy del Download Modal (por qué, no solo qué)
- Preguntas sugeridas contextuales en el Chat
- Pill de estado GPS en el Mapa
- Aviso de proximidad a 100m antes del geofencing
- Pantalla de fin de tour

### Media prioridad (esfuerzo medio, alto impacto)

- Waveform como seek bar
- Chat como bottom sheet (no pantalla completa)
- MiniPlayer con progreso `3/9`
- Pausa del auto-advance al terminar stop

### Para iterar después (esfuerzo alto, impacto medio)

- Video loop en Login
- Radial FAB menu
- Modo Caminando (hands-free)
- Agrupamiento por zona en lista de paradas
- Tooltips contextuales de onboarding

---

*Propuesta elaborada sobre el flujo documentado de Rimay Guide — Junio 2026*
