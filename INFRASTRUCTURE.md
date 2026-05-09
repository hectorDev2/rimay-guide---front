# Infraestructura de la Aplicación Rimay Guide

Este documento describe la arquitectura y las tecnologías propuestas para construir la plataforma Rimay Guide, una Progressive Web App (PWA) offline-first para tours de audio guiados por geolocalización.

## 1. Flujo General del Usuario

1.  **Acceso**: El turista escanea un código QR en el sitio arqueológico (ej. Sacsayhuamán).
2.  **Redirección**: El QR lo dirige a una URL específica, como `https://rimay.guide/tour/sacsayhuaman`.
3.  **Login**: Se presenta una pantalla de inicio de sesión. Se utilizará **Supabase** para la autenticación (email/contraseña, Google, Apple).
4.  **Descarga de Contenido**: Una vez autenticado, la aplicación detecta el tour (`sacsayhuaman` en la URL) y le ofrece al usuario descargar el contenido para la experiencia offline.
5.  **Web Worker**: La descarga de archivos pesados (audios MP3) se gestionará a través de un **Web Worker** para no bloquear la interfaz de usuario. El progreso se mostrará en un modal.
6.  **Almacenamiento Offline**:
    -   **Service Worker y Cache API**: Un **Service Worker** se encargará de cachear el "App Shell" (HTML, CSS, JS) y los datos del tour descargados (JSON, imágenes, audios). Esto garantiza que la aplicación funcione sin conexión.
    -   Los archivos de audio y metadatos se almacenarán en la **Cache API**.
7.  **Inicio del Tour**: Con el contenido descargado, el usuario inicia el tour.
8.  **Geolocalización**: La aplicación utiliza la **API de Geolocalización** (`navigator.geolocation.watchPosition`) para rastrear la ubicación del usuario.
9.  **Reproducción Automática**: Cuando el usuario entra en el radio de un punto de interés (parada del tour), el audio correspondiente se reproduce automáticamente.

## 2. Arquitectura Tecnológica

### Frontend

*   **Framework**: React con Vite.
*   **Lenguaje**: TypeScript.
*   **UI**: Tailwind CSS y componentes de Radix UI / shadcn.
*   **Estado**: React Hooks (`useState`, `useContext`). Para un estado más complejo a futuro, se podría evaluar Zustand.

### Backend y Base de Datos

*   **BaaS (Backend as a Service)**: **Supabase**.
    *   **Authentication**: Gestión de usuarios (email, social logins).
    *   **Database**: PostgreSQL para almacenar información de los tours, paradas, coordenadas, y rutas de los archivos de audio.

### Funcionalidades Clave y su Implementación

#### a. Progressive Web App (PWA)

*   **Service Worker (`public/sw.js`)**:
    *   Interceptará las peticiones de red.
    *   Servirá el App Shell desde el caché para cargas instantáneas y offline.
    *   Servirá los audios y datos del tour desde el caché cuando no haya conexión.
*   **Web App Manifest (`public/manifest.json`)**:
    *   Permitirá a los usuarios "instalar" la aplicación en su pantalla de inicio para un acceso más rápido y una experiencia más nativa.

#### b. Descargas en Segundo Plano

*   **Web Worker (`src/workers/downloadWorker.ts`)**:
    *   Recibirá una lista de URLs de archivos (audios, imágenes) para descargar.
    *   Usará `fetch` para obtener los archivos.
    *   Usará la **Cache API** para almacenar las respuestas.
    *   Enviará mensajes al hilo principal para reportar el progreso de la descarga (`postMessage`).
    *   Esto es crucial para que la UI permanezca fluida mientras se descargan varios megabytes de datos.

#### c. Lógica de Geolocalización

*   **Custom Hook (`src/hooks/useGeolocation.ts`)**:
    *   Abstraerá la lógica de la API de Geolocalización.
    *   Utilizará `navigator.geolocation.watchPosition` para obtener actualizaciones continuas de la ubicación.
    *   Calculará la distancia entre la ubicación actual del usuario y las coordenadas de cada parada del tour.
    *   Cuando la distancia sea menor a un umbral definido (ej. 15 metros), notificará a la aplicación para que cambie a la parada correspondiente.

#### d. Estructura de Datos en Supabase

Se proponen las siguientes tablas:

*   **`tours`**:
    *   `id` (uuid, primary key)
    *   `slug` (text, unique) - ej: "sacsayhuaman"
    *   `name` (text) - ej: "Sacsayhuamán — Fortaleza del Sol"
    *   `description` (text)
    *   `total_duration_minutes` (integer)

*   **`tour_stops`**:
    *   `id` (uuid, primary key)
    *   `tour_id` (foreign key a `tours.id`)
    *   `order` (integer) - Para la secuencia de las paradas.
    *   `name` (text) - ej: "Murallas Ciclópeas"
    *   `latitude` (decimal)
    *   `longitude` (decimal)
    *   `radius_meters` (integer) - Radio de activación.
    *   `audio_src` (text) - URL al archivo de audio en Supabase Storage.
    *   `duration_seconds` (integer)

## 3. Estructura de Carpetas Propuesta

```
/public
  ├── sw.js               # Service Worker
  └── manifest.json       # Web App Manifest
/src
  ├── assets/
  ├── components/
  ├── hooks/
  │   └── useGeolocation.ts # Hook para manejar la ubicación
  ├── lib/
  │   └── supabaseClient.ts # Cliente y configuración de Supabase
  ├── screens/
  ├── services/
  │   └── tourService.ts    # Lógica para obtener datos de tours desde Supabase
  ├── workers/
  │   └── downloadWorker.ts # Worker para descargas
  ├── App.tsx
  └── main.tsx
```

Este enfoque modular y basado en PWA asegura una experiencia de usuario robusta, rápida y, lo más importante, funcional sin conexión a internet, lo cual es un requisito indispensable en muchos sitios turísticos.