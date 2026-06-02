-- ============================================================
-- Rimay Guide — Schema + Seed completo
-- Ejecutar en: SQL Editor de Supabase Dashboard
-- ============================================================

-- 1. Tabla de tours
CREATE TABLE IF NOT EXISTS public.tours (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  total_duration_minutes INTEGER DEFAULT 45,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de paradas del tour
CREATE TABLE IF NOT EXISTS public.tour_stops (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tour_id         UUID REFERENCES public.tours(id) ON DELETE CASCADE,
  "order"         INTEGER NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  latitude        DECIMAL(10, 7) NOT NULL,
  longitude       DECIMAL(10, 7) NOT NULL,
  radius_meters   INTEGER DEFAULT 15,
  audio_src       TEXT,
  duration_seconds INTEGER DEFAULT 180,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de progreso del usuario
CREATE TABLE IF NOT EXISTS public.user_progress (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tour_id     UUID REFERENCES public.tours(id) ON DELETE CASCADE,
  stop_id     UUID REFERENCES public.tour_stops(id) ON DELETE CASCADE,
  completed   BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, tour_id, stop_id)
);

-- 4. Tabla de traducciones
CREATE TABLE IF NOT EXISTS public.translations (
  id          SERIAL PRIMARY KEY,
  namespace   TEXT NOT NULL,
  key         TEXT NOT NULL,
  value       TEXT NOT NULL,
  lang        TEXT NOT NULL DEFAULT 'es',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(namespace, key, lang)
);

-- 5. Tabla de sesiones de chat
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tour_id    UUID REFERENCES public.tours(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tour_id)
);

-- 6. Tabla de mensajes de chat
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id         TEXT PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content    TEXT NOT NULL,
  feedback   INTEGER CHECK (feedback IS NULL OR feedback IN (1, -1)),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id
  ON public.chat_messages(session_id);

-- RLS: chat_sessions
DROP POLICY IF EXISTS "Users can view own chat sessions" ON public.chat_sessions;
CREATE POLICY "Users can view own chat sessions"
  ON public.chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own chat sessions" ON public.chat_sessions;
CREATE POLICY "Users can insert own chat sessions"
  ON public.chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own chat sessions" ON public.chat_sessions;
CREATE POLICY "Users can update own chat sessions"
  ON public.chat_sessions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own chat sessions" ON public.chat_sessions;
CREATE POLICY "Users can delete own chat sessions"
  ON public.chat_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS: chat_messages
DROP POLICY IF EXISTS "Users can view own chat messages" ON public.chat_messages;
CREATE POLICY "Users can view own chat messages"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own chat messages" ON public.chat_messages;
CREATE POLICY "Users can insert own chat messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own chat messages" ON public.chat_messages;
CREATE POLICY "Users can update own chat messages"
  ON public.chat_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own chat messages" ON public.chat_messages;
CREATE POLICY "Users can delete own chat messages"
  ON public.chat_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- ============================================================
-- Datos semilla: Sacsayhuamán
-- ============================================================

INSERT INTO public.tours (id, slug, name, description, total_duration_minutes)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'sacsayhuaman',
  'Sacsayhuamán — Fortaleza del Sol',
  'Recorré la imponente fortaleza ceremonial inca. Escuchá el Cusco como lo cuenta su gente.',
  45
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.tour_stops (id, tour_id, "order", name, description, latitude, longitude, radius_meters, audio_src, duration_seconds)
VALUES
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 1, 'Murallas Ciclópeas', 'Imponentes muros de piedra de hasta 6 metros de altura, construidos con bloques megalíticos de hasta 100 toneladas.', -13.5078, -71.9815, 15, '/voices/sacsayhuaman_es.mp3', 240),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 2, 'Torreón de Muyucmarca', 'Torre circular de origen inca. Su nombre en quechua significa "lugar redondo".', -13.5085, -71.9820, 20, '/voices/sacsayhuaman_es.mp3', 360),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 3, 'Sacsayhuamán — Fortaleza del Sol', 'El corazón del complejo. Fortaleza ceremonial dedicada al Inti (Sol).', -13.5075, -71.9825, 25, '/voices/sacsayhuaman_es.mp3', 330),
  ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000001', 4, 'Plaza del Inca', 'Espacio ceremonial con vista panorámica del Valle Sagrado.', -13.5068, -71.9830, 20, '/voices/sacsayhuaman_es.mp3', 300),
  ('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000001', 5, 'Templo de la Luna', 'Estructura ceremonial dedicada a Quilla, la diosa Luna.', -13.5060, -71.9820, 25, '/voices/sacsayhuaman_es.mp3', 420),
  ('00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000001', 6, 'Túneles Subterráneos', 'Red de pasajes que conectan diferentes partes del complejo.', -13.5065, -71.9805, 20, '/voices/sacsayhuaman_es.mp3', 480),
  ('00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000001', 7, 'Mirador Panorámico', 'Punto más alto del recorrido con vista de 360° del Valle Sagrado.', -13.5070, -71.9795, 20, '/voices/sacsayhuaman_es.mp3', 270),
  ('00000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000001', 8, 'Roca Sagrada', 'Formación rocosa ceremonial tallada por los incas.', -13.5075, -71.9790, 15, '/voices/sacsayhuaman_es.mp3', 180),
  ('00000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000000001', 9, 'Altar Ceremonial', 'Plataforma ceremonial donde se realizaban ofrendas a la Pachamama.', -13.5080, -71.9800, 15, '/voices/sacsayhuaman_es.mp3', 300)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed: Traducciones
