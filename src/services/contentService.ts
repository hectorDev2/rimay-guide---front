import { supabase } from '@/lib/supabaseClient';
import type { StopContentRow } from '@/lib/supabase/types';
import { toContentBlock, type ContentBlock } from '@/lib/content/types';

const BUCKET = 'media';

/** Paths legados (/voices/...) se sirven desde public/; el resto desde Storage. */
export function resolveMediaUrl(path: string): string {
  if (path.startsWith('/') || path.startsWith('http')) return path;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Bloques publicados de una parada, ordenados. */
export async function fetchContentsByStop(stopId: string): Promise<ContentBlock[]> {
  const { data, error } = await supabase
    .from('stop_contents')
    .select('*')
    .eq('stop_id', stopId)
    .eq('status', 'published')
    .order('order', { ascending: true });

  if (error) throw new Error(`Error al cargar contenido: ${error.message}`);
  return (data as StopContentRow[]).map((r) => toContentBlock(r, resolveMediaUrl));
}

/**
 * URLs de medios publicados de un tour para precache offline.
 * Excluye model3d: los modelos pesados se descargan bajo demanda, nunca
 * bloquean la descarga base del tour.
 */
export async function fetchTourMediaUrls(tourId: string): Promise<string[]> {
  const byStop = await fetchContentsByTour(tourId);
  const urls = new Set<string>();
  for (const blocks of byStop.values()) {
    for (const b of blocks) {
      if (b.type !== 'model3d' && b.fileUrl) urls.add(b.fileUrl);
    }
  }
  return [...urls];
}

/** Bloques publicados de todas las paradas de un tour, en una sola query. */
export async function fetchContentsByTour(tourId: string): Promise<Map<string, ContentBlock[]>> {
  const { data, error } = await supabase
    .from('stop_contents')
    .select('*, tour_stops!inner(tour_id)')
    .eq('tour_stops.tour_id', tourId)
    .eq('status', 'published')
    .order('order', { ascending: true });

  if (error) throw new Error(`Error al cargar contenido del tour: ${error.message}`);

  const byStop = new Map<string, ContentBlock[]>();
  for (const row of data as StopContentRow[]) {
    const block = toContentBlock(row, resolveMediaUrl);
    const list = byStop.get(block.stopId) ?? [];
    list.push(block);
    byStop.set(block.stopId, list);
  }
  return byStop;
}
