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

export interface ContentTypeRow {
  slug: string;
  label: string;
  icon: string | null;
  media_kind: 'image' | 'audio' | 'model' | 'video' | 'none';
  enabled: boolean;
}

export interface StopContentRow {
  id: string;
  stop_id: string;
  type: string;
  title: string | null;
  description: string | null;
  file_path: string | null;
  metadata: Record<string, unknown>;
  order: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
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

export interface ProfileRow {
  id: string;
  role: 'user' | 'admin';
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface TranslationRow {
  id: number;
  namespace: string;
  key: string;
  value: string;
  lang: string;
  created_at: string;
  updated_at: string;
}
