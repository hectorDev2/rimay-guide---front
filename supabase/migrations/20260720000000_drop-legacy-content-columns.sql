-- LIMPIEZA: elimina las columnas legadas de tour_stops.
-- ⚠️ Aplicar SOLO después de desplegar el frontend que hidrata desde
-- stop_contents (tourService con fetchContentsByTour). Fechada a futuro
-- a propósito; adelantá la fecha cuando estés listo para aplicarla.
--
-- Verificación previa (no debe devolver filas):
--   SELECT id, name FROM tour_stops ts
--   WHERE (audio_src IS NOT NULL AND audio_src <> ''
--          AND NOT EXISTS (SELECT 1 FROM stop_contents c
--                          WHERE c.stop_id = ts.id AND c.type = 'audio' AND c.status = 'published'))
--      OR (cultural_context IS NOT NULL AND cultural_context <> ''
--          AND NOT EXISTS (SELECT 1 FROM stop_contents c
--                          WHERE c.stop_id = ts.id AND c.type = 'info' AND c.status = 'published'));

-- Antes de aplicar, quitar también audio_src del form de admin
-- (adminStopService / stopSchema) y del seed.sql base.

ALTER TABLE public.tour_stops DROP COLUMN IF EXISTS audio_src;
ALTER TABLE public.tour_stops DROP COLUMN IF EXISTS cultural_context;
