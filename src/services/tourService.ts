import { supabase } from '@/lib/supabaseClient';
import type { Tour } from '@/lib/tour/types';

export async function fetchTourBySlug(slug: string): Promise<Tour> {
  const { data: tour, error } = await supabase
    .from('tours')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !tour) throw new Error(`Tour no encontrado: ${slug}`);

  const { data: stops, error: stopsError } = await supabase
    .from('tour_stops')
    .select('*')
    .eq('tour_id', tour.id)
    .order('order');

  if (stopsError) throw new Error(`Error al cargar paradas: ${stopsError.message}`);

  return {
    id: tour.id,
    slug: tour.slug,
    name: tour.name,
    description: tour.description,
    totalDurationMinutes: tour.total_duration_minutes,
    stops: stops.map((s) => ({
      id: s.id,
      order: s.order,
      name: s.name,
      latitude: Number(s.latitude),
      longitude: Number(s.longitude),
      radiusMeters: s.radius_meters,
      audioSrc: s.audio_src,
      durationSeconds: s.duration_seconds,
      description: s.description,
      culturalContext: (s as any).cultural_context ?? '',
    })),
  };
}


