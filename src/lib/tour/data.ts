import type { Tour, TourStop } from './types';

function stop(overrides: Partial<TourStop> & { id: string; order: number; name: string }): TourStop {
  return {
    latitude: -13.5075,
    longitude: -71.982,
    radiusMeters: 15,
    audioSrc: '/voices/sacsayhuaman_es.mp3',
    durationSeconds: 240,
    description: '',
    culturalContext: '',
    ...overrides,
  };
}

const SACSAYHUAMAN_STOPS: TourStop[] = [
  stop({
    id: 'murallas-ciclopeas',
    order: 1,
    name: 'Murallas Ciclópeas',
    latitude: -13.5078,
    longitude: -71.9815,
    radiusMeters: 15,
    audioSrc: '/voices/sacsayhuaman_es.mp3',
    durationSeconds: 240,
    description: 'Imponentes muros de piedra de hasta 6 metros de altura, construidos con bloques megalíticos de hasta 100 toneladas. Ejemplo perfecto de la arquitectura inca: piedras talladas con tal precisión que no entra ni una hoja de papel entre ellas.',
    culturalContext: 'Estos muros representan el dominio inca de la ingeniería sísmica. Las piedras encajan con superficies curvas y 12 ángulos distintos, lo que las hace resistentes a terremotos. Cada bloque fue tallado por mitayos (trabajadores rotativos) que entendían la piedra como un ser vivo al que habían que "vestir" respetando su forma natural.',
  }),
  stop({
    id: 'torreon-muyucmarca',
    order: 2,
    name: 'Torreón de Muyucmarca',
    latitude: -13.5085,
    longitude: -71.9820,
    radiusMeters: 20,
    audioSrc: '/voices/sacsayhuaman_es.mp3',
    durationSeconds: 360,
    description: 'Torre circular de origen inca, parte del complejo defensivo y ceremonial de Sacsayhuamán. Su nombre en quechua significa "lugar redondo". Desde aquí se domina todo el valle del Cusco.',
    culturalContext: 'Las torres circulares como Muyucmarca tenían propósitos duales: defensivos (control visual del valle) y ceremoniales (observación astronómica durante el solsticio). Los incas alineaban sus estructuras con los cerros sagrados y eventos celestes.',
  }),
  stop({
    id: 'sacsayhuaman-fortaleza',
    order: 3,
    name: 'Sacsayhuamán — Fortaleza del Sol',
    latitude: -13.5075,
    longitude: -71.9825,
    radiusMeters: 25,
    audioSrc: '/voices/sacsayhuaman_es.mp3',
    durationSeconds: 330,
    description: 'El corazón del complejo. Fortaleza ceremonial dedicada al Inti (Sol). Sus muros en zigzag representan los dientes del puma, animal sagrado que protege al Cusco.',
    culturalContext: 'Los muros zigzagueantes no son solo decorativos: cada saliente y entrante cumple una función acústica y estructural. En las ceremonias, el sonido de los pututos (caracolas) resonaba rebotando en los ángulos, creando un efecto envolvente que amplificaba la experiencia espiritual.',
  }),
  stop({
    id: 'plaza-del-inca',
    order: 4,
    name: 'Plaza del Inca',
    latitude: -13.5068,
    longitude: -71.9830,
    radiusMeters: 20,
    audioSrc: '/voices/sacsayhuaman_es.mp3',
    durationSeconds: 300,
    description: 'Espacio ceremonial donde se realizaban rituales y ceremonias importantes. Ofrece una vista panorámica impresionante del Valle Sagrado.',
    culturalContext: 'Esta plaza era el escenario del Inti Raymi original, donde miles de personas se congregaban para honrar al Sol. El espacio fue diseñado para que el sonido viajara sin distorsión, permitiendo que las palabras del Sapa Inca llegaran a toda la concurrencia.',
  }),
  stop({
    id: 'templo-de-la-luna',
    order: 5,
    name: 'Templo de la Luna',
    latitude: -13.5060,
    longitude: -71.9820,
    radiusMeters: 25,
    audioSrc: '/voices/sacsayhuaman_es.mp3',
    durationSeconds: 420,
    description: 'Estructura ceremonial dedicada a Quilla, la diosa Luna. Lugar de observación astronómica y rituales femeninos.',
    culturalContext: 'Quilla era la contraparte femenina del Inti, asociada con los ciclos menstruales, las mareas y las cosechas. Las mujeres incas realizaban aquí ceremonias de agradecimiento por la fertilidad de la tierra. Los incas medían el tiempo observando las fases de Quilla.',
  }),
  stop({
    id: 'tuneles-subterraneos',
    order: 6,
    name: 'Túneles Subterráneos',
    latitude: -13.5065,
    longitude: -71.9805,
    radiusMeters: 20,
    audioSrc: '/voices/sacsayhuaman_es.mp3',
    durationSeconds: 480,
    description: 'Red de pasajes subterráneos que conectan diferentes partes del complejo. Utilizados para ceremonias, almacenamiento y como vías de escape.',
    culturalContext: 'El Ukhu Pacha (mundo subterráneo) era tan importante como el mundo de arriba. Estos túneles conectaban espacios ceremoniales y permitían el tránsito de sacerdotes entre templos sin ser vistos por los fieles, añadiendo misticismo a las ceremonias.',
  }),
  stop({
    id: 'mirador-panoramico',
    order: 7,
    name: 'Mirador Panorámico',
    latitude: -13.5070,
    longitude: -71.9795,
    radiusMeters: 20,
    audioSrc: '/voices/sacsayhuaman_es.mp3',
    durationSeconds: 270,
    description: 'Punto más alto del recorrido con vista de 360 grados del Valle Sagrado, la ciudad del Cusco y las montañas circundantes.',
    culturalContext: 'Desde aquí se entiende por qué los incas eligieron este lugar. El valle entero es un libro abierto: cada montaña (apu) tiene su nombre y su historia. El Ausangate al sur, el Salkantay al oeste — los apus más sagrados vigilan el valle.',
  }),
  stop({
    id: 'roca-sagrada',
    order: 8,
    name: 'Roca Sagrada',
    latitude: -13.5075,
    longitude: -71.9790,
    radiusMeters: 15,
    audioSrc: '/voices/sacsayhuaman_es.mp3',
    durationSeconds: 180,
    description: 'Formación rocosa ceremonial tallada por los incas. Posiblemente un altar o un marcador astronómico utilizado para observar el sol durante el Inti Raymi.',
    culturalContext: 'Los incas no tallaban la roca al azar. Cada ángulo y cada sombra proyectada tenía un significado calendárico. Durante el solsticio de invierno, la sombra de esta roca señala exactamente el centro ceremonial, marcando el momento preciso del renacimiento del Inti.',
  }),
  stop({
    id: 'altar-ceremonial',
    order: 9,
    name: 'Altar Ceremonial',
    latitude: -13.5080,
    longitude: -71.9800,
    radiusMeters: 15,
    audioSrc: '/voices/sacsayhuaman_es.mp3',
    durationSeconds: 300,
    description: 'Plataforma ceremonial donde se realizaban ofrendas a la Pachamama (Madre Tierra) y al Inti. Los incas ofrecían hojas de coca, chicha y llamas.',
    culturalContext: 'La ofrenda no era un simple ritual: era un contrato de reciprocidad. Los incas ofrecían lo mejor de sus cosechas y tejidos a cambio de la protección de la Pachamama. Esta relación de reciprocidad (ayni) era la base de toda la cosmovisión andina: dar y recibir en equilibrio.',
  }),
];

const SACSAYHUAMAN_TOUR: Tour = {
  id: 'sacsayhuaman',
  slug: 'sacsayhuaman',
  name: 'Sacsayhuamán — Fortaleza del Sol',
  nameQuechua: 'Sacsayhuamán',
  description: 'Recorré la imponente fortaleza ceremonial inca',
  totalDurationMinutes: 45,
  stops: SACSAYHUAMAN_STOPS,
};

const HARDCODED_TOURS: Record<string, Tour> = {
  sacsayhuaman: SACSAYHUAMAN_TOUR,
};

export function getHardcodedTour(slug: string): Tour | undefined {
  return HARDCODED_TOURS[slug];
}

export function getAllHardcodedSlugs(): string[] {
  return Object.keys(HARDCODED_TOURS);
}
