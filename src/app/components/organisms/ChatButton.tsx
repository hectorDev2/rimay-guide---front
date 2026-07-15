import { MessageCircle, X } from "lucide-react";
import { useChatStore } from "@/stores/chatStore";

export function ChatButton() {
  const isOpen = useChatStore((s) => s.isOpen);
  const toggleChat = useChatStore((s) => s.toggleChat);

  return (
    <button
      onClick={toggleChat}
      className="fixed top-[32px] right-6 z-50 w-14 h-14 rounded-full bg-[#E6FF00] text-[#111111] shadow-[0_8px_20px_rgba(230,255,0,0.3)] flex items-center justify-center hover:bg-[#D6F500] transition-all active:scale-90"
      aria-label={isOpen ? "Cerrar chat" : "Abrir chat"}
    >
      {isOpen ? (
        <X className="w-6 h-6" />
      ) : (
        <MessageCircle className="w-6 h-6" />
      )}
    </button>
  );
}
