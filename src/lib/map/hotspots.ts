export interface HotspotDef {
  id: string;
  position: [number, number, number];
  label: string;
  description: string;
}

const FORTRALEZA_HOTSPOTS: HotspotDef[] = [
  {
    id: 'zigzag-wall',
    position: [0, 0.6, 1.2],
    label: 'Muro zigzagueante',
    description: 'Los muros en zigzag representan los dientes del puma, animal sagrado que protege al Cusco. Cada ángulo cumple una función acústica y estructural.',
  },
  {
    id: 'tower',
    position: [2.2, 1.5, 0],
    label: 'Torre de vigilancia',
    description: 'Torre circular desde donde se controlaba visualmente el valle. Tenía propósitos defensivos y ceremoniales, alineada con eventos astronómicos.',
  },
  {
    id: 'inner-platform',
    position: [0, 0.3, 0],
    label: 'Plataforma interior',
    description: 'Espacio ceremonial elevado donde se realizaban rituales y ceremonias importantes del complejo militar-religioso.',
  },
  {
    id: 'stone-wall',
    position: [-2.2, 0.6, -0.5],
    label: 'Muralla ciclópea',
    description: 'Bloques megalíticos de hasta 100 toneladas, tallados con precisión milimétrica. Sin mortero, resistentes a terremotos por sus superficies curvas y múltiples ángulos.',
  },
];

const TEMPLO_HOTSPOTS: HotspotDef[] = [
  {
    id: 'portal',
    position: [0.8, 0.6, 1.6],
    label: 'Portada trapezoidal',
    description: 'La puerta trapezoidal, más ancha en la base que en el dintel, es el sello distintivo de la arquitectura inca. Esta forma distribuye mejor el peso y es antisísmica.',
  },
  {
    id: 'main-wall',
    position: [1.8, 0.9, 0],
    label: 'Muro de piedra tallada',
    description: 'Muros construidos con piedra tallada que encaja perfectamente. Los incas entendían la piedra como un ser vivo al que había que vestir respetando su forma natural.',
  },
  {
    id: 'roof',
    position: [0, 2, 0],
    label: 'Techo escalonado',
    description: 'Techumbre escalonada que representa los andenes de cultivo. Cada nivel tiene un significado simbólico de ascenso espiritual hacia el Inti (Sol).',
  },
  {
    id: 'niche',
    position: [-1.2, 0.6, 1.2],
    label: 'Hornacina ceremonial',
    description: 'Nichos trapezoidales incrustados en los muros donde se colocaban ofrendas de hojas de coca, chicha y figuras de oro (o punchau) durante las ceremonias.',
  },
];

const SANTUARIO_HOTSPOTS: HotspotDef[] = [
  {
    id: 'rock-altar',
    position: [0, 1.5, 0],
    label: 'Roca ceremonial',
    description: 'Formación rocosa tallada por los incas como altar ceremonial. Cada ángulo y sombra proyectada tenía un significado calendárico preciso.',
  },
  {
    id: 'offering-slab',
    position: [0.5, 0.9, 0.8],
    label: 'Altar de ofrendas',
    description: 'Plataforma donde se realizaban ofrendas a la Pachamama (Madre Tierra). La ofrenda era un contrato de reciprocidad: dar para recibir protección.',
  },
  {
    id: 'water-channel',
    position: [-1, 0.4, -0.8],
    label: 'Canal ceremonial',
    description: 'Canales tallados en la roca para el culto al agua. El sonido del agua corriente era parte esencial de la experiencia espiritual en los santuarios.',
  },
  {
    id: 'underground',
    position: [0.8, 0.3, -0.5],
    label: 'Entrada subterránea',
    description: 'Acceso al Ukhu Pacha — el mundo subterráneo — tan importante como el mundo de arriba. Túneles conectaban espacios ceremoniales para el tránsito de sacerdotes.',
  },
];

