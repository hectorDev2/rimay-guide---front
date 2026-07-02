import { useState, useRef, useEffect, useCallback, useMemo, type FormEvent } from 'react';
import { useChatStore, type Message } from '@/stores/chatStore';
import { useTourStore } from '@/stores/tourStore';
import type { Tour } from '@/lib/tour/types';
import { MessageCircle, Send, X, Trash2, Wifi, WifiOff, ThumbsUp, ThumbsDown, ArrowDown } from 'lucide-react';

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

function renderContent(content: string): React.JSX.Element[] {
  const elements: React.JSX.Element[] = [];
  const lines = content.split('\n');

  lines.forEach((line, li) => {
    if (li > 0) elements.push(<br key={`br-${li}`} />);

    const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
    parts.forEach((part, pi) => {
      if (!part) return;
      if (part.startsWith('**') && part.endsWith('**')) {
        elements.push(<strong key={`${li}-${pi}`}>{part.slice(2, -2)}</strong>);
      } else if (part.startsWith('`') && part.endsWith('`')) {
        elements.push(<code key={`${li}-${pi}`} className="bg-[#2C2C2C] px-1 rounded text-[#E6FF00] text-xs font-mono">{part.slice(1, -1)}</code>);
      } else {
        elements.push(<span key={`${li}-${pi}`}>{part}</span>);
      }
    });
  });

  return elements;
}

function buildContextualQuestions(tour: Tour | null, stopIndex: number): string[] {
  const stop = tour?.stops[stopIndex];
  if (!stop) return [
    'Contame sobre la cultura Inca',
    '¿Qué significa Sacsayhuamán?',
    '¿Qué más puedo ver cerca?',
  ];

  const stopName = stop.name.split('—')[0]?.trim() ?? stop.name;
  const lower = (stop.description + ' ' + stop.culturalContext).toLowerCase();

  const questions: string[] = [
    `¿Qué destaca de ${stopName}?`,
  ];

  if (lower.includes('piedra') || lower.includes('muro') || lower.includes('construcci'))
    questions.push(`¿Cómo construyeron los muros de ${stopName}?`);
  else if (lower.includes('ceremonia') || lower.includes('ritual') || lower.includes('culto'))
    questions.push(`¿Qué ceremonias se hacían en ${stopName}?`);
  else
    questions.push(`¿Qué historia hay detrás de ${stopName}?`);

  if (lower.includes('sol') || lower.includes('luna') || lower.includes('inti') || lower.includes('quilla') || lower.includes('astronom'))
    questions.push('¿Cómo se relaciona con la astronomía inca?');
  else if (lower.includes('pachamama') || lower.includes('tierra') || lower.includes('apu'))
    questions.push('¿Qué rol tiene la Pachamama en este lugar?');
  else
    questions.push('Contame sobre la cultura Inca');

  questions.push('¿Qué más puedo ver cerca?');
  return questions;
}

