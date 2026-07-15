export type GuideEvent =
  | 'start'
  | 'walking'
  | 'approaching'
  | 'almost'
  | 'arrived'
  | 'wrong_direction'
  | 'off_route'
  | 'gps_weak'
  | 'resume';

/** {stop} se reemplaza por el nombre de la parada; {m} por metros restantes. */
const MESSAGES: Record<GuideEvent, string[]> = {
  start: [
    'Empecemos. Te llevo hacia {stop}.',
    'Listo, caminemos. Primera parada: {stop}.',
    'Vamos — {stop} nos espera.',
  ],
  walking: [
    'Sigue este camino hacia {stop}.',
    'Vamos bien. {stop} está adelante.',
    'Buen ritmo — seguimos hacia {stop}.',
  ],
  approaching: [
    'Ya casi — {stop} está a unos {m} metros.',
    '{stop} aparece adelante. Unos {m} metros más.',
    'Atento: en {m} metros llegamos a {stop}.',
  ],
  almost: [
    'Solo {m} metros. Ve levantando la vista.',
    'Últimos {m} metros — ya puedes verlo.',
    'Estamos llegando. {m} metros.',
  ],
  arrived: [
    'Llegamos a {stop}. Escucha esto…',
    'Aquí es: {stop}. Te cuento su historia.',
    'Bienvenido a {stop}.',
  ],
  wrong_direction: [
    'Mmm, creo que vamos al revés — {stop} queda detrás de ti.',
    'Un momento: {stop} está en la otra dirección.',
    'Date la vuelta cuando puedas; nos alejamos de {stop}.',
  ],
  off_route: [
    'Sin problema — retomamos por aquí.',
    'Nos salimos un poco del camino. Sigue la línea punteada.',
    'Tranquilo, la ruta está cerca. Te marco el regreso.',
  ],
  gps_weak: [
    'La señal baila un poco entre estos muros — sigue por el camino y te aviso al llegar.',
    'El GPS está algo impreciso aquí. Continúa; yo sigo atento.',
  ],
  resume: [
    'Seguimos. Próxima parada: {stop}.',
    'Continuamos el recorrido hacia {stop}.',
    '¿Listo? Vamos a {stop}.',
  ],
};

const lastIndexByEvent = new Map<GuideEvent, number>();

/** Elige una variante distinta a la última usada para ese evento. */
export function guideMessage(
  event: GuideEvent,
  params: { stop?: string; m?: number } = {},
): string {
  const options = MESSAGES[event];
  const last = lastIndexByEvent.get(event) ?? -1;
  let idx = Math.floor(Math.random() * options.length);
  if (options.length > 1 && idx === last) idx = (idx + 1) % options.length;
  lastIndexByEvent.set(event, idx);
  return options[idx]
    .replace('{stop}', params.stop ?? '')
    .replace('{m}', String(params.m ?? ''));
}
