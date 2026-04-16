# AI Quiz Lobby Design

**Date:** 2026-04-17

## Summary

Build a Kahoot-like web app where a host creates a realtime lobby, enters a topic, chooses a quiz length, and uses OpenAI to generate a multiple-choice quiz as strict JSON. Players join from their own phones with a room code and nickname. The game runs through timed rounds where speed and correctness both affect score. At the end, the app shows a final leaderboard and allows the host to restart the game with the same generated quiz.

## Goals

- Let a host create an in-memory lobby with a short room code.
- Let the host enter a quiz topic and question count before starting.
- Use OpenAI to generate a quiz payload as JSON.
- Let players join from their own devices over the local network or deployed URL.
- Run each round in realtime over WebSockets with a visible timer.
- Score answers based on correctness and answer speed.
- Show per-round results and a final leaderboard.
- Allow restart without regenerating the quiz.

## Non-Goals

- User accounts or authentication.
- Persistent storage for lobbies, scores, or quizzes.
- Multiple question types beyond four-option multiple choice.
- Admin moderation tools.
- Recovery of lobbies after a server restart.

## Product Shape

The app has two roles: host and player.

The host flow:

1. Open the app and choose to host a lobby.
2. Enter a topic in a large input.
3. Choose the number of questions.
4. Submit to generate a quiz.
5. Wait for players to join using the room code.
6. Start the game and advance through question, reveal, and leaderboard phases.
7. Review the final leaderboard and optionally restart the game.

The player flow:

1. Open the app on a phone.
2. Enter the room code and a nickname.
3. Wait in the lobby until the host starts.
4. Answer each timed multiple-choice question once.
5. See per-round feedback and updated leaderboard states.
6. See the final ranking and wait for restart or leave.

## Architecture

Use a single Node/npm project with:

- An Express server for HTTP endpoints and static asset serving in production.
- A Socket.IO server for realtime lobby, game, and scoring events.
- A React frontend built with Vite.
- Tailwind CSS plus a small shared component layer for the interface.

The server is authoritative for all lobby and game state. The client renders the latest state snapshot and sends user intent events such as joining, starting, and answering.

All state lives in memory on the server. This is acceptable because the requested version does not need accounts or persistence.

## Lobby And Game State

Each lobby contains:

- `code`: short uppercase room code.
- `hostSocketId`: current host socket identifier.
- `topic`: host-entered quiz topic.
- `questionCount`: host-selected quiz length.
- `status`: one of `collecting`, `ready`, `question_live`, `question_result`, `leaderboard`, `finished`.
- `quiz`: generated quiz payload.
- `players`: connected players with nickname, socket id, total score, and connection state.
- `currentQuestionIndex`: zero-based question pointer.
- `currentQuestionStartedAt`: server timestamp for live round start.
- `currentQuestionEndsAt`: server timestamp for live round end.
- `answers`: per-question answer map keyed by player id, storing selected option, submission time, and correctness.

The main state transitions:

1. Host creates lobby -> `collecting`
2. Quiz generation succeeds -> `ready`
3. Host starts question -> `question_live`
4. Timer ends -> `question_result`
5. Host or server advances -> `leaderboard`
6. More questions remain -> next `question_live`
7. Last leaderboard completes -> `finished`
8. Host restarts -> `ready` with scores and answers reset

## OpenAI Quiz Contract

The server sends a structured request to OpenAI asking for:

- A quiz title.
- An array of questions with fixed length equal to the selected question count.
- For each question:
  - `prompt`
  - `options` as exactly four answer strings
  - `correctIndex` as an integer from `0` to `3`
  - `explanation` as a short fact or justification shown during reveal

The server validates the response before storing it in the lobby. Validation rules:

- The response must be valid JSON.
- The number of questions must exactly match the selected count.
- Each question must contain exactly four non-empty options.
- `correctIndex` must point to one of the four options.
- Prompts and options must be non-empty strings.

