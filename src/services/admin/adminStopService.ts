import { supabase } from '@/lib/supabaseClient';
import type { TourStop } from '@/lib/tour/types';
import type { TourStopRow } from '@/lib/supabase/types';
import type { StopInput } from './schemas';

function toStop(row: TourStopRow): TourStop {
  return {
    id: row.id,
    order: row.order,
    name: row.name,
    latitude: row.latitude,
    longitude: row.longitude,
    radiusMeters: row.radius_meters,
    audioSrc: row.audio_src,
    durationSeconds: row.duration_seconds,
    description: row.description,
    culturalContext: '',
  };
}

export const adminStopService = {
  listByTour: async (tourId: string): Promise<TourStop[]> => {
    const { data, error } = await supabase
      .from('tour_stops')
      .select('*')
      .eq('tour_id', tourId)
      .order('order', { ascending: true });
    if (error) throw error;
    return (data as TourStopRow[]).map(toStop);
  },

  listAll: async (): Promise<TourStop[]> => {
    const { data, error } = await supabase
      .from('tour_stops')
      .select('*')
      .order('order', { ascending: true });
    if (error) throw error;
    return (data as TourStopRow[]).map(toStop);
  },

  create: async (tourId: string, input: StopInput): Promise<TourStop> => {
    const { data, error } = await supabase
      .from('tour_stops')
      .insert({
        tour_id: tourId,
        order: input.order,
        name: input.name,
        description: input.description,
        latitude: input.latitude,
        longitude: input.longitude,
        radius_meters: input.radiusMeters,
        audio_src: input.audioSrc,
        duration_seconds: input.durationSeconds,
      })
      .select('*')
      .single();
    if (error) throw error;
    return toStop(data as TourStopRow);
  },

  update: async (id: string, input: Partial<StopInput>): Promise<TourStop> => {
    const row: Record<string, unknown> = {};
    if (input.order !== undefined) row.order = input.order;
    if (input.name !== undefined) row.name = input.name;
    if (input.description !== undefined) row.description = input.description;
    if (input.latitude !== undefined) row.latitude = input.latitude;
    if (input.longitude !== undefined) row.longitude = input.longitude;
    if (input.radiusMeters !== undefined) row.radius_meters = input.radiusMeters;
    if (input.audioSrc !== undefined) row.audio_src = input.audioSrc;
    if (input.durationSeconds !== undefined) row.duration_seconds = input.durationSeconds;

    const { data, error } = await supabase
      .from('tour_stops')
      .update(row)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return toStop(data as TourStopRow);
  },

  remove: async (id: string): Promise<void> => {
    const { error } = await supabase.from('tour_stops').delete().eq('id', id);
    if (error) throw error;
  },

  reorder: async (tourId: string, orderedIds: string[]): Promise<void> => {
    const updates = orderedIds.map((id, index) =>
      supabase.from('tour_stops').update({ order: index + 1 }).eq('id', id)
    );
    const results = await Promise.all(updates);
    const firstError = results.find((r) => r.error);
    if (firstError?.error) throw firstError.error;
  },
};
