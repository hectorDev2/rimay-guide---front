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

export interface ChatSessionRow {
  id: string;
  user_id: string;
  tour_id: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageRow {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  feedback: number | null;
  created_at: string;
}
