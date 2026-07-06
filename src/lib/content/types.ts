import type { StopContentRow } from '@/lib/supabase/types';

export type ContentStatus = 'draft' | 'published' | 'archived';

export interface ContentBlock {
  id: string;
  stopId: string;
  type: string; // 'image' | 'gallery' | 'audio' | 'info' | 'facts' | 'model3d' | futuros
  title?: string;
  description?: string;
  /** URL pública resuelta desde Storage (o path local /voices/... legado) */
  fileUrl?: string;
  metadata: Record<string, unknown>;
  order: number;
  status: ContentStatus;
}

export function toContentBlock(row: StopContentRow, resolveUrl: (path: string) => string): ContentBlock {
  return {
    id: row.id,
    stopId: row.stop_id,
    type: row.type,
    title: row.title ?? undefined,
    description: row.description ?? undefined,
    fileUrl: row.file_path ? resolveUrl(row.file_path) : undefined,
    metadata: row.metadata ?? {},
    order: row.order,
    status: row.status,
  };
}

/** Helpers de conveniencia sobre la colección de bloques de un lugar */
export function blocksOfType(blocks: ContentBlock[], type: string): ContentBlock[] {
  return blocks.filter((b) => b.type === type);
}

export function hasType(blocks: ContentBlock[], type: string): boolean {
  return blocks.some((b) => b.type === type);
}

/** Un lugar es "Tipo 1" si tiene bloque model3d publicado. Sin flags. */
export function has3DExperience(blocks: ContentBlock[]): boolean {
  return hasType(blocks, 'model3d');
}
