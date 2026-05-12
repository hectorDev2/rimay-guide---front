interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: 'stop' | 'history' | 'culture' | 'architecture' | 'language' | 'general' | 'cosmology';
  stopId?: number;
}

const STOPS = [
  { id: 1, name: 'Murallas Ciclópeas', duration: '4:00', description: 'Imponentes muros de piedra de hasta 6 metros de altura, construidos con bloques megalíticos de hasta 100 toneladas. Ejemplo perfecto de la arquitectura inca: piedras talladas con tal precisión que no entra ni una hoja de papel entre ellas.' },
  { id: 2, name: 'Torreón de Muyucmarca', duration: '6:00', description: 'Torre circular de origen inca, parte del complejo defensivo y ceremonial de Sacsayhuamán. Su nombre en quechua significa "lugar redondo". Desde aquí se domina todo el valle del Cusco.' },
  { id: 3, name: 'Sacsayhuamán — Fortaleza del Sol', duration: '5:30', description: 'El corazón del complejo. Fortaleza ceremonial dedicada al Inti (Sol). Sus muros en zigzag representan los dientes del puma, animal sagrado que protege al Cusco.' },
  { id: 4, name: 'Plaza del Inca', duration: '5:00', description: 'Espacio ceremonial donde se realizaban rituales y ceremonias importantes. Ofrece una vista panorámica impresionante del Valle Sagrado.' },
  { id: 5, name: 'Templo de la Luna', duration: '7:00', description: 'Estructura ceremonial dedicada a Quilla, la diosa Luna. Lugar de observación astronómica y rituales femeninos.' },
  { id: 6, name: 'Túneles Subterráneos', duration: '8:00', description: 'Red de pasajes subterráneos que conectan diferentes partes del complejo. Utilizados para ceremonias, almacenamiento y como vías de escape.' },
  { id: 7, name: 'Mirador Panorámico', duration: '4:30', description: 'Punto más alto del recorrido con vista de 360 grados del Valle Sagrado, la ciudad del Cusco y las montañas circundantes.' },
  { id: 8, name: 'Roca Sagrada', duration: '3:00', description: 'Formación rocosa ceremonial tallada por los incas. Posiblemente un altar o un marcador astronómico utilizado para observar el sol durante el Inti Raymi.' },
  { id: 9, name: 'Altar Ceremonial', duration: '5:00', description: 'Plataforma ceremonial donde se realizaban ofrendas a la Pachamama (Madre Tierra) y al Inti. Los incas ofrecían hojas de coca, chicha y llamas.' },
];