const MIRADOR_HOTSPOTS: HotspotDef[] = [
  {
    id: 'viewpoint',
    position: [0, 2.8, 0],
    label: 'Mirador panorámico',
    description: 'Punto más alto con vista de 360 grados del Valle Sagrado. Cada montaña (apu) tiene su nombre e historia: el Ausangate al sur, el Salkantay al oeste.',
  },
  {
    id: 'tower-base',
    position: [0, 0.2, 0.6],
    label: 'Base de la torre',
    description: 'Base de piedra de la torre de observación. Construida con técnica de pirka (piedras con argamasa de barro) sobre cimientos incas.',
  },
  {
    id: 'parapet',
    position: [1.2, 2.6, 0],
    label: 'Pretil de protección',
    description: 'Muros bajos que rodean la plataforma del mirador. Ofrecen protección sin obstruir la vista panorámica del valle.',
  },
];

const PLAZA_HOTSPOTS: HotspotDef[] = [
  {
    id: 'ushnu',
    position: [0, 0.4, 0],
    label: 'Ushnu — Plataforma ceremonial',
    description: 'Plataforma elevada desde donde el Sapa Inca presidía las ceremonias. El espacio fue diseñado para que el sonido viajara sin distorsión.',
  },
  {
    id: 'steps',
    position: [0, 0.05, 2.5],
    label: 'Gradas de acceso',
    description: 'Escalones de acceso a la plaza, construidos con piedra labrada. Las gradas servían como asiento para la multitud durante las ceremonias del Inti Raymi.',
  },
];

const TOUR_STOP_HOTSPOTS: HotspotDef[] = [
  {
    id: 'info-point',
    position: [0, 0.8, 0],
    label: 'Punto de información',
    description: 'Parada del recorrido con contenido histórico y cultural. Escuchá la narración para conocer la historia detrás de cada lugar.',
  },
];

const CATEGORY_HOTSPOTS: Record<string, HotspotDef[]> = {
  templo: TEMPLO_HOTSPOTS,
  fortaleza: FORTRALEZA_HOTSPOTS,
  santuario: SANTUARIO_HOTSPOTS,
  mirador: MIRADOR_HOTSPOTS,
  plaza: PLAZA_HOTSPOTS,
  mercado: PLAZA_HOTSPOTS,
  barrio: PLAZA_HOTSPOTS,
  tour_stop: TOUR_STOP_HOTSPOTS,
};

const POI_SPECIFIC_HOTSPOTS: Record<string, HotspotDef[]> = {
  'sacsayhuaman-fortaleza': [
    {
      id: 'muyucmarca',
      position: [0, 0.3, -0.5],
      label: 'Torreón de Muyucmarca',
      description: 'Torre circular que domina todo el valle del Cusco. Su nombre en quechua significa "lugar redondo". Tenía propósitos duales: defensivo y ceremonial.',
    },
  ],
  'coricancha': [
    {
      id: 'gold-walls',
      position: [0.5, 0.6, 1.2],
      label: 'Muros de oro',
      description: 'Los muros del Coricancha estaban cubiertos con planchas de oro puro. Al entrar, el sol iluminaba las paredes doradas creando un resplandor cegador.',
    },
    {
      id: 'colonial-overlay',
      position: [-1, 1.2, 0],
      label: 'Convento de Santo Domingo',
      description: 'Sobre los cimientos del templo inca se construyó el Convento de Santo Domingo. La arquitectura colonial se fusiona con la inca en una sola estructura.',
    },
  ],
  'qenqo': [
    {
      id: 'labyrinth',
      position: [-0.8, 0.4, 0.3],
      label: 'Laberinto subterráneo',
      description: 'Qenqo significa "laberinto" en quechua. Galerías subterráneas talladas en la roca viva con canales que conducían la sangre de los sacrificios.',
    },
  ],
  'tambomachay': [
    {
      id: 'aqueduct',
      position: [0.3, 0.5, 0.6],
      label: 'Acueducto ceremonial',
      description: 'Canales y acueductos perfectamente conservados que aún conducen agua. Los incas dominaban la hidráulica: el agua fluye con presión constante todo el año.',
    },
  ],
};

export function getHotspotsForPoi(poiId: string, category: string): HotspotDef[] {
  const specific = POI_SPECIFIC_HOTSPOTS[poiId] ?? [];
  const categoryDefaults = CATEGORY_HOTSPOTS[category] ?? TOUR_STOP_HOTSPOTS;
  return [...specific, ...categoryDefaults];
}
