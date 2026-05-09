import type { Tour, TourStop } from '@/stores/tourStore';

const MOCK_TOUR: Tour = {
  id: 'sacsayhuaman',
  slug: 'sacsayhuaman',
  name: 'Sacsayhuamán — Fortaleza del Sol',
  description: 'Recorré la imponente fortaleza ceremonial inca',
  totalDurationMinutes: 45,
  stops: [
    {
      id: 'stop-1',
      order: 1,
      name: 'Murallas Ciclópeas',
      latitude: -13.5078,
      longitude: -71.9815,
      radiusMeters: 15,
      audioSrc: '/voices/sacsayhuaman_es.mp3',
      durationSeconds: 180,
      isCompleted: false,
    },
    {
      id: 'stop-2',
      order: 2,
      name: 'Torreón de Muyucmarca',
      latitude: -13.5085,
      longitude: -71.9820,
      radiusMeters: 20,
      audioSrc: '/audio/placeholder.mp3',
      durationSeconds: 240,
      isCompleted: false,
    },
    {
      id: 'stop-3',
      order: 3,
      name: 'Plaza del Inca',
      latitude: -13.5070,
      longitude: -71.9825,
      radiusMeters: 25,
      audioSrc: '/audio/placeholder.mp3',
      durationSeconds: 200,
      isCompleted: false,
    },
  ],
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchTourBySlug(slug: string): Promise<Tour> {
  await delay(300);
  if (slug === MOCK_TOUR.slug) return MOCK_TOUR;
  throw new Error(`Tour no encontrado: ${slug}`);
}

export async function fetchTourStops(tourId: string): Promise<TourStop[]> {
  await delay(200);
  if (tourId === MOCK_TOUR.id) return MOCK_TOUR.stops;
  throw new Error(`Stops no encontrados para: ${tourId}`);
}

export function getAudioUrls(stops: TourStop[]): string[] {
  return stops
    .filter((s) => s.audioSrc !== '/audio/placeholder.mp3')
    .map((s) => s.audioSrc);
}
