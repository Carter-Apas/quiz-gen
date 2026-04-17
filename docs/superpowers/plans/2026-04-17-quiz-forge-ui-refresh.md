# Quiz Forge UI Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh Quiz Forge into a clean neutral light UI, add a branded favicon, and end rounds early when all connected players have answered while still showing a brief reveal state before continuing.

**Architecture:** Keep the current app structure intact. Implement the round-completion change in the socket orchestration layer and cover it with server tests first. Then refactor the shared visual primitives, landing page, host screen, and player screen into a lighter calmer design system, plus add a favicon asset wired through the HTML head.

**Tech Stack:** Node.js, npm, TypeScript, Express, Socket.IO, React, Vite, Tailwind CSS, Vitest, Testing Library

---

## File Structure

- `server/socket/registerHandlers.ts`: timer lifecycle and early-completion logic.
- `tests/server/registerHandlers.test.ts`: timer cancellation and reveal progression tests.
- `src/styles.css`: global light theme tokens and background.
- `src/components/ui.tsx`: calmer light-theme panel and button primitives.
- `src/components/TimerBar.tsx`: light-theme timer styling.
- `src/components/Leaderboard.tsx`: simplified light-theme ranking rows.
- `src/App.tsx`: lighter landing page layout and tone.
- `src/features/host/HostScreen.tsx`: cleaner host controls and neutral light styling.
- `src/features/player/PlayerScreen.tsx`: simpler player join and question UI.
- `index.html`: favicon link.
- `public/favicon.svg`: new favicon asset.

### Task 1: Early Round Completion

**Files:**

- Modify: `tests/server/registerHandlers.test.ts`
- Modify: `server/socket/registerHandlers.ts`

- [ ] **Step 1: Write the failing early-completion test**

Add a test that:

- creates a lobby with one question and two connected players
- starts the game
- submits answers from both players before the configured timer ends
- asserts that the long question timer is cleared and the lobby moves into reveal state immediately

- [ ] **Step 2: Run the server socket test**

Run:

```bash
npm test -- tests/server/registerHandlers.test.ts
```

Expected: FAIL because the current server waits for the full round timer.

- [ ] **Step 3: Implement early-completion logic**

Update `registerHandlers.ts` so that after each valid answer it:

- checks all currently connected players in the lobby
- confirms at least one connected player exists
- compares connected-player count to current-question answer count
- clears the scheduled question timer and finalizes immediately when everyone is done
- still schedules the short reveal and leaderboard timers

- [ ] **Step 4: Run the targeted server tests**

Run:

```bash
npm test -- tests/server/registerHandlers.test.ts tests/server/lobbyStore.test.ts
```

Expected: PASS for early completion and existing lobby behavior.

### Task 2: Favicon

**Files:**

- Create: `public/favicon.svg`
- Modify: `index.html`

- [ ] **Step 1: Add the favicon asset**

Create a small crisp SVG mark for Quiz Forge that stays legible at tab size.

- [ ] **Step 2: Wire the favicon in the document head**

Add:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

- [ ] **Step 3: Verify the asset is referenced**

Run:

```bash
rg -n "favicon" index.html public/favicon.svg
```

Expected: the HTML link and SVG file are both present.

### Task 3: Light Theme Tokens And Primitives

**Files:**

- Modify: `src/styles.css`
- Modify: `src/components/ui.tsx`
- Modify: `src/components/TimerBar.tsx`
- Modify: `src/components/Leaderboard.tsx`

- [ ] **Step 1: Update the shared visual tokens**

Move from dark/glow tokens to a neutral light system:

- off-white background
- charcoal text
- soft gray borders
- restrained dark accent
- subtle shadows only

- [ ] **Step 2: Refactor shared primitives**

Make `Shell`, `GlowPanel`, buttons, timer bar, and leaderboard rows support the new calm light theme.

- [ ] **Step 3: Run the client tests that use these primitives**

Run:

```bash
npm test -- tests/client/App.test.tsx tests/client/HostScreen.test.tsx tests/client/PlayerScreen.test.tsx
```

Expected: PASS with no behavior regressions.

### Task 4: Landing, Host, And Player UI Refresh

**Files:**

- Modify: `src/App.tsx`
- Modify: `src/features/host/HostScreen.tsx`
- Modify: `src/features/player/PlayerScreen.tsx`

- [ ] **Step 1: Refresh the landing page**

Simplify the landing page copy, spacing, and card treatment to match the clean light theme.

- [ ] **Step 2: Refresh the host screen**

Keep the same controls and states, but restyle into a cleaner form layout with lighter cards, quieter labels, and simpler hierarchy.

- [ ] **Step 3: Refresh the player screen**

Restyle the join form, question tiles, reveal state, and leaderboard sections to fit the same visual system.

- [ ] **Step 4: Run the focused client tests**

Run:

```bash
npm test -- tests/client/App.test.tsx tests/client/HostScreen.test.tsx tests/client/PlayerScreen.test.tsx
```

Expected: PASS for host, player, and landing behavior.

### Task 5: Full Verification

**Files:**

- Modify: any touched files needed for final cleanup

- [ ] **Step 1: Run the full test suite**

Run:

```bash
npm test
```

Expected: PASS for all server and client tests.

- [ ] **Step 2: Run the production build**

Run:

```bash
npm run build
```

Expected: PASS with the refreshed client and compiled server output.

- [ ] **Step 3: Smoke-test the server**

Run:

```bash
npm start
curl -s http://localhost:3001/api/health
```

Expected: server starts and the health route returns `{"ok":true}`.
