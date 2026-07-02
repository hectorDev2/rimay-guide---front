export interface TourStop {
  id: string;
  order: number;
  name: string;
  nameQuechua?: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  audioSrc: string;
  durationSeconds: number;
  description: string;
  culturalContext: string;
  imageUrl?: string;
}

export interface Tour {
  id: string;
  slug: string;
  name: string;
  nameQuechua?: string;
  description: string;
  totalDurationMinutes: number;
  stops: TourStop[];
}

export interface TourStopDisplay {
  id: string;
  name: string;
  duration: string;
  status: 'completed' | 'current' | 'future';
  audioSrc: string;
  latitude: number;
  longitude: number;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function toDisplayStops(
  stops: TourStop[],
  completedIds: Set<string>,
  currentStopId: string | null,
): TourStopDisplay[] {
  return stops.map((s) => ({
    id: s.id,
    name: s.name,
    duration: formatDuration(s.durationSeconds),
    status: completedIds.has(s.id) ? 'completed' : s.id === currentStopId ? 'current' : 'future',
    audioSrc: s.audioSrc,
    latitude: s.latitude,
    longitude: s.longitude,
  }));
}


