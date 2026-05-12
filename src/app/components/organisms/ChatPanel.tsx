import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useChatStore, type Message } from '@/stores/chatStore';
import { useTourStore } from '@/stores/tourStore';
import { useAuthStore } from '@/stores/authStore';
import { MessageCircle, Send, X, Trash2, Wifi, WifiOff } from 'lucide-react';

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-[var(--terracotta)] text-white rounded-br-md'
            : 'bg-[var(--stone-gray)] text-[var(--dark-charcoal)] rounded-bl-md'
        }`}
      >
        {message.content.split('\n').map((line, i) => (
          <span key={i}>
            {i > 0 && <br />}
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="bg-[var(--stone-gray)] rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-[var(--muted-foreground)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-[var(--muted-foreground)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-[var(--muted-foreground)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export function ChatPanel({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const messages = useChatStore((s) => s.messages);
  const isLoading = useChatStore((s) => s.isLoading);
  const isOnline = useChatStore((s) => s.isOnline);
  const streamingContent = useChatStore((s) => s.streamingContent);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const clearChat = useChatStore((s) => s.clearChat);

  const tour = useTourStore((s) => s.tour);
  const currentStopIndex = useTourStore((s) => s.currentStopIndex);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setInput('');

    const currentStop = tour?.stops[currentStopIndex];
    await sendMessage(trimmed, {
      currentStopId: currentStop ? Number(currentStop.id) : 3,
      stops: tour?.stops.map((s) => ({
        id: Number(s.id),
        name: s.name,
        status: s.isCompleted ? 'completed' : 'future',
      })) ?? [],
    });
  };

  const allMessages = streamingContent
    ? [...messages, { id: 'streaming', role: 'assistant' as const, content: streamingContent, timestamp: Date.now() }]
    : messages;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--terracotta)] flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-[var(--dark-charcoal)]">Rimay IA</h2>
            <div className="flex items-center gap-1">
              {isOnline ? (
                <Wifi className="w-3 h-3 text-green-500" />
              ) : (
                <WifiOff className="w-3 h-3 text-orange-500" />
              )}
              <span className="text-xs text-[var(--muted-foreground)]">
                {isOnline ? 'Conectado' : 'Modo offline'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
            title="Limpiar chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {allMessages.filter((m) => m.content || m.id === 'streaming').map((msg) => (
          msg.id === 'streaming'
            ? (
              <div key="streaming" className="flex justify-start mb-3">
                <div className="max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed bg-[var(--stone-gray)] text-[var(--dark-charcoal)] rounded-bl-md">
                  {msg.content}
                  <span className="inline-block w-1 h-4 bg-[var(--terracotta)] ml-0.5 animate-pulse" />
                </div>
              </div>
            )
            : <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && !streamingContent && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Preguntale a Rimay IA..."
            className="flex-1 h-11 rounded-xl bg-[var(--warm-white)] border border-gray-200 px-4 text-sm text-[var(--dark-charcoal)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--terracotta)] focus:ring-1 focus:ring-[var(--terracotta)]/20"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 rounded-xl bg-[var(--terracotta)] text-white flex items-center justify-center disabled:opacity-40 transition-opacity hover:bg-[#8B4513]"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