-- ============================================================

INSERT INTO public.translations (namespace, key, value, lang) VALUES
  ('common', 'close', 'Cerrar', 'es'),
  ('common', 'loading', 'Cargando...', 'es'),
  ('common', 'error', 'Error', 'es'),
  ('download', 'button', 'Descargar ahora', 'es'),
  ('download', 'keepOpen', 'Mantené esta pantalla abierta durante la descarga', 'es'),
  ('download', 'aria', 'Descargar tour', 'es'),
  ('download', 'title', 'Descarga el tour antes de llegar', 'es'),
  ('loadMap', 'loading', 'Cargando mapa...', 'es'),
  ('location', 'orSimulate', 'O simulá una ubicación de prueba:', 'es'),
  ('location', 'gpsActive', 'GPS activo', 'es'),
  ('location', 'pois', 'Puntos de interés', 'es'),
  ('location', 'tourStops', 'Paradas del tour', 'es'),
  ('location', 'outOfRange', 'fuera de rango', 'es'),
  ('location', 'activateGps', 'Activar GPS', 'es'),
  ('location', 'enableGps', 'Activá tu ubicación para verte en el mapa', 'es'),
  ('location', 'title', 'Mapa del tour', 'es'),
  ('location', 'inRange', 'EN RANGO', 'es'),
  ('login', 'title', 'Bienvenido', 'es'),
  ('login', 'subtitle', 'Escuchá el Cusco como lo cuenta su gente', 'es'),
  ('login', 'email', 'Correo electrónico', 'es'),
  ('login', 'emailPlaceholder', 'tu@email.com', 'es'),
  ('login', 'password', 'Contraseña', 'es'),
  ('login', 'continue', 'Continuar', 'es'),
  ('login', 'loggingIn', 'Ingresando...', 'es'),
  ('login', 'noAccount', '¿No tenés cuenta?', 'es'),
  ('login', 'signUp', 'Registrate', 'es'),
  ('login', 'or', 'o', 'es'),
  ('offline', 'mode', 'Sin conexión — modo offline', 'es'),
  ('offline', 'restored', 'Conexión restablecida', 'es'),
  ('player', 'next', 'Siguiente: {{name}}', 'es'),
  ('player', 'back', 'Volver', 'es'),
  ('player', 'offline', 'Sin conexión', 'es'),
  ('player', 'endOfTour', 'Fin del tour', 'es'),
  ('player', 'faq', 'FAQ', 'es'),
  ('player', 'suggest', 'Sugerir', 'es'),
  ('player', 'bot', 'Bot', 'es'),
  ('player', 'playing', 'Reproduciendo', 'es'),
  ('pwa', 'title', 'Guarda Rimay en tu pantalla de inicio', 'es'),
  ('pwa', 'subtitle', 'Accede sin abrir el navegador. Tu tour queda guardado.', 'es'),
  ('pwa', 'iosInstructions', 'Toca', 'es'),
  ('pwa', 'androidInstructions', 'Toca ⋮ → "Agregar a pantalla de inicio"', 'es'),
  ('pwa', 'addToHome', '"Agregar a pantalla de inicio"', 'es'),
  ('pwa', 'gotIt', 'Entendido', 'es'),
  ('pwa', 'notNow', 'Ahora no', 'es'),
  ('pwa', 'aria', 'Agregar a pantalla de inicio', 'es'),
  ('splash', 'stops', 'Tour de {{count}} paradas', 'es'),
  ('splash', 'duration', '{{min}} min aprox.', 'es'),
  ('splash', 'start', 'Iniciar narración', 'es'),
  ('splash', 'viewLocation', 'Ver ubicación', 'es'),
  ('splash', 'viewStops', 'Ver todas las paradas', 'es'),
  ('splash', 'tourStopsTitle', 'Paradas del tour', 'es')
