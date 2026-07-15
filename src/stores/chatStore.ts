import { create } from 'zustand';
import { handleOnlineQuery } from '@/lib/chat/geminiClient';
import { handleOfflineQuery } from '@/lib/chat/offlineSearch';
import type { TourContext } from '@/lib/chat/tourContext';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from './authStore';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  feedback?: number | null;
}

interface ChatState {
  messages: Message[];
  isOpen: boolean;
  isLoading: boolean;
  isOnline: boolean;
  streamingContent: string;
  currentSessionId: string | null;
  sendMessage: (content: string, context: TourContext) => Promise<void>;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  clearChat: () => void;
  resetLocal: () => void;
  updateFeedback: (messageId: string, value: 1 | -1 | null) => Promise<void>;
  loadSession: (tourId?: string) => Promise<void>;
}

function generateId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function detectOnline(): boolean {
  return navigator.onLine && !!import.meta.env.VITE_GEMINI_API_KEY;
}

let saved: string | null = null;
let sessionSaved: string | null = null;
try {
  saved = typeof window !== 'undefined'
    ? localStorage.getItem('rimay_chat_messages')
    : null;
  sessionSaved = typeof window !== 'undefined'
    ? localStorage.getItem('rimay_chat_session')
    : null;
} catch {
  saved = null;
  sessionSaved = null;
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

let parsedSession: { id: string } | null = null;
if (sessionSaved) {
  try {
    parsedSession = JSON.parse(sessionSaved);
  } catch {
    parsedSession = null;
  }
}

function createWelcome(): Message {
  return {
    id: 'welcome',
    role: 'assistant',
    content: '🏔️ ¡Hola! Soy Rimay IA, tu guía virtual. Preguntame lo que quieras sobre Sacsayhuamán, la cultura Inca, o cualquier cosa del tour. ¿En qué puedo ayudarte?',
    timestamp: Date.now(),
  };
}

const initialMessages: Message[] = parsedSaved ?? [createWelcome()];

function saveToLocal(messages: Message[], sessionId?: string | null) {
  try {
    localStorage.setItem('rimay_chat_messages', JSON.stringify(messages));
    if (sessionId) {
      localStorage.setItem('rimay_chat_session', JSON.stringify({ id: sessionId }));
    } else {
      localStorage.removeItem('rimay_chat_session');
    }
  } catch {
    // localStorage lleno o no disponible
  }
}

function queuePendingSync(messageIds: string[]) {
  try {
    const existing: string[] = JSON.parse(localStorage.getItem('rimay_chat_pending') || '[]');
    localStorage.setItem('rimay_chat_pending', JSON.stringify([...existing, ...messageIds]));
  } catch {
    // localStorage no disponible
  }
}

async function processPendingSync(messages: Message[], sessionId: string) {
  let pending: string[] = [];
  try {
    pending = JSON.parse(localStorage.getItem('rimay_chat_pending') || '[]');
  } catch {}

  if (pending.length === 0) return;

  const toSync = messages.filter((m) => pending.includes(m.id));
  if (toSync.length > 0) {
    await supabase.from('chat_messages').upsert(
      toSync.map((m) => ({
        id: m.id,
        session_id: sessionId,
        role: m.role,
        content: m.content,
      }))
    );
  }

  try {
    localStorage.setItem('rimay_chat_pending', '[]');
  } catch {}
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: initialMessages,
  isOpen: false,
  isLoading: false,
  isOnline: detectOnline(),
  streamingContent: '',
  currentSessionId: parsedSession?.id ?? null,

  loadSession: async (tourId?: string) => {
    const user = useAuthStore.getState().user;
    if (!user || !detectOnline() || !tourId) return;

    const { data: session } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('tour_id', tourId)
      .maybeSingle();

    if (!session) return;

    set({ currentSessionId: session.id });

    const { data: rows } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at');

    if (!rows || rows.length === 0) {
      saveToLocal(get().messages, session.id);
      return;
    }

    const loaded: Message[] = rows.map((r) => ({
      id: r.id,
      role: r.role,
      content: r.content,
      timestamp: new Date(r.created_at).getTime(),
      feedback: r.feedback,
    }));

    const messages = [createWelcome(), ...loaded];
    set({ messages });
    saveToLocal(messages, session.id);
  },

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

        const user = useAuthStore.getState().user;
        let sessionId = get().currentSessionId;
        if (user && context.tourId) {
          if (!sessionId) {
            const { data: existing } = await supabase
              .from('chat_sessions')
              .select('id')
              .eq('user_id', user.id)
              .eq('tour_id', context.tourId)
              .maybeSingle();

            if (existing) {
              sessionId = existing.id;
            } else {
              const { data: created } = await supabase
                .from('chat_sessions')
                .insert({ user_id: user.id, tour_id: context.tourId })
                .select('id')
                .single();
              sessionId = created?.id ?? null;
            }

            if (sessionId) set({ currentSessionId: sessionId });
          }

          if (sessionId) {
            await supabase.from('chat_messages').upsert([
              { id: userMsg.id, session_id: sessionId, role: 'user', content: userMsg.content },
              { id: assistantMsg.id, session_id: sessionId, role: 'assistant', content: assistantMsg.content },
            ]);

            await processPendingSync(get().messages, sessionId);
          }
        }

        const currentMessages = get().messages;
        saveToLocal(currentMessages, get().currentSessionId);
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

        queuePendingSync([userMsg.id, assistantMsg.id]);

        const currentMessages = get().messages;
        saveToLocal(currentMessages, get().currentSessionId);
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

      saveToLocal(get().messages, get().currentSessionId);
    }
  },

  toggleChat: () => set((s) => ({ isOpen: !s.isOpen })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),

  // Reset local sin tocar el historial en la nube: se usa al cerrar sesión
  // para que el próximo usuario arranque con un chat limpio.
  resetLocal: () => {
    set({ messages: [createWelcome()], currentSessionId: null, isOpen: false, streamingContent: '' });
    saveToLocal([createWelcome()], null);
    try {
      localStorage.removeItem('rimay_chat_pending');
    } catch {}
  },

  clearChat: () => {
    const sessionId = get().currentSessionId;
    const user = useAuthStore.getState().user;

    if (sessionId && user && detectOnline()) {
      supabase.from('chat_messages').delete().eq('session_id', sessionId).then(() => {
        supabase.from('chat_sessions').delete().eq('id', sessionId).then(() => {});
      }).catch(() => {});
    }

    set({ messages: [createWelcome()], currentSessionId: null });
    saveToLocal([createWelcome()], null);
  },

  updateFeedback: async (messageId: string, value: 1 | -1 | null) => {
    const msg = get().messages.find((m) => m.id === messageId);
    if (!msg) return;

    const updated = value === msg.feedback ? null : value;
    const newFeedback = updated;

    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === messageId ? { ...m, feedback: newFeedback } : m
      ),
    }));

    const sessionId = get().currentSessionId;
    if (sessionId && detectOnline()) {
      const user = useAuthStore.getState().user;
      if (user) {
        await supabase
          .from('chat_messages')
          .update({ feedback: newFeedback })
          .eq('id', messageId);
      }
    }

    saveToLocal(get().messages, sessionId);
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    const online = detectOnline();
    useChatStore.setState({ isOnline: online });
    if (online) {
      const state = useChatStore.getState();
      if (state.currentSessionId) {
        processPendingSync(state.messages, state.currentSessionId).catch(() => {});
      }
    }
  });

  window.addEventListener('offline', () => {
    useChatStore.setState({ isOnline: false });
  });
}
