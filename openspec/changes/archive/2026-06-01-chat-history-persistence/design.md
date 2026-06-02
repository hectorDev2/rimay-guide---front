# Design: Chat History Persistence

## Technical Approach

Tres capas: **Supabase** (fuente de verdad), **localStorage** (caché offline), **Zustand store** (estado en memoria). La store sincroniza en segundo plano con Supabase cuando hay conexión; cuando no, escribe solo a localStorage y encola para sync posterior. El feedback (thumbs up/down) se envía como UPDATE directo a `chat_messages`.

## Architecture Decisions

### Decision: Tabla chat_sessions separada vs. session_id en messages

**Choice**: Tabla `chat_sessions` independiente con FK en `chat_messages`
**Alternatives**: Embed session metadata in messages table, no sessions at all
**Rationale**: Permite tracking de sesión por `(user_id, tour_id)` con `UNIQUE` constraint, consultas eficientes por sesión, y cleanup sencillo

### Decision: localStorage como cache, no source of truth

**Choice**: localStorage se usa como fallback offline y caché local
**Alternatives**: localStorage como única fuente con sync periódico
**Rationale**: La app es PWA — el usuario puede estar offline. localStorage garantiza acceso inmediato sin depender de red. Supabase es el source of truth para consistencia cross-device

### Decision: Feedback como columna en chat_messages

**Choice**: `feedback INTEGER CHECK (IN (1, -1, NULL))` en la misma tabla
**Alternatives**: Tabla separada `message_feedback`
**Rationale**: Relación 1:1 entre mensaje y feedback, evita JOIN innecesario, schema más simple

## Data Flow

```
ChatPanel (UI)
    │
    ▼
chatStore.sendMessage()
    │
    ├── Online ──► Supabase UPSERT (chat_messages)
    │                  │
    │                  ▼
    │              chat_sessions (first msg only)
    │
    └── Offline ──► localStorage (rimay_chat_messages)
                       │
                       └── online event ──► Supabase UPSERT batch

chatStore.updateFeedback(msgId, value)
    │
    └── Supabase UPDATE chat_messages SET feedback = $value
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `docs/supabase-schema.sql` | Modify | Agregar tablas chat_sessions, chat_messages + RLS + seed |
| `src/lib/supabase/types.ts` | Modify | Agregar ChatSessionRow, ChatMessageRow |
| `src/stores/chatStore.ts` | Modify | Refactor persistencia, agregar session mgmt, updateFeedback |
| `src/app/components/organisms/ChatPanel.tsx` | Modify | Agregar botones thumbs up/down por mensaje |

## Interfaces / Contracts

```typescript
// src/lib/supabase/types.ts
export interface ChatSessionRow {
  id: string;
  user_id: string;
  tour_id: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageRow {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  feedback: number | null;
  created_at: string;
}

// Extensión en chatStore
interface ChatState {
  // ... existing state
  currentSessionId: string | null;
  updateFeedback: (messageId: string, value: 1 | -1 | null) => Promise<void>;
  syncPendingMessages: () => Promise<void>;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Store | Session creation, message persistence, offline queue, sync | Llamar métodos de chatStore y verificar estado + localStorage |
| RLS | Aislamiento entre usuarios | Consultas directas a Supabase (manual o test de integración) |
| UI | Feedback toggle states | Render ChatPanel, click thumbs, verificar visual state |

No hay test runner en el proyecto. Verificación manual + `tsc --noEmit`.

## Migration / Rollout

No migration required. Las nuevas tablas se crean desde cero. Los usuarios existentes pierden el historial de localStorage (único source hasta ahora) — se reemplaza con el nuevo mecanismo.

## Open Questions

- None
