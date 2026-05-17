import { SACSAYHUAMAN_TOUR } from '@/lib/tour/types';
import type { TourStop } from '@/lib/tour/types';

export async function fetchTourBySlug(slug: string): Promise<typeof SACSAYHUAMAN_TOUR> {
  await delay(300);
  if (slug === SACSAYHUAMAN_TOUR.slug) return SACSAYHUAMAN_TOUR;
  throw new Error(`Tour no encontrado: ${slug}`);
}

export async function fetchTourStops(tourId: string): Promise<TourStop[]> {
  await delay(200);
  if (tourId === SACSAYHUAMAN_TOUR.id) return SACSAYHUAMAN_TOUR.stops;
  throw new Error(`Stops no encontrados para: ${tourId}`);
}

export function getAudioUrls(stops: TourStop[]): string[] {
  return stops
    .filter((s) => s.audioSrc !== '/audio/placeholder.mp3')
    .map((s) => s.audioSrc);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