const KNOWLEDGE_BASE: KnowledgeItem[] = [
  ...STOPS.map((s) => ({
    id: `stop_${s.id}`,
    title: s.name,
    content: `${s.name}: ${s.description}`,
    tags: [s.name.toLowerCase(), ...s.description.toLowerCase().split(' ').slice(0, 5)],
    category: 'stop' as const,
    stopId: s.id,
  })),
  {
    id: 'sacsayhuaman_general',
    title: 'Sacsayhuamán',
    content: 'Sacsayhuamán es una fortaleza ceremonial inca ubicada a 2 km al norte de Cusco, a 3,700 msnm. Su construcción comenzó durante el gobierno de Pachacútec (1438-1471) y continuó con sus sucesores. Es Patrimonio Mundial de la UNESCO desde 1983. El nombre significa "halcón saciado" o "lugar donde se sacia el halcón" en quechua. Los muros en zigzag representan los dientes del puma, animal que protege la ciudad del Cusco.',
    tags: ['sacsayhuamán', 'fortaleza', 'inca', 'cusco', 'patrimonio', 'pachacútec'],
    category: 'history',
  },
  {
    id: 'inca_empire',
    title: 'Imperio Inca',
    content: 'El Imperio Inca (Tawantinsuyu) fue el imperio más grande de la América precolombina, abarcando desde el sur de Colombia hasta el centro de Chile. Su capital era Cusco. Gobernado por el Sapa Inca, considerado hijo del Inti (dios Sol). La sociedad inca estaba organizada en ayllus (comunidades familiares) y basada en principios de reciprocidad y redistribución. Su economía no usaba moneda; funcionaba con trueque y trabajo colectivo (mita).',
    tags: ['inca', 'imperio', 'tawantinsuyu', 'cusco', 'sapa inca', 'historia'],
    category: 'history',
  },
  {
    id: 'inca_architecture',
    title: 'Arquitectura Inca',
    content: 'La arquitectura inca es famosa por sus muros de piedra perfectamente ensambladas sin usar mortero. Las piedras eran talladas con herramientas de bronce y piedra, y ajustadas mediante prueba y error hasta que encajaban perfectamente. Las construcciones más notables incluyen Sacsayhuamán (piedras de hasta 100 toneladas), Machu Picchu, y el Coricancha. Usaban tres estilos principales: rectangular simple, canchón (grandes recintos) y kallanka (grandes salones).',
    tags: ['arquitectura', 'piedra', 'construcción', 'megalítico', 'mortero'],
    category: 'architecture',
  },
  {
    id: 'andean_cosmology',
    title: 'Cosmología Andina',
    content: 'La cosmología andina divide el universo en tres mundos: Hanan Pacha (mundo de arriba, celestial, donde viven el Inti, Quilla y los dioses mayores), Kay Pacha (mundo de aquí, donde vivimos los humanos), y Ukhu Pacha (mundo de abajo, interior de la tierra, donde viven los ancestros y la Pachamama). Estos mundos no están separados — se comunican constantemente. El Inca era el puente entre Hanan Pacha y Kay Pacha.',
    tags: ['cosmología', 'hanan pacha', 'ukhu pacha', 'andino', 'pachamama', 'inti'],
    category: 'cosmology',
  },
  {
    id: 'pachamama',
    title: 'Pachamama',
    content: 'Pachamama es la diosa tierra en la cosmovisión andina. Es la madre de todos los seres vivos, la que provee alimentos, agua y protección. Se le ofrecen hojas de coca, chicha de jora, y ocasionalmente llamas en ceremonias especiales. La Pachamama no es una diosa distante — es la tierra misma, las montañas (apus), los ríos. Cualquier acción que dañe la tierra es una ofensa directa a ella.',
    tags: ['pachamama', 'diosa', 'tierra', 'madre', 'ofrenda', 'andes'],
    category: 'cosmology',
  },
  {
    id: 'inti_raymi',
    title: 'Inti Raymi',
    content: 'El Inti Raymi o "Fiesta del Sol" era la ceremonia más importante del Imperio Inca. Se celebraba cada 24 de junio durante el solsticio de invierno en el hemisferio sur. El Sapa Inca y los sacerdotes ofrecían sacrificios y bailes al dios Inti para asegurar buenas cosechas. Hoy en día se recrea anualmente en Sacsayhuamán frente a miles de visitantes.',
    tags: ['inti raymi', 'sol', 'ceremonia', 'fiesta', 'solsticio', 'cusco'],
    category: 'culture',
  },
  {
    id: 'quechua_language',
    title: 'Idioma Quechua',
    content: 'El quechua (Runa Simi) fue el idioma oficial del Imperio Inca y hoy es hablado por más de 8 millones de personas en Perú, Bolivia, Ecuador, Colombia, Chile y Argentina. "Rimay" significa "hablar" o "decir" en quechua. El nombre de la app viene de ahí. Algunas palabras quechuas comunes: Inti (sol), Quilla (luna), Pachamama (madre tierra), Apu (montaña sagrada), Wawa (niño/bebé), Ayllu (comunidad/familia).',
    tags: ['quechua', 'idioma', 'runa simi', 'rimay', 'lengua', 'andino'],
    category: 'language',
  },
  {
    id: 'coca_leaf',
    title: 'Hoja de Coca',
    content: 'La hoja de coca es una planta sagrada en los Andes desde hace más de 4,000 años. Se usa en rituales, como ofrenda a la Pachamama, para combatir el mal de altura (soroche), y como estimulante suave. Masticar hojas de coca (acullico) es una práctica tradicional que proporciona energía y alivia el hambre. No debe confundirse con la cocaína — la hoja en su estado natural no es dañina.',
    tags: ['coca', 'hoja', 'sagrado', 'ritual', 'ofrenda', 'pachamama'],
    category: 'culture',
  },
  {
    id: 'cusco_history',
    title: 'Cusco',
    content: 'Cusco (Qosqo en quechua, que significa "ombligo del mundo") fue la capital del Imperio Inca. Según la leyenda, fue fundada por Manco Cápac y Mama Ocllo después de emerger del Lago Titicaca. La ciudad fue diseñada en forma de puma, con Sacsayhuamán como la cabeza. Es la ciudad habitada más antigua de América, con más de 3,000 años de ocupación continua. Su centro histórico es Patrimonio Mundial de la UNESCO.',
    tags: ['cusco', 'qosqo', 'capital', 'inca', 'ombligo del mundo', 'historia'],
    category: 'history',
  },
  {
    id: 'apus',
    title: 'Apus (Montañas Sagradas)',
    content: 'Los apus son los espíritus de las montañas en la cosmovisión andina. Cada montaña tiene su propio apu que protege a las comunidades que viven a sus pies. Los apus son intermediarios entre los humanos y los dioses mayores. Las montañas más sagradas alrededor de Cusco incluyen el Ausangate, Salkantay, y Machu Picchu (la montaña joven).',
    tags: ['apus', 'montaña', 'sagrado', 'espíritu', 'andes', 'cosmovisión'],
    category: 'cosmology',
  },
  {
    id: 'chicha',
    title: 'Chicha de Jora',
    content: 'La chicha de jora es una bebida fermentada tradicional de los Andes, hecha de maíz (jora). Era una bebida ceremonial en el Imperio Inca, usada en ofrendas a la Pachamama y el Inti. Hoy en día sigue siendo popular en fiestas y celebraciones. Su preparación es un arte que pasa de generación en generación.',
    tags: ['chicha', 'bebida', 'maíz', 'fermentado', 'tradición', 'ritual'],
    category: 'culture',
  },
  {
    id: 'puma_meaning',
    title: 'El Puma en la Cultura Inca',
    content: 'El puma es uno de los animales más sagrados en la cosmovisión andina, junto con el cóndor (hanan pacha) y la serpiente (ukhu pacha). Representa el Kay Pacha — el mundo terrenal, la fuerza, la sabiduría y el poder. La ciudad del Cusco fue diseñada con forma de puma, con Sacsayhuamán como la cabeza y el Templo del Coricancha como la cola.',
    tags: ['puma', 'animal', 'sagrado', 'cusco', 'simbolismo', 'andeano'],
    category: 'cosmology',
  },
  {
    id: 'app_info',
    title: 'Rimay Guide',
    content: 'Rimay Guide es una guía de audio para tours en Cusco. Escuchá el Cusco como lo cuenta su gente. Podés navegar las paradas del tour, escuchar narraciones, ver tu ubicación en el mapa, descargar el tour para usarlo sin internet, y chatear con la IA sobre la cultura Inca. El nombre "Rimay" significa "hablar" en quechua.',
    tags: ['rimay', 'app', 'guía', 'audio', 'tour', 'cusco'],
    category: 'general',
  },
  {
    id: 'inca_roads',
    title: 'Camino Inca / Qhapaq Ñan',
    content: 'El Qhapaq Ñan (Camino Inca) era una red de caminos de más de 30,000 km que conectaba todo el Imperio Inca. Iba desde Colombia hasta Argentina y Chile. Los caminos tenían tambos (albergues) cada cierta distancia, y usaban chasquis (mensajeros) que corrían relevándose para llevar mensajes a lo largo del imperio en tiempo récord.',
    tags: ['qhapaq ñan', 'camino inca', 'chasqui', 'tambo', 'red vial', 'inca'],
    category: 'history',
  },
  {
    id: 'coricancha',
    title: 'Coricancha',
    content: 'El Coricancha (Templo del Sol) era el templo más importante del Imperio Inca. Sus muros estaban cubiertos con planchas de oro puro. Estaba dedicado al Inti (dios Sol) y a otras deidades incas. Hoy en día, sobre sus cimientos se encuentra el Convento de Santo Domingo. Es un símbolo perfecto del sincretismo entre la cultura inca y la española.',
    tags: ['coricancha', 'templo', 'sol', 'oro', 'inca', 'cusco'],
    category: 'architecture',
  },
  {
    id: 'machu_picchu',
    title: 'Machu Picchu',
    content: 'Machu Picchu ("Montaña Vieja" en quechua) fue construida alrededor de 1450 por el Inca Pachacútec como una residencia de descanso real y santuario religioso. Está ubicada a 2,430 msnm en el Valle Sagrado de los Incas. Fue redescubierta para el mundo occidental por Hiram Bingham en 1911. Es Patrimonio Mundial de la UNESCO y una de las Nuevas Siete Maravillas del Mundo Moderno.',
    tags: ['machu picchu', 'pachacútec', 'valle sagrado', 'maravilla', 'inca'],
    category: 'history',
  },
  {
    id: 'ceque_system',
    title: 'Sistema de Ceques',
    content: 'El sistema de ceques era una red de 41 líneas imaginarias que irradiaban desde el Coricancha en Cusco hacia los cuatro suyos (regiones) del imperio. Cada ceque tenía huacas (sitios sagrados) y estaba asociado con un grupo social, un color, y un significado astronómico. Este sistema organizaba no solo el espacio geográfico sino también el calendario ceremonial y la organización social inca.',
    tags: ['ceque', 'líneas', 'coricancha', 'astronomía', 'inca', 'huaca'],
    category: 'cosmology',
  },
  {
    id: 'mita_system',
    title: 'Sistema de Mita',
    content: 'La mita era un sistema de trabajo colectivo obligatorio en el Imperio Inca. Cada ayllu (comunidad) debía aportar trabajadores por turnos para construir caminos, puentes, templos y cultivos. A cambio, el estado inca proveía alimentos, bebida y protección. No era esclavitud — era un sistema de reciprocidad entre el estado y las comunidades.',
    tags: ['mita', 'trabajo', 'colectivo', 'inca', 'ayllu', 'sociedad'],
    category: 'history',
  },
  {
    id: 'quipus',
    title: 'Quipus',
    content: 'Los quipus eran sistemas de registro de información hechos con cuerdas anudadas. Los incas no tenían un sistema de escritura como el nuestro; los quipus funcionaban como su "memoria externa". Los quipucamayocs (expertos en quipus) registraban censos, tributos, fechas y eventos históricos. Los nudos y colores de las cuerdas codificaban información numérica y posiblemente narrativa.',
    tags: ['quipu', 'escritura', 'registro', 'inca', 'quipucamayoc', 'nudos'],
    category: 'history',
  },
];

export { KNOWLEDGE_BASE, STOPS };
export type { KnowledgeItem };
