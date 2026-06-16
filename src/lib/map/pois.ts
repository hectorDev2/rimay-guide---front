import { getHardcodedTour } from '@/lib/tour/data';

export interface Poi {
  id: string;
  name: string;
  description: string;
  category: 'templo' | 'fortaleza' | 'plaza' | 'santuario' | 'mirador' | 'mercado' | 'barrio' | 'tour_stop';
  latitude: number;
  longitude: number;
  extrusionHeight: number;
  color: string;
  geofenceRadius: number;
  imageUrl?: string;
  tourStopId?: string;
}

const TEMPLE_COLOR = '#C8922A';
const FORTRESS_COLOR = '#A0522D';
const PLAZA_COLOR = '#4A7FA5';
const DEFAULT_COLOR = '#6B8F71';
const STOP_COLOR = '#A0522D';

const STOP_POI_CATEGORIES: Record<string, Poi['category']> = {
  'murallas-ciclopeas': 'tour_stop',
  'torreon-muyucmarca': 'tour_stop',
  'sacsayhuaman-fortaleza': 'fortaleza',
  'plaza-del-inca': 'tour_stop',
  'templo-de-la-luna': 'templo',
  'tuneles-subterraneos': 'tour_stop',
  'mirador-panoramico': 'mirador',
  'roca-sagrada': 'santuario',
  'altar-ceremonial': 'santuario',
};

function buildStopPois() {
  const tour = getHardcodedTour('sacsayhuaman')!;
  return tour.stops.map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    category: STOP_POI_CATEGORIES[s.id] ?? 'tour_stop',
    latitude: s.latitude,
    longitude: s.longitude,
    extrusionHeight: s.order === 3 ? 15 : s.order === 5 ? 10 : s.order <= 2 ? 8 : 4,
    color: STOP_POI_CATEGORIES[s.id] === 'fortaleza' ? FORTRESS_COLOR
         : STOP_POI_CATEGORIES[s.id] === 'templo' ? TEMPLE_COLOR
         : STOP_POI_CATEGORIES[s.id] === 'mirador' ? DEFAULT_COLOR
         : STOP_POI_CATEGORIES[s.id] === 'santuario' ? TEMPLE_COLOR
         : STOP_COLOR,
    geofenceRadius: s.radiusMeters,
    tourStopId: s.id,
  }));
}

const CULTURAL_POIS: Poi[] = [
  {
    id: 'coricancha',
    name: 'Coricancha — Templo del Sol',
    description: 'El templo más importante del Imperio Inca. Sus muros estaban cubiertos con planchas de oro puro. Dedicado al Inti (dios Sol). Hoy, sobre sus cimientos se encuentra el Convento de Santo Domingo.',
    category: 'templo',
    latitude: -13.5200,
    longitude: -71.9755,
    extrusionHeight: 12,
    color: TEMPLE_COLOR,
    geofenceRadius: 35,
  },
  {
    id: 'plaza-de-armas',
    name: 'Plaza de Armas',
    description: 'Corazón de la ciudad del Cusco. Rodeada de arquitectura colonial construida sobre cimientos incas.',
    category: 'plaza',
    latitude: -13.5167,
    longitude: -71.9781,
    extrusionHeight: 2,
    color: PLAZA_COLOR,
    geofenceRadius: 40,
  },
  {
    id: 'qenqo',
    name: 'Qenqo — Santuario Subterráneo',
    description: 'Santuario ceremonial inca tallado en la roca viva. Su nombre en quechua significa "laberinto" o "zigzag".',
    category: 'santuario',
    latitude: -13.5245,
    longitude: -71.9698,
    extrusionHeight: 7,
    color: TEMPLE_COLOR,
    geofenceRadius: 30,
  },
  {
    id: 'puka-pukara',
    name: 'Puka Pukara — Fortaleza Roja',
    description: 'Fortaleza militar inca de color rojizo, de ahí su nombre ("Fortaleza Roja" en quechua).',
    category: 'fortaleza',
    latitude: -13.4840,
    longitude: -71.9630,
    extrusionHeight: 9,
    color: FORTRESS_COLOR,
    geofenceRadius: 30,
  },
  {
    id: 'tambomachay',
    name: 'Tambomachay — Baños del Inca',
    description: 'Complejo ceremonial inca dedicado al culto del agua. Canales y acueductos perfectamente conservados.',
    category: 'santuario',
    latitude: -13.4780,
    longitude: -71.9700,
    extrusionHeight: 6,
    color: TEMPLE_COLOR,
    geofenceRadius: 30,
  },
  {
    id: 'san-blas',
    name: 'San Blas — Barrio de Artesanos',
    description: 'Barrio bohemio del Cusco, famoso por sus talleres de artesanía y su estrecha callejuela empedrada.',
    category: 'barrio',
    latitude: -13.5130,
    longitude: -71.9760,
    extrusionHeight: 3,
    color: DEFAULT_COLOR,
    geofenceRadius: 30,
  },
  {
    id: 'mercado-san-pedro',
    name: 'Mercado San Pedro',
    description: 'Mercado tradicional de Cusco. Productos frescos, jugos naturales, artesanías y la mejor comida local.',
    category: 'mercado',
    latitude: -13.5180,
    longitude: -71.9810,
    extrusionHeight: 3,
    color: DEFAULT_COLOR,
    geofenceRadius: 30,
  },
];

export const POIS: Poi[] = [
  ...buildStopPois(),
  ...CULTURAL_POIS,
];

export function getPoiById(id: string): Poi | undefined {
  return POIS.find((p) => p.id === id);
}

export function getTourStopPois(): Poi[] {
  return POIS.filter((p) => p.tourStopId != null);
}

export function getCulturalPois(): Poi[] {
  return POIS.filter((p) => p.tourStopId == null);
}