# Tasks: Chat History Persistence

## Phase 1: Foundation — Schema y tipos

- [x] 1.1 Agregar tablas `chat_sessions` y `chat_messages` + RLS policies en `docs/supabase-schema.sql`
- [x] 1.2 Agregar interfaces `ChatSessionRow` y `ChatMessageRow` en `src/lib/supabase/types.ts`
- [ ] 1.3 Agregar tipos `SessionRow` y `MessageRow` en `src/lib/supabase/database.ts` (no existe — no aplica)

## Phase 2: Core — Store refactor

- [x] 2.1 Refactor `chatStore` con `currentSessionId`, carga inicial desde Supabase, y sync offline/online
- [x] 2.2 Implementar `syncPendingMessages()` para drenar cola offline al reconectar
- [x] 2.3 Agregar `updateFeedback(messageId, value)` para thumbs up/down
- [x] 2.4 Mantener `localStorage` como caché offline (`rimay_chat_messages` + `rimay_chat_session`)

## Phase 3: UI — Feedback en ChatPanel

- [x] 3.1 Agregar botones thumbs up/down por cada mensaje del asistente en `ChatPanel.tsx`
- [x] 3.2 Manejar estados visuales: activo, inactivo, toggle
- [x] 3.3 Conectar onClick con `chatStore.updateFeedback()`

## Phase 4: Verificación

- [x] 4.1 Verificar build: `npx tsc --noEmit` (solo errores pre-existentes de tsconfig)
- [x] 4.2 Verificar que el schema SQL es válido (sin errores de sintaxis)
