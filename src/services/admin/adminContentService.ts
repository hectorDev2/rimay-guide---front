import { supabase } from '@/lib/supabaseClient';
import type { ContentTypeRow, StopContentRow } from '@/lib/supabase/types';
import { toContentBlock, type ContentBlock, type ContentStatus } from '@/lib/content/types';
import { resolveMediaUrl } from '@/services/contentService';
import type { ContentInput } from './schemas';

const BUCKET = 'media';

function toBlock(row: StopContentRow): ContentBlock {
  return toContentBlock(row, resolveMediaUrl);
}

export const adminContentService = {
  /** Tipos disponibles para el menú "Agregar contenido" (dinámico). */
  listTypes: async (): Promise<ContentTypeRow[]> => {
    const { data, error } = await supabase
      .from('content_types')
      .select('*')
      .eq('enabled', true)
      .order('slug');
    if (error) throw error;
    return data as ContentTypeRow[];
  },

  /** Todos los tipos (incluye deshabilitados) para la pantalla de gestión. */
  listAllTypes: async (): Promise<ContentTypeRow[]> => {
    const { data, error } = await supabase.from('content_types').select('*').order('slug');
    if (error) throw error;
    return data as ContentTypeRow[];
  },

  setTypeEnabled: async (slug: string, enabled: boolean): Promise<void> => {
    const { error } = await supabase.from('content_types').update({ enabled }).eq('slug', slug);
    if (error) throw error;
  },

  /** Registrar un tipo nuevo (video, AR, ...) sin tocar el esquema. */
  createType: async (input: Omit<ContentTypeRow, 'enabled'> & { enabled?: boolean }): Promise<void> => {
    const { error } = await supabase.from('content_types').insert({
      slug: input.slug,
      label: input.label,
      icon: input.icon || null,
      media_kind: input.media_kind,
      enabled: input.enabled ?? true,
    });
    if (error) throw error;
  },

  /** Todos los bloques de una parada, incluyendo borradores. */
  listByStop: async (stopId: string): Promise<ContentBlock[]> => {
    const { data, error } = await supabase
      .from('stop_contents')
      .select('*')
      .eq('stop_id', stopId)
      .order('order', { ascending: true });
    if (error) throw error;
    return (data as StopContentRow[]).map(toBlock);
  },

  create: async (stopId: string, input: ContentInput): Promise<ContentBlock> => {
    const { data, error } = await supabase
      .from('stop_contents')
      .insert({
        stop_id: stopId,
        type: input.type,
        title: input.title || null,
        description: input.description || null,
        file_path: input.filePath || null,
        metadata: input.metadata ?? {},
        order: input.order,
        status: input.status,
      })
      .select()
      .single();
    if (error) throw error;
    return toBlock(data as StopContentRow);
  },

  update: async (id: string, input: Partial<ContentInput>): Promise<ContentBlock> => {
    const { data, error } = await supabase
      .from('stop_contents')
      .update({
        ...(input.title !== undefined && { title: input.title || null }),
        ...(input.description !== undefined && { description: input.description || null }),
        ...(input.filePath !== undefined && { file_path: input.filePath || null }),
        ...(input.metadata !== undefined && { metadata: input.metadata }),
        ...(input.order !== undefined && { order: input.order }),
        ...(input.status !== undefined && { status: input.status }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return toBlock(data as StopContentRow);
  },

  setStatus: async (id: string, status: ContentStatus): Promise<void> => {
    const { error } = await supabase
      .from('stop_contents')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  /** Persiste el nuevo orden tras drag-and-drop. */
  reorder: async (orderedIds: string[]): Promise<void> => {
    for (const [index, id] of orderedIds.entries()) {
      const { error } = await supabase
        .from('stop_contents')
        .update({ order: (index + 1) * 10 })
        .eq('id', id);
      if (error) throw error;
    }
  },

  /** Sube el archivo a Storage y devuelve el path para guardar en el bloque. */
  uploadMedia: async (stopId: string, file: File, kind: 'image' | 'audio' | 'model'): Promise<string> => {
    const folder = kind === 'image' ? 'gallery' : kind === 'audio' ? 'audio' : 'models';
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
    const path = `stops/${stopId}/${folder}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '31536000',
      upsert: false,
    });
    if (error) throw error;
    return path;
  },

  remove: async (id: string): Promise<void> => {
    // Preferir setStatus(id, 'archived'); remove es definitivo.
    const { error } = await supabase.from('stop_contents').delete().eq('id', id);
    if (error) throw error;
  },
};
