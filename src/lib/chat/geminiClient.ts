import { GoogleGenerativeAI, type Content } from '@google/generative-ai';
import { buildSystemPrompt } from './tourContext';
import type { TourContext } from './tourContext';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

function buildHistory(messages: { role: 'user' | 'assistant'; content: string }[]): Content[] {
  // La API exige que el historial empiece con rol 'user': descartamos los
  // mensajes del asistente que quedaron al inicio (p. ej. tras recortar
  // los últimos N mensajes o mensajes de error previos).
  const firstUserIdx = messages.findIndex((m) => m.role === 'user');
  const trimmed = firstUserIdx === -1 ? [] : messages.slice(firstUserIdx);
  return trimmed.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
}

// Cadena de fallback: si un modelo está saturado (503) o falla antes de
// emitir texto, se intenta con el siguiente.
const MODEL_CHAIN = ['gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-2.0-flash'];

async function* handleOnlineQuery(
  query: string,
  context: TourContext,
  history: { role: 'user' | 'assistant'; content: string }[]
): AsyncGenerator<string> {
  if (!genAI) {
    yield 'No hay API key de Gemini configurada. Agregá VITE_GEMINI_API_KEY en tu archivo .env para usar el chat con IA online. Mientras tanto, el chat funciona en modo offline con contenido local.';
    return;
  }

  let lastError: unknown = null;

  for (const modelName of MODEL_CHAIN) {
    const model = genAI.getGenerativeModel(
      { model: modelName, systemInstruction: buildSystemPrompt(context) },
      { apiVersion: 'v1beta' },
    );

    const chat = model.startChat({
      history: buildHistory(history.slice(-10)),
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });

    let yieldedAny = false;
    try {
      const result = await chat.sendMessageStream(query);
      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yieldedAny = true;
          yield text;
        }
      }
      return;
    } catch (error) {
      lastError = error;
      // Si ya emitió parte de la respuesta, no reintentamos para no duplicar.
      if (yieldedAny) break;
    }
  }

  yield `Lo siento, la IA está saturada en este momento y no pudo responder. ${
    lastError instanceof Error ? `(${lastError.message})` : ''
  }\n\nProbá de nuevo en unos segundos, o usá el chat en modo offline.`;
}

export { handleOnlineQuery };
