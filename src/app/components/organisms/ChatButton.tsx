import { MessageCircle, X } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';

export function ChatButton() {
  const isOpen = useChatStore((s) => s.isOpen);
  const toggleChat = useChatStore((s) => s.toggleChat);

  return (
    <button
      onClick={toggleChat}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[var(--terracotta)] text-white shadow-lg shadow-[var(--terracotta)]/30 flex items-center justify-center hover:bg-[#8B4513] transition-all active:scale-95"
      aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat'}
    >
      {isOpen ? (
        <X className="w-6 h-6" />
      ) : (
        <MessageCircle className="w-6 h-6" />
      )}
    </button>
  );
}
