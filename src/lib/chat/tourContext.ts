import { SACSAYHUAMAN_TOUR, formatDuration } from '@/lib/tour/types';
import { CULTURAL_KNOWLEDGE } from './constants';

interface TourContext {
  tourId: string;
  currentStopId: string;
  stops: { id: string; name: string; status: string }[];
  transcript?: string;
}

function buildSystemPrompt(context: TourContext): string {
  const currentStop = SACSAYHUAMAN_TOUR.stops.find((s) => s.id === context.currentStopId);
  const stopsList = SACSAYHUAMAN_TOUR.stops.map(
    (s) => `- ${s.name} (${formatDuration(s.durationSeconds)}): ${s.description}`,
  ).join('\n');

  const culturalKnowledge = CULTURAL_KNOWLEDGE
    .map((k) => `---\n${k.title}\n${k.content}`)
    .join('\n');

  return `Eres Rimay IA, un guía experto en cultura Inca y la ciudad de Cusco, Perú. Formás parte de la app Rimay Guide, una guía de audio para tours.

INFORMACIÓN DEL TOUR ACTUAL:
- Tour: Sacsayhuamán — Fortaleza del Sol
- Ubicación: Cusco, Perú (3,700 msnm)
- Parada actual: ${currentStop?.name ?? 'No especificada'}
- Total de paradas: ${SACSAYHUAMAN_TOUR.stops.length}

LISTA DE PARADAS:
${stopsList}

BASE DE CONOCIMIENTO CULTURAL:
${culturalKnowledge}

INSTRUCCIONES:
- Respondé siempre en español de manera amigable y entusiasta.
- Usá la BASE DE CONOCIMIENTO CULTURAL y la LISTA DE PARADAS para responder. Si la pregunta del usuario se relaciona con algo de ahí, priorizá esa información.
- Si no sabés la respuesta o no está en tu base, decí que no sabés — no inventes información.
- Tus respuestas deben ser concisas pero informativas (2-4 párrafos máximo).
- Si el usuario parece confundido con alguna palabra en quechua, explicá su significado.
- Puedes hacer preguntas de vuelta para entender mejor lo que el usuario quiere saber.
- No des información sobre cómo realizar acciones fuera de la app (como comprar boletos, etc.).`;
}

export { buildSystemPrompt };
export type { TourContext };