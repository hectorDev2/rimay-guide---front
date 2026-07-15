import { supabase } from '@/lib/supabaseClient';
import { getHardcodedTour } from '@/lib/tour/data';
import { fetchContentsByTour } from '@/services/contentService';
import type { ContentBlock } from '@/lib/content/types';
import type { Tour } from '@/lib/tour/types';

function firstOfType(blocks: ContentBlock[] | undefined, type: string): ContentBlock | undefined {
  return blocks?.find((b) => b.type === type);
}

const FETCH_TIMEOUT_MS = 10000;

export async function fetchTourBySlug(slug: string): Promise<Tour> {
  // Red de seguridad: si Supabase no responde (offline, red lenta o lock
  // colgado), caemos al tour hardcodeado en vez de dejar la app pegada.
  return Promise.race([
    fetchTourFromSupabase(slug),
    new Promise<Tour>((resolve, reject) => {
      setTimeout(() => {
        const fallback = getHardcodedTour(slug);
        if (fallback) resolve(fallback);
        else reject(new Error(`Tiempo de espera agotado al cargar el tour: ${slug}`));
      }, FETCH_TIMEOUT_MS);
    }),
  ]);
}

async function fetchTourFromSupabase(slug: string): Promise<Tour> {
  const { data: tour, error } = await supabase
    .from('tours')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !tour) {
    const fallback = getHardcodedTour(slug);
    if (fallback) return fallback;
    throw new Error(`Tour no encontrado: ${slug}`);
  }

  const { data: stops, error: stopsError } = await supabase
    .from('tour_stops')
    .select('*')
    .eq('tour_id', tour.id)
    .order('order');

  if (stopsError) {
    const fallback = getHardcodedTour(slug);
    if (fallback) return fallback;
    throw new Error(`Error al cargar paradas: ${stopsError.message}`);
  }

  // Hidratación desde stop_contents: los bloques son la fuente de verdad;
  // las columnas legadas (audio_src, cultural_context) quedan como fallback
  // hasta la migración de limpieza.
  let contentsByStop = new Map<string, ContentBlock[]>();
  try {
    contentsByStop = await fetchContentsByTour(tour.id);
  } catch {
    // offline o BD sin migrar: se usan las columnas legadas
  }

  return {
    id: tour.id,
    slug: tour.slug,
    name: tour.name,
    nameQuechua: (tour as any).name_quechua ?? undefined,
    description: tour.description,
    totalDurationMinutes: tour.total_duration_minutes,
    stops: stops.map((s) => {
      const blocks = contentsByStop.get(s.id);
      const audio = firstOfType(blocks, 'audio');
      const info = firstOfType(blocks, 'info');
      const image = firstOfType(blocks, 'image');
      const audioDuration = Number(audio?.metadata?.durationSeconds) || undefined;
      return {
        id: s.id,
        order: s.order,
        name: s.name,
        latitude: Number(s.latitude),
        longitude: Number(s.longitude),
        radiusMeters: s.radius_meters,
        audioSrc: audio?.fileUrl ?? s.audio_src ?? '',
        durationSeconds: audioDuration ?? s.duration_seconds,
        description: s.description,
        culturalContext: info?.description ?? (s as any).cultural_context ?? '',
        imageUrl: image?.fileUrl,
      };
    }),
  };
}


