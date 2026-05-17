import Fuse from 'fuse.js';
import { KNOWLEDGE_BASE } from './constants';
import { SACSAYHUAMAN_TOUR } from '@/lib/tour/types';
import type { TourContext } from './tourContext';

const fuse = new Fuse(KNOWLEDGE_BASE, {
  keys: [
    { name: 'title', weight: 2 },
    { name: 'content', weight: 1 },
    { name: 'tags', weight: 1.5 },
  ],
  threshold: 0.4,
  includeScore: true,
});

function search(query: string, limit: number = 3): string[] {
  const results = fuse.search(query, { limit });
  return results.map((r) => r.item.content);
}

function formatResponse(results: string[], query: string): string {
  if (results.length === 0) {
    const lower = query.toLowerCase();

    if (lower.includes('hola') || lower.includes('buenas') || lower.includes('qué tal')) {
      return '¡Hola! 🏔️ Soy Rimay IA, tu guía virtual. Preguntame lo que quieras sobre Sacsayhuamán, la cultura Inca, o el tour que estás haciendo. ¿En qué puedo ayudarte?';
    }

    if (lower.includes('gracias') || lower.includes('graciela')) {
      return '¡De nada! Disfrutá tu recorrido por Sacsayhuamán. Si tenés más preguntas, acá estoy. 😊';
    }

    const currentStop = SACSAYHUAMAN_TOUR.stops.find(
      (s) => lower.includes(s.name.toLowerCase().slice(0, 6))
    );
    if (currentStop) {
      return currentStop.description;
    }

    return 'Buena pregunta. No tengo esa información específica en mi base de conocimiento local. Cuando tengas conexión a internet, puedo consultar más datos. ¿Querés preguntarme sobre otra cosa del tour o de la cultura Inca?';
  }

  if (results.length === 1) {
    return results[0];
  }

  return results.map((r, i) => `${i + 1}. ${r}`).join('\n\n');
}

async function handleOfflineQuery(query: string, _context: TourContext): Promise<string> {
  await new Promise((r) => setTimeout(r, 300));
  const results = search(query);
  return formatResponse(results, query);
}

export { handleOfflineQuery, search };
