export interface TourRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  total_duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface TourStopRow {
  id: string;
  tour_id: string;
  order: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  audio_src: string;
  duration_seconds: number;
  created_at: string;
}
