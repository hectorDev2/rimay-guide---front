# Proposal: Chat History Persistence

## Intent

El historial del chat vive solo en localStorage — se pierde al cambiar dispositivo o borrar datos. Necesitamos persistencia en Supabase para habilitar historial cross-device, sesiones por tour, y feedback en respuestas.

## Scope

### In Scope
- Tablas `chat_sessions` y `chat_messages` en Supabase + columna `feedback` en messages
- Políticas RLS para aislamiento por usuario
- Tipos TypeScript para las nuevas tablas
- Sync store: localStorage como caché offline, Supabase como fuente de verdad
- UI de feedback (thumbs up/down) por mensaje del asistente
- Limpieza de sessiones huérfanas al cerrar tour

### Out of Scope
- Transcripts en paradas (futuro)
- Analytics / dashboard de preguntas frecuentes
- Fine-tuning del modelo con feedback

## Capabilities

### New Capabilities
- `chat-history`: Persistencia de historial de chat por sesión de usuario+tour en Supabase

### Modified Capabilities
- None

## Approach

1. Crear tablas `chat_sessions` (user_id, tour_id) y `chat_messages` (session_id, role, content, feedback) en schema.sql
2. Agregar tipos `ChatSessionRow` y `ChatMessageRow` en `src/lib/supabase/types.ts`
3. Refactor `chatStore` para: cargar desde Supabase al abrir, sync bidireccional con localStorage, marcar session al iniciar chat
4. Agregar botón thumbs up/down en `ChatPanel` por cada mensaje del asistente
5. Nueva función `updateFeedback` en chatStore

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `docs/supabase-schema.sql` | Modified | Nuevas tablas chat_sessions + chat_messages |
| `src/lib/supabase/types.ts` | Modified | Nuevos tipos TS |
| `src/stores/chatStore.ts` | Modified | Lógica de persistencia, session management, feedback |
| `src/app/components/organisms/ChatPanel.tsx` | Modified | UI de feedback |
| `src/lib/chat/constants.ts` | Unchanged | Sin cambios |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Race condition entre localStorage y Supabase en offline→online | Medium | Queue de escrituras pendientes + sync al reconectar |
| Session huérfana si usuario cierra sin limpiar | Low | cleanup al cerrar chat + al cambiar de tour |

## Rollback Plan

Revert cambios en schema.sql, restaurar `chatStore` a versión anterior (git revert). Los datos nuevos en BD se borran con DROP TABLE.

## Dependencies

- `@supabase/supabase-js` ya instalado
- Cliente Supabase existente en el proyecto

## Success Criteria

- [ ] Mensajes persisten en Supabase y se recuperan al recargar página
- [ ] Feedback (thumbs up/down) se guarda en BD
- [ ] Offline→online sync sin pérdida de mensajes
- [ ] Cada sesión se asocia al user+tour correcto
