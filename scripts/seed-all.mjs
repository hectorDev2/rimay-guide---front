/**
 * Seed completo para Rimay Guide.
 * Puebla traducciones y usuario de prueba en Supabase.
 *
 * Uso:  node scripts/seed-all.mjs
 * Requiere: VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env');
const env = loadEnv(envPath);

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Falta VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env');
  process.exit(1);
}

// Usamos service role para bypass RLS
const supabase = createClient(supabaseUrl, serviceRoleKey);

// ---- Traducciones ----
const TRANSLATIONS = [
  // ES
  { namespace: 'common', key: 'close', value: 'Cerrar', lang: 'es' },
  { namespace: 'common', key: 'loading', value: 'Cargando...', lang: 'es' },
  { namespace: 'common', key: 'error', value: 'Error', lang: 'es' },
  { namespace: 'download', key: 'button', value: 'Descargar ahora', lang: 'es' },
  { namespace: 'download', key: 'keepOpen', value: 'Mantené esta pantalla abierta durante la descarga', lang: 'es' },
  { namespace: 'download', key: 'aria', value: 'Descargar tour', lang: 'es' },
  { namespace: 'download', key: 'title', value: 'Descarga el tour antes de llegar', lang: 'es' },
  { namespace: 'loadMap', key: 'loading', value: 'Cargando mapa...', lang: 'es' },
  { namespace: 'location', key: 'orSimulate', value: 'O simulá una ubicación de prueba:', lang: 'es' },
  { namespace: 'location', key: 'gpsActive', value: 'GPS activo', lang: 'es' },
  { namespace: 'location', key: 'pois', value: 'Puntos de interés', lang: 'es' },
  { namespace: 'location', key: 'tourStops', value: 'Paradas del tour', lang: 'es' },
  { namespace: 'location', key: 'outOfRange', value: 'fuera de rango', lang: 'es' },
  { namespace: 'location', key: 'activateGps', value: 'Activar GPS', lang: 'es' },
  { namespace: 'location', key: 'enableGps', value: 'Activá tu ubicación para verte en el mapa', lang: 'es' },
  { namespace: 'location', key: 'title', value: 'Mapa del tour', lang: 'es' },
  { namespace: 'location', key: 'inRange', value: 'EN RANGO', lang: 'es' },
  { namespace: 'login', key: 'title', value: 'Bienvenido', lang: 'es' },
  { namespace: 'login', key: 'subtitle', value: 'Escuchá el Cusco como lo cuenta su gente', lang: 'es' },
  { namespace: 'login', key: 'email', value: 'Correo electrónico', lang: 'es' },
  { namespace: 'login', key: 'emailPlaceholder', value: 'tu@email.com', lang: 'es' },
  { namespace: 'login', key: 'password', value: 'Contraseña', lang: 'es' },
  { namespace: 'login', key: 'continue', value: 'Continuar', lang: 'es' },
  { namespace: 'login', key: 'loggingIn', value: 'Ingresando...', lang: 'es' },
  { namespace: 'login', key: 'noAccount', value: '¿No tenés cuenta?', lang: 'es' },
  { namespace: 'login', key: 'signUp', value: 'Registrate', lang: 'es' },
  { namespace: 'login', key: 'or', value: 'o', lang: 'es' },
  { namespace: 'offline', key: 'mode', value: 'Sin conexión — modo offline', lang: 'es' },
  { namespace: 'offline', key: 'restored', value: 'Conexión restablecida', lang: 'es' },
  { namespace: 'player', key: 'next', value: 'Siguiente: {{name}}', lang: 'es' },
  { namespace: 'player', key: 'back', value: 'Volver', lang: 'es' },
  { namespace: 'player', key: 'offline', value: 'Sin conexión', lang: 'es' },
  { namespace: 'player', key: 'endOfTour', value: 'Fin del tour', lang: 'es' },
  { namespace: 'player', key: 'faq', value: 'FAQ', lang: 'es' },
  { namespace: 'player', key: 'suggest', value: 'Sugerir', lang: 'es' },
  { namespace: 'player', key: 'bot', value: 'Bot', lang: 'es' },
  { namespace: 'player', key: 'playing', value: 'Reproduciendo', lang: 'es' },
  { namespace: 'pwa', key: 'title', value: 'Guarda Rimay en tu pantalla de inicio', lang: 'es' },
  { namespace: 'pwa', key: 'subtitle', value: 'Accede sin abrir el navegador. Tu tour queda guardado.', lang: 'es' },
  { namespace: 'pwa', key: 'iosInstructions', value: 'Toca', lang: 'es' },
  { namespace: 'pwa', key: 'androidInstructions', value: 'Toca ⋮ → "Agregar a pantalla de inicio"', lang: 'es' },
  { namespace: 'pwa', key: 'addToHome', value: '"Agregar a pantalla de inicio"', lang: 'es' },
  { namespace: 'pwa', key: 'gotIt', value: 'Entendido', lang: 'es' },
  { namespace: 'pwa', key: 'notNow', value: 'Ahora no', lang: 'es' },
  { namespace: 'pwa', key: 'aria', value: 'Agregar a pantalla de inicio', lang: 'es' },
  { namespace: 'splash', key: 'stops', value: 'Tour de {{count}} paradas', lang: 'es' },
  { namespace: 'splash', key: 'duration', value: '{{min}} min aprox.', lang: 'es' },
  { namespace: 'splash', key: 'start', value: 'Iniciar narración', lang: 'es' },
  { namespace: 'splash', key: 'viewLocation', value: 'Ver ubicación', lang: 'es' },
  { namespace: 'splash', key: 'viewStops', value: 'Ver todas las paradas', lang: 'es' },
  { namespace: 'splash', key: 'tourStopsTitle', value: 'Paradas del tour', lang: 'es' },
  // EN
  { namespace: 'common', key: 'close', value: 'Close', lang: 'en' },
  { namespace: 'common', key: 'loading', value: 'Loading...', lang: 'en' },
  { namespace: 'common', key: 'error', value: 'Error', lang: 'en' },
  { namespace: 'download', key: 'button', value: 'Download now', lang: 'en' },
  { namespace: 'download', key: 'keepOpen', value: 'Keep this screen open during download', lang: 'en' },
  { namespace: 'download', key: 'aria', value: 'Download tour', lang: 'en' },
  { namespace: 'download', key: 'title', value: 'Download the tour before you arrive', lang: 'en' },
  { namespace: 'loadMap', key: 'loading', value: 'Loading map...', lang: 'en' },
  { namespace: 'location', key: 'orSimulate', value: 'Or simulate a test location:', lang: 'en' },
  { namespace: 'location', key: 'gpsActive', value: 'GPS active', lang: 'en' },
  { namespace: 'location', key: 'pois', value: 'Points of interest', lang: 'en' },
  { namespace: 'location', key: 'tourStops', value: 'Tour stops', lang: 'en' },
  { namespace: 'location', key: 'outOfRange', value: 'out of range', lang: 'en' },
  { namespace: 'location', key: 'activateGps', value: 'Activate GPS', lang: 'en' },
  { namespace: 'location', key: 'enableGps', value: 'Enable your location to see yourself on the map', lang: 'en' },
  { namespace: 'location', key: 'title', value: 'Tour map', lang: 'en' },
  { namespace: 'location', key: 'inRange', value: 'IN RANGE', lang: 'en' },
  { namespace: 'login', key: 'title', value: 'Welcome', lang: 'en' },
  { namespace: 'login', key: 'subtitle', value: 'Listen to Cusco as told by its people', lang: 'en' },
  { namespace: 'login', key: 'email', value: 'Email', lang: 'en' },
  { namespace: 'login', key: 'emailPlaceholder', value: 'you@email.com', lang: 'en' },
  { namespace: 'login', key: 'password', value: 'Password', lang: 'en' },
  { namespace: 'login', key: 'continue', value: 'Continue', lang: 'en' },
  { namespace: 'login', key: 'loggingIn', value: 'Signing in...', lang: 'en' },
  { namespace: 'login', key: 'noAccount', value: "Don't have an account?", lang: 'en' },
  { namespace: 'login', key: 'signUp', value: 'Sign up', lang: 'en' },
  { namespace: 'login', key: 'or', value: 'or', lang: 'en' },
  { namespace: 'offline', key: 'mode', value: 'Offline mode', lang: 'en' },
  { namespace: 'offline', key: 'restored', value: 'Connection restored', lang: 'en' },
  { namespace: 'player', key: 'next', value: 'Next: {{name}}', lang: 'en' },
  { namespace: 'player', key: 'back', value: 'Back', lang: 'en' },
  { namespace: 'player', key: 'offline', value: 'Offline', lang: 'en' },
  { namespace: 'player', key: 'endOfTour', value: 'End of tour', lang: 'en' },
  { namespace: 'player', key: 'faq', value: 'FAQ', lang: 'en' },
  { namespace: 'player', key: 'suggest', value: 'Suggest', lang: 'en' },
  { namespace: 'player', key: 'bot', value: 'Bot', lang: 'en' },
  { namespace: 'player', key: 'playing', value: 'Playing', lang: 'en' },
  { namespace: 'pwa', key: 'title', value: 'Save Rimay to your home screen', lang: 'en' },
  { namespace: 'pwa', key: 'subtitle', value: 'Access without opening the browser. Your tour is saved.', lang: 'en' },
  { namespace: 'pwa', key: 'iosInstructions', value: 'Tap', lang: 'en' },
  { namespace: 'pwa', key: 'androidInstructions', value: 'Tap ⋮ → "Add to home screen"', lang: 'en' },
  { namespace: 'pwa', key: 'addToHome', value: '"Add to home screen"', lang: 'en' },
  { namespace: 'pwa', key: 'gotIt', value: 'Got it', lang: 'en' },
  { namespace: 'pwa', key: 'notNow', value: 'Not now', lang: 'en' },
  { namespace: 'pwa', key: 'aria', value: 'Add to home screen', lang: 'en' },
  { namespace: 'splash', key: 'stops', value: '{{count}}-stop tour', lang: 'en' },
  { namespace: 'splash', key: 'duration', value: '~{{min}} min', lang: 'en' },
  { namespace: 'splash', key: 'start', value: 'Start tour', lang: 'en' },
  { namespace: 'splash', key: 'viewLocation', value: 'View location', lang: 'en' },
  { namespace: 'splash', key: 'viewStops', value: 'View all stops', lang: 'en' },
  { namespace: 'splash', key: 'tourStopsTitle', value: 'Tour stops', lang: 'en' },
];

async function seed() {
  const email = 'turista@rimay.pe';
  const password = 'Rimay2025!';

  console.log('🚀 Seed Rimay Guide');
  console.log('');

  // ---- 1. Traducciones ----
  console.log('📝 Sembrando traducciones...');
  const { error: tError } = await supabase.from('translations').upsert(TRANSLATIONS, {
    onConflict: 'namespace,key,lang',
    ignoreDuplicates: false,
  });
  if (tError) {
    console.error(`   ❌ ${tError.message}`);
  } else {
    console.log(`   ✅ ${TRANSLATIONS.length} traducciones insertadas`);
  }

  // ---- 2. Usuario de prueba ----
  console.log('');
  console.log('👤 Creando usuario de prueba...');
  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = String(data.message || data.msg || '');
    if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exists') || msg.toLowerCase().includes('duplicate')) {
      console.log('   ✅ El usuario ya existe.');
    } else {
      console.error('   ❌ Error:', JSON.stringify(data, null, 2));
    }
  } else {
    console.log(`   ✅ ${email} / ${password}`);
  }

  // ---- Resumen ----
  console.log('');
  console.log('✅ Seed completo.');
}

seed().catch((err) => {
  console.error('❌', err);
  process.exit(1);
});

function loadEnv(path) {
  const content = readFileSync(path, 'utf-8');
  const result = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    result[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return result;
}