function MessageBubble({ message, onFeedback }: { message: Message; onFeedback?: (value: 1 | -1 | null) => void }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-3`}>
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-[#E6FF00] text-[#111111] rounded-br-md'
            : 'bg-[#1E1E1E] text-white rounded-bl-md border border-[#2C2C2C]'
        }`}
      >
        <div>{renderContent(message.content)}</div>
        {!isUser && onFeedback && (
          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-[#2C2C2C]">
            <button
              onClick={() => onFeedback(message.feedback === 1 ? null : 1)}
              className={`p-1 rounded transition-colors ${
                message.feedback === 1 ? 'text-[#E6FF00]' : 'text-[#6E6E6E] hover:text-[#E6FF00]'
              }`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onFeedback(message.feedback === -1 ? null : -1)}
              className={`p-1 rounded transition-colors ${
                message.feedback === -1 ? 'text-[#FF4D67]' : 'text-[#6E6E6E] hover:text-[#FF4D67]'
              }`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
      <span className="text-[10px] text-[#4A4A4A] mt-1 px-1">{formatTime(message.timestamp)}</span>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="bg-[#1E1E1E] rounded-2xl rounded-bl-md px-4 py-3 border border-[#2C2C2C]">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-[#6E6E6E] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-[#6E6E6E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-[#6E6E6E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export function ChatPanel({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState('');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const messages = useChatStore((s) => s.messages);
  const isLoading = useChatStore((s) => s.isLoading);
  const isOnline = useChatStore((s) => s.isOnline);
  const streamingContent = useChatStore((s) => s.streamingContent);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const clearChat = useChatStore((s) => s.clearChat);
  const loadSession = useChatStore((s) => s.loadSession);
  const updateFeedback = useChatStore((s) => s.updateFeedback);

  const tour = useTourStore((s) => s.tour);
  const currentStopIndex = useTourStore((s) => s.currentStopIndex);
  const completedIds = useTourStore((s) => s.completedIds);

  const builtQuestions = useMemo(
    () => buildContextualQuestions(tour, currentStopIndex),
    [tour, currentStopIndex],
  );

  const userMessages = messages.filter((m) => m.id !== 'welcome');
  const showSuggestions = userMessages.length === 0 && !isLoading;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(dist > 120);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  useEffect(() => {
    inputRef.current?.focus();
    loadSession(tour?.id);
  }, []);

  useEffect(() => {
    if (isOnline) loadSession(tour?.id);
  }, [isOnline]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setInput('');

    const currentStop = tour?.stops[currentStopIndex];
    const currentId = currentStop?.id ?? tour?.stops[0]?.id ?? '';
    await sendMessage(trimmed, {
      tourId: tour?.id ?? '',
      currentStopId: currentId,
      stops: tour?.stops.map((s) => ({
        id: s.id,
        name: s.name,
        status: completedIds.includes(s.id) ? 'completed' : 'future',
      })) ?? [],
    });
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  const allMessages = streamingContent
    ? [...messages, { id: 'streaming', role: 'assistant' as const, content: streamingContent, timestamp: Date.now() }]
    : messages;

  return (
    <div className="flex flex-col h-full bg-[#0E0E0E]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2C2C2C]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#E6FF00] flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-[#111111]" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-white">Rimay IA</h2>
            <div className="flex items-center gap-1">
              {isOnline ? (
                <Wifi className="w-3 h-3 text-[#AFFF00]" />
              ) : (
                <WifiOff className="w-3 h-3 text-[#FFB84D]" />
              )}
              <span className="text-xs text-[#6E6E6E]">
                {isOnline ? 'Conectado' : 'Modo offline'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="p-2 rounded-xl hover:bg-[#1E1E1E] text-[#6E6E6E] hover:text-[#FF4D67] transition-colors"
            title="Limpiar chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[#1E1E1E] text-[#6E6E6E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        {showSuggestions && (
          <div className="mb-4">
            <p className="text-xs text-[#6E6E6E] mb-2">Preguntas sugeridas:</p>
            <div className="flex flex-wrap gap-2">
              {builtQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleQuickQuestion(q)}
                  className="px-3 py-1.5 rounded-full text-xs bg-[#1E1E1E] text-[#A0A0A0] border border-[#2C2C2C] hover:border-[#E6FF00] hover:text-white transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {allMessages.filter((m) => m.content || m.id === 'streaming').map((msg) => (
          msg.id === 'streaming'
            ? (
              <div key="streaming" className="flex flex-col items-start mb-3">
                <div className="max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed bg-[#1E1E1E] text-white rounded-bl-md border border-[#2C2C2C]">
                  {renderContent(msg.content)}
                  <span className="inline-block w-1 h-4 bg-[#E6FF00] ml-0.5 animate-pulse" />
                </div>
              </div>
            )
            : <MessageBubble key={msg.id} message={msg} onFeedback={(v) => updateFeedback(msg.id, v)} />
        ))}
        {isLoading && !streamingContent && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {showScrollBtn && (
        <div className="relative">
          <button
            onClick={scrollToBottom}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#1E1E1E] border border-[#2C2C2C] text-[#6E6E6E] hover:text-white hover:border-[#E6FF00] flex items-center justify-center transition-colors shadow-lg z-10 animate-bounce"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="border-t border-[#2C2C2C] p-4">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregúntale a Rimay IA..."
            className="flex-1 h-11 rounded-full bg-[#1B1B1B] border border-[#2C2C2C] px-4 text-sm text-white placeholder:text-[#6E6E6E] focus:outline-none focus:border-[#E6FF00] focus:ring-1 focus:ring-[#E6FF00]/20"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 rounded-full bg-[#E6FF00] text-[#111111] flex items-center justify-center disabled:opacity-40 transition-opacity hover:bg-[#D6F500] active:scale-90"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
