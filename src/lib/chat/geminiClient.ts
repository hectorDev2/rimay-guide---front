import { GoogleGenerativeAI, type Content } from '@google/generative-ai';
import { buildSystemPrompt } from './tourContext';
import type { TourContext } from './tourContext';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

function buildHistory(messages: { role: 'user' | 'assistant'; content: string }[]): Content[] {
  return messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
}

async function* handleOnlineQuery(
  query: string,
  context: TourContext,
  history: { role: 'user' | 'assistant'; content: string }[]
): AsyncGenerator<string> {
  if (!genAI) {
    yield 'No hay API key de Gemini configurada. Agregá VITE_GEMINI_API_KEY en tu archivo .env para usar el chat con IA online. Mientras tanto, el chat funciona en modo offline con contenido local.';
    return;
  }

  const model = genAI.getGenerativeModel(
    { model: 'gemini-3-flash-preview', systemInstruction: buildSystemPrompt(context) },
    { apiVersion: 'v1beta' },
  );

  const chat = model.startChat({
    history: buildHistory(history.slice(-10)),
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.7,
    },
  });

  try {
    const result = await chat.sendMessageStream(query);
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  } catch (error) {
    yield `Lo siento, hubo un error al conectar con la IA. ${
      error instanceof Error ? error.message : ''
    }\n\nPuedes seguir usando el chat en modo offline mientras tanto.`;
  }
}

export { handleOnlineQuery };
