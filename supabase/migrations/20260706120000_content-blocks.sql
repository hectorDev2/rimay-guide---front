-- Contenido dinámico por parada (ver docs/ARCHITECTURE-CONTENT.md)

-- profiles existe en la BD live (authStore); se define aquí solo para que
-- `supabase db reset` local no falle. IF NOT EXISTS la hace inocua en live.
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'user',
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 1. Registro de tipos de contenido (agregar AR/video = un INSERT)
CREATE TABLE IF NOT EXISTS public.content_types (
  slug       TEXT PRIMARY KEY,
  label      TEXT NOT NULL,
  icon       TEXT,
  media_kind TEXT NOT NULL CHECK (media_kind IN ('image','audio','model','video','none')),
  enabled    BOOLEAN NOT NULL DEFAULT true
);

INSERT INTO public.content_types (slug, label, icon, media_kind) VALUES
  ('image',   'Imagen principal', 'image',    'image'),
  ('gallery', 'Galería',          'images',   'image'),
  ('audio',   'Audioguía',        'volume-2', 'audio'),
  ('info',    'Historia',         'book-open','none'),
  ('facts',   'Datos curiosos',   'sparkles', 'none'),
  ('model3d', 'Experiencia 3D',   'box',      'model')
ON CONFLICT (slug) DO NOTHING;

-- 2. Bloques de contenido por parada
CREATE TABLE IF NOT EXISTS public.stop_contents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_id     UUID NOT NULL REFERENCES public.tour_stops(id) ON DELETE CASCADE,
  type        TEXT NOT NULL REFERENCES public.content_types(slug),
  title       TEXT,
  description TEXT,
  file_path   TEXT,
  metadata    JSONB NOT NULL DEFAULT '{}',
  "order"     INTEGER NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'published'
              CHECK (status IN ('draft','published','archived')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stop_contents_lookup
  ON public.stop_contents (stop_id, status, "order");

-- 3. RLS
ALTER TABLE public.content_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stop_contents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content types are public"
  ON public.content_types FOR SELECT USING (true);

CREATE POLICY "published contents are public"
  ON public.stop_contents FOR SELECT
  USING (status = 'published' OR public.is_admin());

CREATE POLICY "admins manage contents"
  ON public.stop_contents FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "admins manage content types"
  ON public.content_types FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. Storage: bucket público de solo lectura, escritura admin
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "media is publicly readable"
  ON storage.objects FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "admins upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media' AND public.is_admin());

CREATE POLICY "admins update media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'media' AND public.is_admin());

CREATE POLICY "admins delete media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'media' AND public.is_admin());

-- 5. Migración de datos: audio_src y cultural_context → bloques
INSERT INTO public.stop_contents (stop_id, type, title, file_path, metadata, "order")
SELECT id, 'audio', 'Audioguía', audio_src,
       jsonb_build_object('durationSeconds', duration_seconds, 'lang', 'es'), 20
FROM public.tour_stops
WHERE audio_src IS NOT NULL AND audio_src <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.stop_contents c
    WHERE c.stop_id = tour_stops.id AND c.type = 'audio'
  );

INSERT INTO public.stop_contents (stop_id, type, title, description, "order")
SELECT id, 'info', 'Historia', cultural_context, 30
FROM public.tour_stops
WHERE cultural_context IS NOT NULL AND cultural_context <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.stop_contents c
    WHERE c.stop_id = tour_stops.id AND c.type = 'info'
  );

-- audio_src / cultural_context quedan deprecados; se eliminan en una
-- migración de limpieza cuando el frontend deje de leerlos.
