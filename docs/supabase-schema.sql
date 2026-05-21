-- ============================================================
-- Rimay Guide — Schema inicial Supabase
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
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 2, 'Torreón de Muyucmarca', 'Torre circular de origen inca. Su nombre en quechua significa "lugar redondo".', -13.5085, -71.9820, 20, '/audio/placeholder.mp3', 360),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 3, 'Sacsayhuamán — Fortaleza del Sol', 'El corazón del complejo. Fortaleza ceremonial dedicada al Inti (Sol).', -13.5075, -71.9825, 25, '/audio/placeholder.mp3', 330),
  ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000001', 4, 'Plaza del Inca', 'Espacio ceremonial con vista panorámica del Valle Sagrado.', -13.5068, -71.9830, 20, '/audio/placeholder.mp3', 300),
  ('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000001', 5, 'Templo de la Luna', 'Estructura ceremonial dedicada a Quilla, la diosa Luna.', -13.5060, -71.9820, 25, '/audio/placeholder.mp3', 420),
  ('00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000001', 6, 'Túneles Subterráneos', 'Red de pasajes que conectan diferentes partes del complejo.', -13.5065, -71.9805, 20, '/audio/placeholder.mp3', 480),
  ('00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000001', 7, 'Mirador Panorámico', 'Punto más alto del recorrido con vista de 360° del Valle Sagrado.', -13.5070, -71.9795, 20, '/audio/placeholder.mp3', 270),
  ('00000000-0000-0000-0000-000000000108', '00000000-0000-0000-0000-000000000001', 8, 'Roca Sagrada', 'Formación rocosa ceremonial tallada por los incas.', -13.5075, -71.9790, 15, '/audio/placeholder.mp3', 180),
  ('00000000-0000-0000-0000-000000000109', '00000000-0000-0000-0000-000000000001', 9, 'Altar Ceremonial', 'Plataforma ceremonial donde se realizaban ofrendas a la Pachamama.', -13.5080, -71.9800, 15, '/audio/placeholder.mp3', 300)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Políticas RLS (Row Level Security)
-- ============================================================

-- Tours: lectura pública
CREATE POLICY "Tours are viewable by everyone"
  ON public.tours FOR SELECT USING (true);

-- Tour stops: lectura pública
CREATE POLICY "Tour stops are viewable by everyone"
  ON public.tour_stops FOR SELECT USING (true);

-- User progress: cada usuario ve solo su progreso
CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

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
