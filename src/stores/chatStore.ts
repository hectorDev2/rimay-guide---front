import { create } from 'zustand';
import { handleOnlineQuery } from '@/lib/chat/geminiClient';
import { handleOfflineQuery } from '@/lib/chat/offlineSearch';
import type { TourContext } from '@/lib/chat/tourContext';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatState {
  messages: Message[];
  isOpen: boolean;
  isLoading: boolean;
  isOnline: boolean;
  streamingContent: string;
  sendMessage: (content: string, context: TourContext) => Promise<void>;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  clearChat: () => void;
}

function generateId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function detectOnline(): boolean {
  return navigator.onLine && !!import.meta.env.VITE_GEMINI_API_KEY;
}

let saved: string | null = null;
try {
  saved = typeof window !== 'undefined'
    ? localStorage.getItem('rimay_chat_messages')
    : null;
} catch {
  saved = null;
}

let parsedSaved: Message[] | null = null;
if (saved) {
  try {
    parsedSaved = JSON.parse(saved);
    if (!Array.isArray(parsedSaved)) parsedSaved = null;
  } catch {
    parsedSaved = null;
  }
}

const initialMessages: Message[] = parsedSaved ?? [
      {
        id: 'welcome',
        role: 'assistant',
        content: '🏔️ ¡Hola! Soy Rimay IA, tu guía virtual. Preguntame lo que quieras sobre Sacsayhuamán, la cultura Inca, o cualquier cosa del tour. ¿En qué puedo ayudarte?',
        timestamp: Date.now(),
      },
    ];

export const useChatStore = create<ChatState>((set, get) => ({
  messages: initialMessages,
  isOpen: false,
  isLoading: false,
  isOnline: detectOnline(),
  streamingContent: '',

  sendMessage: async (content: string, context: TourContext) => {
    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const history = get().messages
      .filter((m) => m.id !== 'welcome')
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    set((s) => ({
      messages: [...s.messages, userMsg],
      isLoading: true,
      isOnline: detectOnline(),
      streamingContent: '',
    }));

    const isOnline = detectOnline();

    try {
      if (isOnline) {
        let fullResponse = '';
        for await (const chunk of handleOnlineQuery(content, context, history)) {
          fullResponse += chunk;
          set({ streamingContent: fullResponse });
        }

        const assistantMsg: Message = {
          id: generateId(),
          role: 'assistant',
          content: fullResponse,
          timestamp: Date.now(),
        };

        set((s) => ({
          messages: [...s.messages, assistantMsg],
          isLoading: false,
          streamingContent: '',
        }));
      } else {
        const response = await handleOfflineQuery(content, context);
        const assistantMsg: Message = {
          id: generateId(),
          role: 'assistant',
          content: response,
          timestamp: Date.now(),
        };

        set((s) => ({
          messages: [...s.messages, assistantMsg],
          isLoading: false,
          streamingContent: '',
        }));
      }
    } catch (error) {
      const errorMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: `Lo siento, hubo un error al procesar tu mensaje. ${error instanceof Error ? error.message : 'Intentalo de nuevo.'}`,
        timestamp: Date.now(),
      };

      set((s) => ({
        messages: [...s.messages, errorMsg],
        isLoading: false,
        streamingContent: '',
      }));
    }

    const currentMessages = get().messages;
    localStorage.setItem('rimay_chat_messages', JSON.stringify(currentMessages));
  },

  toggleChat: () => set((s) => ({ isOpen: !s.isOpen })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),

  clearChat: () => {
    const welcome: Message = {
      id: 'welcome',
      role: 'assistant',
      content: '🏔️ ¡Hola! Soy Rimay IA, tu guía virtual. Preguntame lo que quieras sobre Sacsayhuamán, la cultura Inca, o cualquier cosa del tour. ¿En qué puedo ayudarte?',
      timestamp: Date.now(),
    };
    set({ messages: [welcome] });
    localStorage.setItem('rimay_chat_messages', JSON.stringify([welcome]));
  },
}));
