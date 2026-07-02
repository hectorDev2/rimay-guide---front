CREATE TABLE IF NOT EXISTS public.tours (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  total_duration_minutes INTEGER DEFAULT 45,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS public.user_progress (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tour_id     UUID REFERENCES public.tours(id) ON DELETE CASCADE,
  stop_id     UUID REFERENCES public.tour_stops(id) ON DELETE CASCADE,
  completed   BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, tour_id, stop_id)
);

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

ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tours are viewable by everyone"
  ON public.tours FOR SELECT USING (true);

CREATE POLICY "Tour stops are viewable by everyone"
  ON public.tour_stops FOR SELECT USING (true);

CREATE POLICY "Translations are viewable by everyone"
  ON public.translations FOR SELECT USING (true);

CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);
