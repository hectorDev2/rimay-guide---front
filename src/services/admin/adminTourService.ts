import { supabase } from '@/lib/supabaseClient';
import type { Tour } from '@/lib/tour/types';
import type { TourRow } from '@/lib/supabase/types';
import type { TourInput } from './schemas';

function toTour(row: TourRow): Tour {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? '',
    totalDurationMinutes: row.total_duration_minutes,
    stops: [],
  };
}

export const adminTourService = {
  list: async (): Promise<Tour[]> => {
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as TourRow[]).map(toTour);
  },

  get: async (id: string): Promise<Tour | null> => {
    const { data, error } = await supabase
      .from('tours')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? toTour(data as TourRow) : null;
  },

  create: async (input: TourInput): Promise<Tour> => {
    const { data, error } = await supabase
      .from('tours')
      .insert({
        slug: input.slug,
        name: input.name,
        description: input.description,
        total_duration_minutes: input.totalDurationMinutes,
      })
      .select('*')
      .single();
    if (error) throw error;
    return toTour(data as TourRow);
  },

  update: async (id: string, input: Partial<TourInput>): Promise<Tour> => {
    const row: Record<string, unknown> = {};
    if (input.slug !== undefined) row.slug = input.slug;
    if (input.name !== undefined) row.name = input.name;
    if (input.description !== undefined) row.description = input.description;
    if (input.totalDurationMinutes !== undefined) row.total_duration_minutes = input.totalDurationMinutes;
    row.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('tours')
      .update(row)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return toTour(data as TourRow);
  },

  remove: async (id: string): Promise<void> => {
    const { error } = await supabase.from('tours').delete().eq('id', id);
    if (error) throw error;
  },
};
