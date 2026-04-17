# Quiz Forge UI Refresh Design

**Date:** 2026-04-17

## Summary

Refresh the app from a dark, high-energy game-show presentation into a cleaner light interface inspired by the calm editorial feel of `claude.ai`. Add a custom favicon that fits the app brand. Change round progression so a question ends as soon as every connected player has answered, then reveal the correct answer briefly before continuing automatically.

## Goals

- Move the app to a light visual system with calmer contrast and simpler surfaces.
- Keep the existing host and player flows intact.
- Add a polished custom favicon.
- End live rounds early when all connected players have answered.
- Preserve a short answer-reveal state before moving to the next phase.

## Non-Goals

- Rebuilding the routing or overall information architecture.
- Introducing new game mechanics or question types.
- Changing the scoring formula.
- Adding persistence or account features.

## Visual Direction

The UI should feel more like a focused collaborative tool than a game-show dashboard. The palette should use warm off-whites, charcoal text, muted gray borders, and a restrained accent color rather than saturated multi-color gradients. Panels should be lighter, flatter, and more consistent. Typography should remain expressive enough to feel intentional, but the interface should reduce visual noise, decorative glow, and oversized emphasis.

The landing screen, host screen, and player screen should all share the same design language:

- soft paper-like background
- dark readable primary text
- subtle secondary text
- cleaner cards and buttons
- fewer large visual effects
- more whitespace and steadier rhythm

## Favicon

Add a custom favicon that matches the Quiz Forge brand. It should feel simple, crisp, and legible at small sizes. The most practical direction is a lightweight geometric mark or letterform-based icon that still reads clearly in a browser tab. It should be added through the standard HTML head entry so both development and production builds use it.

## Round Completion Behavior

The server should still start each live round with a timer, but it should no longer wait for the timer if all connected players have already answered.

Updated round flow:

1. Server starts question and broadcasts the live state with end time.
2. Players answer as normal.
3. After each valid answer, the server checks whether every currently connected player in the lobby has answered.
4. If yes, the server cancels the remaining question timer and finalizes the round immediately.
5. The server reveals the correct answer and explanation.
6. The reveal remains visible for about 2 seconds.
7. The game proceeds to leaderboard or next question automatically.

If some players have disconnected, only currently connected players count toward early completion. If no players are connected, the timer should continue normally rather than auto-finishing instantly.

## UI States

Host view:

- cleaner top-level layout
- quieter control bar
- lighter room code and quiz summary presentation
- more understated leaderboard styling
- question reveal screen that clearly shows correct answer without heavy decoration

Player view:

- lighter join form
- simpler answer tiles with clear selected and correct states
- cleaner locked-in state
- less visual clutter around leaderboard and score sections

## Testing Impact

Add or update tests for:

- early question completion when all connected players answer
- no early completion when connected players are still missing answers
- reveal state duration before progression
- favicon asset presence and document reference if practical at test level

Manual verification should cover:

- visual polish on desktop and mobile
- answer submission ending the round early
- reveal state appearing before progression
- final behavior still working with one-player and multi-player lobbies
