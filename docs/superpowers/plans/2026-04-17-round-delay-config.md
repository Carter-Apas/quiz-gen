# Round Delay Config Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the between-round countdown shorter and independently configurable from the final leaderboard duration.

**Architecture:** Add a dedicated `nextRoundDelayMs` server config value and route non-final leaderboard phases through it, while leaving the final post-game leaderboard on `leaderboardDurationMs`. Keep the change server-driven so the existing snapshot-based clients continue to render from timestamps.

**Tech Stack:** Node.js, TypeScript, Socket.IO, React, Vitest

---

### Task 1: Add config coverage

**Files:**

- Modify: `tests/server/config.test.ts`
- Modify: `server/config.ts`

- [ ] **Step 1: Write the failing test**

Add assertions that `readConfig()` reads `NEXT_ROUND_DELAY_MS` and falls back to `2500` when missing.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/server/config.test.ts`
Expected: FAIL because `nextRoundDelayMs` is not defined on the config object.

- [ ] **Step 3: Write minimal implementation**

Add `nextRoundDelayMs` to `ServerConfig` and parse `NEXT_ROUND_DELAY_MS ?? 2500`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/server/config.test.ts`
Expected: PASS.

### Task 2: Route non-final rounds through the new delay

**Files:**

- Modify: `tests/server/registerHandlers.test.ts`
- Modify: `server/socket/registerHandlers.ts`

- [ ] **Step 1: Write the failing test**

Update the non-final leaderboard test to expect `nextRoundDelayMs` for the countdown timestamps and timer scheduling, while keeping the final leaderboard test on `leaderboardDurationMs`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/server/registerHandlers.test.ts`
Expected: FAIL because the handler still uses `leaderboardDurationMs` for all leaderboard phases.

- [ ] **Step 3: Write minimal implementation**

Choose the phase duration based on whether the current question is the last one:

- non-final: `nextRoundDelayMs`
- final: `leaderboardDurationMs`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/server/registerHandlers.test.ts`
Expected: PASS.

### Task 3: Document the new env var

**Files:**

- Modify: `.env.example`
- Modify: `README.md`

- [ ] **Step 1: Update examples**

Add `NEXT_ROUND_DELAY_MS=2500` to the sample environment blocks and keep the wording clear that it controls the short delay before the next round.

- [ ] **Step 2: Verify docs match runtime**

Check that the documented key and default match `server/config.ts`.

### Task 4: Final verification

**Files:**

- No code changes expected

- [ ] **Step 1: Run targeted tests**

Run: `npm test -- tests/server/config.test.ts tests/server/registerHandlers.test.ts`
Expected: PASS.

- [ ] **Step 2: Run full verification**

Run: `npm test`
Expected: PASS.

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: PASS.
