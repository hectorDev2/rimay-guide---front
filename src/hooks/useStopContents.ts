import { useEffect, useState } from 'react';
import { fetchContentsByStop } from '@/services/contentService';
import type { ContentBlock } from '@/lib/content/types';

const cache = new Map<string, ContentBlock[]>();

interface UseStopContentsResult {
  blocks: ContentBlock[];
  loading: boolean;
}

/**
 * Bloques de contenido publicados de una parada, con caché en memoria.
 * Si la query falla (offline sin caché), devuelve [] — la UI simplemente
 * no muestra secciones extra; la experiencia base nunca se rompe.
 */
export function useStopContents(stopId: string | null | undefined): UseStopContentsResult {
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => (stopId && cache.get(stopId)) || []);
  const [loading, setLoading] = useState(!!stopId && !cache.has(stopId ?? ''));

  useEffect(() => {
    if (!stopId) return;
    const cached = cache.get(stopId);
    if (cached) {
      setBlocks(cached);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchContentsByStop(stopId)
      .then((result) => {
        cache.set(stopId, result);
        if (!cancelled) setBlocks(result);
      })
      .catch(() => {
        if (!cancelled) setBlocks([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [stopId]);

  return { blocks, loading };
}
