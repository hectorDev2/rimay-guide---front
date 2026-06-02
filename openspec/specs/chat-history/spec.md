# Chat History Specification

## Purpose

Define el comportamiento del sistema de persistencia de historial de chat en Supabase, incluyendo sesiones por usuario+tour, mensajes individuales, sync offline/online, y feedback en respuestas.

## Requirements

### Requirement: Session Management

The system MUST create a `chat_sessions` record per `(user_id, tour_id)` pair when the user sends their first message in a chat. Subsequent messages MUST reuse the same session. The system MUST mark the session as closed when the user clears the chat or switches tours.

#### Scenario: First message creates session

- GIVEN an authenticated user viewing a tour
- WHEN the user sends their first chat message
- THEN a `chat_sessions` row is created with `user_id` and `tour_id`
- AND all subsequent messages reference this `session_id`

#### Scenario: Session reuse on same tour

- GIVEN an existing `chat_sessions` row for the current user+tour
- WHEN the user sends another message
- THEN the message references the existing `session_id`

#### Scenario: Clear chat closes session

- GIVEN an active session with messages
- WHEN the user clears the chat
- THEN the session's `updated_at` is set to now
- AND a new session starts on the next message

### Requirement: Message Persistence

Each message MUST be stored in `chat_messages` with `session_id`, `role` (`user` or `assistant`), `content`, and `created_at`. Messages MUST be retrievable by `session_id` ordered by `created_at`.

#### Scenario: Online persistence

- GIVEN an active Supabase connection
- WHEN the user sends a message or receives a response
- THEN the message is UPSERTed to `chat_messages`
- AND the full history is loaded from Supabase on chat open

#### Scenario: Offline queue

- GIVEN no network connectivity
- WHEN the user sends a message
- THEN the message is stored in `localStorage` only
- AND queued for sync when connectivity resumes
- AND the user sees the message normally in the UI

#### Scenario: Offline→online sync

- GIVEN queued messages in `localStorage`
- WHEN connectivity resumes
- THEN queued messages are UPSERTed to Supabase
- AND `localStorage` is reconciled with the server state

### Requirement: Feedback

Each assistant message MUST support a `feedback` field with values `1` (thumbs up), `-1` (thumbs down), or `null` (no feedback). The user MUST be able to toggle their feedback.

#### Scenario: Submit feedback

- GIVEN an assistant message displayed in the chat
- WHEN the user clicks thumbs up
- THEN `chat_messages.feedback` is set to `1` in Supabase

#### Scenario: Toggle feedback

- GIVEN an assistant message with `feedback = 1`
- WHEN the user clicks thumbs down
- THEN `chat_messages.feedback` is updated to `-1` in Supabase

#### Scenario: Remove feedback

- GIVEN an assistant message with `feedback = 1`
- WHEN the user clicks thumbs up again
- THEN `chat_messages.feedback` is set to `null`

### Requirement: Security

Each user MUST only access their own sessions and messages. The system MUST enforce RLS policies on both tables.

#### Scenario: RLS isolation

- GIVEN user A with session S1 and user B with session S2
- WHEN user A queries `chat_messages`
- THEN only messages in S1 are returned
- AND user B cannot access S1

### Requirement: Data Retention

The system SHOULD keep all chat history indefinitely. The user MAY clear their history at any time, which SOFT-deletes the session.

#### Scenario: Clear all history

- GIVEN an authenticated user with existing sessions
- WHEN the user requests to clear all history
- THEN all `chat_messages` for the current session are DELETEd
- AND the `chat_sessions` row is DELETEd
- AND a welcome message replaces the history in localStorage
