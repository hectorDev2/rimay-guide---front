export interface Poi {
  id: string;
  name: string;
  description: string;
  category: 'templo' | 'fortaleza' | 'plaza' | 'santuario' | 'mirador' | 'mercado' | 'barrio' | 'tour_stop';
  latitude: number;
  longitude: number;
  /** Height in meters for Mapbox fill-extrusion 3D */
  extrusionHeight: number;
  /** Color for 3D extrusion */
  color: string;
  /** Geofence radius in meters */
  geofenceRadius: number;
  /** Image URL for popup */
  imageUrl?: string;
  /** Tour stop ID if this is a tour stop */
  tourStopId?: number;
}

const TEMPLE_COLOR = '#C8922A';
const FORTRESS_COLOR = '#A0522D';
const PLAZA_COLOR = '#4A7FA5';
const DEFAULT_COLOR = '#6B8F71';
const STOP_COLOR = '#A0522D';

export const POIS: Poi[] = [
  // === Tour stops (9 paradas del tour) ===
  {
    id: 'murallas-ciclopeas',
    name: 'Murallas Ciclópeas',
    description: 'Imponentes muros de piedra de hasta 6 metros de altura, construidos con bloques megalíticos de hasta 100 toneladas. Las piedras encajan con tal precisión que no entra ni una hoja de papel entre ellas.',
    category: 'tour_stop',
    latitude: -13.5078,
    longitude: -71.9815,
    extrusionHeight: 6,
    color: STOP_COLOR,
    geofenceRadius: 30,
    tourStopId: 1,
  },
  {
    id: 'torreon-muyucmarca',
    name: 'Torreón de Muyucmarca',
    description: 'Torre circular de origen inca, parte del complejo defensivo y ceremonial. Su nombre en quechua significa "lugar redondo". Desde aquí se domina todo el valle del Cusco.',
    category: 'tour_stop',
    latitude: -13.5085,
    longitude: -71.9820,
    extrusionHeight: 8,
    color: STOP_COLOR,
    geofenceRadius: 30,
    tourStopId: 2,
  },
  {
    id: 'sacsayhuaman-fortaleza',
    name: 'Sacsayhuamán — Fortaleza del Sol',
    description: 'El corazón del complejo. Fortaleza ceremonial dedicada al Inti (Sol). Sus muros en zigzag representan los dientes del puma, animal sagrado que protege al Cusco.',
    category: 'fortaleza',
    latitude: -13.5075,
    longitude: -71.9825,
    extrusionHeight: 15,
    color: FORTRESS_COLOR,
    geofenceRadius: 40,
    tourStopId: 3,
  },
  {
    id: 'plaza-del-inca',
    name: 'Plaza del Inca',
    description: 'Espacio ceremonial donde se realizaban rituales y ceremonias importantes. Vista panorámica del Valle Sagrado.',
    category: 'tour_stop',
    latitude: -13.5068,
    longitude: -71.9830,
    extrusionHeight: 3,
    color: STOP_COLOR,
    geofenceRadius: 30,
    tourStopId: 4,
  },
  {
    id: 'templo-de-la-luna',
    name: 'Templo de la Luna',
    description: 'Estructura ceremonial dedicada a Quilla, la diosa Luna. Lugar de observación astronómica y rituales femeninos.',
    category: 'templo',
    latitude: -13.5060,
    longitude: -71.9820,
    extrusionHeight: 10,
    color: TEMPLE_COLOR,
    geofenceRadius: 30,
    tourStopId: 5,
  },
  {
    id: 'tuneles-subterraneos',
    name: 'Túneles Subterráneos',
    description: 'Red de pasajes subterráneos que conectan diferentes partes del complejo. Usados para ceremonias, almacenamiento y vías de escape.',
    category: 'tour_stop',
    latitude: -13.5065,
    longitude: -71.9805,
    extrusionHeight: 4,
    color: STOP_COLOR,
    geofenceRadius: 30,
    tourStopId: 6,
  },
  {
    id: 'mirador-panoramico',
    name: 'Mirador Panorámico',
    description: 'Punto más alto del recorrido con vista de 360° del Valle Sagrado, la ciudad del Cusco y las montañas circundantes.',
    category: 'mirador',
    latitude: -13.5070,
    longitude: -71.9795,
    extrusionHeight: 2,
    color: DEFAULT_COLOR,
    geofenceRadius: 30,
    tourStopId: 7,
  },
  {
    id: 'roca-sagrada',
    name: 'Roca Sagrada',
    description: 'Formación rocosa ceremonial tallada por los incas. Posible altar o marcador astronómico para observar el sol durante el Inti Raymi.',
    category: 'santuario',
    latitude: -13.5075,
    longitude: -71.9790,
    extrusionHeight: 5,
    color: TEMPLE_COLOR,
    geofenceRadius: 25,
    tourStopId: 8,
  },
  {
    id: 'altar-ceremonial',
    name: 'Altar Ceremonial',
    description: 'Plataforma ceremonial donde se realizaban ofrendas a la Pachamama y al Inti. Los incas ofrecían hojas de coca, chicha y llamas.',
    category: 'santuario',
    latitude: -13.5080,
    longitude: -71.9800,
    extrusionHeight: 4,
    color: TEMPLE_COLOR,
    geofenceRadius: 25,
    tourStopId: 9,
  },

  // === Puntos de interés cultural adicionales ===
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
    description: 'Corazón de la ciudad del Cusco. Rodeada de arquitectura colonial construida sobre cimientos incas. Aquí se realizaban las grandes ceremonias del Tawantinsuyu.',
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
    description: 'Santuario ceremonial inca tallado en la roca viva. Su nombre en quechua significa "laberinto" o "zigzag". Contiene canales ceremoniales y un anfiteatro subterráneo.',
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
    description: 'Fortaleza militar inca de color rojizo, de ahí su nombre ("Fortaleza Roja" en quechua). Controlaba el acceso a Cusco desde el Antisuyu.',
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
    description: 'Complejo ceremonial inca dedicado al culto del agua. Conocido como los "Baños del Inca". Canales y acueductos perfectamente conservados que aún llevan agua.',
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
    description: 'Barrio bohemio del Cusco, famoso por sus talleres de artesanía y su estrecha callejuela empedrada. Iglesia de San Blas con su púlpito tallado en cedro.',
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
    description: 'Mercado tradicional de Cusco. Productos frescos, jugos naturales, artesanías y la mejor comida local. Imperdible para probar la chicha de jora.',
    category: 'mercado',
    latitude: -13.5180,
    longitude: -71.9810,
    extrusionHeight: 3,
    color: DEFAULT_COLOR,
    geofenceRadius: 30,
  },
];

export function getPoiById(id: string): Poi | undefined {
  return POIS.find((p) => p.id === id);
}

export function getTourStopPois(): Poi[] {
  return POIS.filter((p) => p.category === 'tour_stop');
}

export function getCulturalPois(): Poi[] {
  return POIS.filter((p) => p.category !== 'tour_stop');
}
