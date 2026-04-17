# Round Delay Config Design

**Date:** 2026-04-17

## Summary

Split the "between rounds" delay from the final leaderboard delay so the game can move faster between questions without shortening the final standings screen. Introduce a dedicated server configuration value, `NEXT_ROUND_DELAY_MS`, with a shorter default.

## Decision

- Keep `LEADERBOARD_DURATION_MS` for the final leaderboard at the end of the game.
- Add `NEXT_ROUND_DELAY_MS` for the countdown shown between non-final rounds.
- Default `NEXT_ROUND_DELAY_MS` to `2500` milliseconds.

## Why

The current app uses the same duration for two different moments:

- the short pause between questions
- the final leaderboard before returning to the waiting screen

Those moments have different pacing needs. Between rounds should feel quick. The final leaderboard should stay visible slightly longer.

## Scope

- Update server config parsing and defaults.
- Use the new duration for non-final `leaderboard` phases only.
- Keep final leaderboard behavior unchanged except for being explicitly separate.
- Expose the new env var in `.env.example` and `README.md`.
- Update tests for config parsing and round transition timing.