ON CONFLICT (namespace, key, lang) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO public.translations (namespace, key, value, lang) VALUES
  ('common', 'close', 'Close', 'en'),
  ('common', 'loading', 'Loading...', 'en'),
  ('common', 'error', 'Error', 'en'),
  ('download', 'button', 'Download now', 'en'),
  ('download', 'keepOpen', 'Keep this screen open during download', 'en'),
  ('download', 'aria', 'Download tour', 'en'),
  ('download', 'title', 'Download the tour before you arrive', 'en'),
  ('loadMap', 'loading', 'Loading map...', 'en'),
  ('location', 'orSimulate', 'Or simulate a test location:', 'en'),
  ('location', 'gpsActive', 'GPS active', 'en'),
  ('location', 'pois', 'Points of interest', 'en'),
  ('location', 'tourStops', 'Tour stops', 'en'),
  ('location', 'outOfRange', 'out of range', 'en'),
  ('location', 'activateGps', 'Activate GPS', 'en'),
  ('location', 'enableGps', 'Enable your location to see yourself on the map', 'en'),
  ('location', 'title', 'Tour map', 'en'),
  ('location', 'inRange', 'IN RANGE', 'en'),
  ('login', 'title', 'Welcome', 'en'),
  ('login', 'subtitle', 'Listen to Cusco as told by its people', 'en'),
  ('login', 'email', 'Email', 'en'),
  ('login', 'emailPlaceholder', 'you@email.com', 'en'),
  ('login', 'password', 'Password', 'en'),
  ('login', 'continue', 'Continue', 'en'),
  ('login', 'loggingIn', 'Signing in...', 'en'),
  ('login', 'noAccount', 'Don''t have an account?', 'en'),
  ('login', 'signUp', 'Sign up', 'en'),
  ('login', 'or', 'or', 'en'),
  ('offline', 'mode', 'Offline mode', 'en'),
  ('offline', 'restored', 'Connection restored', 'en'),
  ('player', 'next', 'Next: {{name}}', 'en'),
  ('player', 'back', 'Back', 'en'),
  ('player', 'offline', 'Offline', 'en'),
  ('player', 'endOfTour', 'End of tour', 'en'),
  ('player', 'faq', 'FAQ', 'en'),
  ('player', 'suggest', 'Suggest', 'en'),
  ('player', 'bot', 'Bot', 'en'),
  ('player', 'playing', 'Playing', 'en'),
  ('pwa', 'title', 'Save Rimay to your home screen', 'en'),
  ('pwa', 'subtitle', 'Access without opening the browser. Your tour is saved.', 'en'),
  ('pwa', 'iosInstructions', 'Tap', 'en'),
  ('pwa', 'androidInstructions', 'Tap ⋮ → "Add to home screen"', 'en'),
  ('pwa', 'addToHome', '"Add to home screen"', 'en'),
  ('pwa', 'gotIt', 'Got it', 'en'),
  ('pwa', 'notNow', 'Not now', 'en'),
  ('pwa', 'aria', 'Add to home screen', 'en'),
  ('splash', 'stops', '{{count}}-stop tour', 'en'),
  ('splash', 'duration', '~{{min}} min', 'en'),
  ('splash', 'start', 'Start tour', 'en'),
  ('splash', 'viewLocation', 'View location', 'en'),
  ('splash', 'viewStops', 'View all stops', 'en'),
  ('splash', 'tourStopsTitle', 'Tour stops', 'en')
ON CONFLICT (namespace, key, lang) DO UPDATE SET value = EXCLUDED.value;

-- ============================================================
-- Políticas RLS (Row Level Security)
-- ============================================================

-- Tours: lectura pública
DROP POLICY IF EXISTS "Tours are viewable by everyone" ON public.tours;
CREATE POLICY "Tours are viewable by everyone"
  ON public.tours FOR SELECT USING (true);

-- Tour stops: lectura pública
DROP POLICY IF EXISTS "Tour stops are viewable by everyone" ON public.tour_stops;
CREATE POLICY "Tour stops are viewable by everyone"
  ON public.tour_stops FOR SELECT USING (true);

-- Translations: lectura pública
DROP POLICY IF EXISTS "Translations are viewable by everyone" ON public.translations;
CREATE POLICY "Translations are viewable by everyone"
  ON public.translations FOR SELECT USING (true);

-- User progress: cada usuario ve solo su progreso
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
CREATE POLICY "Users can insert own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
CREATE POLICY "Users can update own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- Usuario de prueba
-- ============================================================
-- Crear manualmente desde Supabase Dashboard:
--   Authentication → Users → Add user
--   Email:    turista@rimay.pe
--   Password: Rimay2025!
--   ✓ Auto Confirm User