If validation fails, the host sees a retryable generation error and the lobby remains in a non-playable state.

## Realtime Data Flow

### Quiz Creation

1. Host submits topic and question count.
2. Server creates a lobby code and puts the lobby into `collecting`.
3. Server calls OpenAI and validates the quiz JSON.
4. On success, server stores the quiz and emits a `ready` snapshot.
5. On failure, server emits a generation error message to the host.

### Join Flow

1. Player submits room code and nickname.
2. Server verifies the lobby exists and is joinable.
3. Server rejects duplicate active nicknames in the same lobby.
4. Server adds the player and broadcasts the updated roster.
5. Player receives the current lobby snapshot so refreshes can recover cleanly.

### Live Question Flow

1. Host starts the next question.
2. Server sets the start and end timestamps and emits the question payload without the correct answer.
3. Players submit one answer each.
4. Server records only the first valid answer per player.
5. Late or duplicate answers are rejected.
6. When the timer expires, the server calculates scores and emits the reveal state with the correct answer, explanation, and per-player score delta.
7. The server then emits leaderboard data.
8. The host advances to the next question, or the server moves the lobby to `finished` after the final round.

### Restart Flow

Restart resets:

- player scores
- current question index
- stored answers
- transient timers and round state

Restart does not reset:

- room code
- joined players
- generated quiz payload
- topic and question count

After restart, the lobby returns to `ready`.

## Scoring

Scoring depends on both correctness and speed.

- Incorrect answers receive `0` points.
- Correct answers receive a base score plus a speed bonus based on how quickly the answer was submitted relative to the question timer.
- The exact formula should be simple, deterministic, and server-side only.

Implementation target:

- Use a fixed round timer for every question.
- Award up to `1000` points for a correct answer.
- Compute score as a decreasing value over the duration of the timer, with a minimum non-zero value for correct answers submitted before timeout.

This keeps ranking intuitive and produces visible movement in the leaderboard.

## Frontend Experience

The UI should feel like a game show rather than an admin dashboard.

Host experience:

- Large topic input as the visual anchor.
- Question-count picker next to generation controls.
- Clear room code display and live player roster.
- Prominent start, next, and restart actions.
- Active round view with timer, question progress, and leaderboard transitions.

Player experience:

- Mobile-first join form.
- Large tap-friendly answer buttons.
- Strong visual feedback for waiting, live question, locked answer, reveal, and final standings.

Use Tailwind with a custom visual direction, strong typography, saturated color accents, and deliberate motion for phase changes.

## Error Handling

The system must reject and surface these cases cleanly:

- OpenAI returns invalid JSON.
- Quiz validation fails.
- Room code does not exist.
- Nickname is already in use by an active player.
- Player submits after the timer closes.
- Player submits more than once for the same question.
- Host disconnects during a live lobby.
- Player refreshes or reconnects mid-game.

Reconnect behavior:

- If the same nickname is no longer active, the player may reclaim it.
- If the nickname is still active on another socket, the user must choose a new nickname.
- On reconnect, the server sends the latest lobby snapshot so the client can render the current phase.

Because lobbies are in memory, a full server restart drops all active games. This is an accepted limitation for this version.

## Testing Strategy

Prioritize automated tests around behavior that can break game integrity:

- Quiz JSON validation.
- Room code and nickname validation.
- Lobby state transitions.
- Question timer lifecycle.
- First-answer-only enforcement.
- Score calculation.
- Restart reset behavior.

Frontend tests should cover:

- Host quiz generation form behavior.
- Player join flow.
- Live answer locking.
- Result and leaderboard rendering across state changes.

Manual testing should cover:

- Host plus multiple phones in one lobby.
- Timer sync and answer race conditions.
- Mobile usability for answer selection.
- Restart with existing players still connected.

## Delivery Boundaries

The first implementation should produce a local-development-ready app using Node and npm only. It should be runnable with environment-based OpenAI credentials and should not require any external database or auth provider.
