# Kick And Reconnect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a host kick action, mark closed-tab players disconnected promptly, and allow disconnected or kicked players to rejoin with the same nickname.

**Architecture:** Extend the in-memory lobby store to support explicit player removal and disconnected-player reclaim. Then wire socket events for kick and voluntary leave/disconnect handling, and finally expose a compact kick control in the host roster while making the client disconnect cleanly on page close.

**Tech Stack:** Node.js, npm, TypeScript, Express, Socket.IO, React, Vitest, Testing Library

---

## File Structure

- `server/game/lobbyStore.ts`: player removal, reconnect reclaim, and connection state transitions.
- `server/socket/events.ts`: kick/leave event names.
- `server/socket/registerHandlers.ts`: host kick handling and explicit leave/disconnect flows.
- `tests/server/lobbyStore.test.ts`: lobby store kick/reconnect coverage.
- `tests/server/registerHandlers.test.ts`: socket kick/disconnect coverage.
- `src/features/host/HostScreen.tsx`: kick button in player roster.
- `src/features/player/PlayerScreen.tsx`: explicit disconnect on pagehide/unload.
- `tests/client/HostScreen.test.tsx`: kick button emit test.

### Task 1: Lobby Store Behavior

**Files:**

- Modify: `tests/server/lobbyStore.test.ts`
- Modify: `server/game/lobbyStore.ts`

- [ ] **Step 1: Add failing lobby-store tests**

Cover:

- reclaiming a disconnected player by nickname
- removing a player from the lobby via host kick
- ensuring disconnected players no longer count as connected

- [ ] **Step 2: Run the lobby-store tests**

Run:

```bash
npm test -- tests/server/lobbyStore.test.ts
```

Expected: FAIL for missing kick/reconnect behavior.

- [ ] **Step 3: Implement store behavior**

Add:

- `removePlayer`
- clean reconnect reclaim for disconnected nickname matches
- safe answer cleanup when removing a player

- [ ] **Step 4: Run the targeted server tests**

Run:

```bash
npm test -- tests/server/lobbyStore.test.ts
```

Expected: PASS for kick and reconnect flows.

### Task 2: Socket Kick And Disconnect Flow

**Files:**

- Modify: `tests/server/registerHandlers.test.ts`
- Modify: `server/socket/events.ts`
- Modify: `server/socket/registerHandlers.ts`

- [ ] **Step 1: Add failing socket tests**

Cover:

- host kick emits updated snapshots
- kicked player can rejoin later
- disconnected players are marked inactive and no longer block progress

- [ ] **Step 2: Run the socket tests**

Run:

```bash
npm test -- tests/server/registerHandlers.test.ts
```

Expected: FAIL for missing event handling.

- [ ] **Step 3: Implement socket behavior**

Add:

- host kick event
- player leave event for explicit page close
- updated disconnect handling that marks the player inactive promptly

- [ ] **Step 4: Run targeted server tests**

Run:

```bash
npm test -- tests/server/registerHandlers.test.ts tests/server/lobbyStore.test.ts
```

Expected: PASS for kick/disconnect behavior.

### Task 3: Host UI And Client Cleanup

**Files:**

- Modify: `tests/client/HostScreen.test.tsx`
- Modify: `src/features/host/HostScreen.tsx`
- Modify: `src/features/player/PlayerScreen.tsx`

- [ ] **Step 1: Add failing host UI test**

Cover clicking a host kick control and emitting the kick event with the target player id.

- [ ] **Step 2: Run the host UI test**

Run:

```bash
npm test -- tests/client/HostScreen.test.tsx
```

Expected: FAIL for missing control.

- [ ] **Step 3: Implement host kick control and pagehide disconnect**

Add:

- compact kick button beside roster players
- explicit player leave/disconnect cleanup on pagehide/unload

- [ ] **Step 4: Run focused client tests**

Run:

```bash
npm test -- tests/client/HostScreen.test.tsx tests/client/PlayerScreen.test.tsx
```

Expected: PASS for host and player behavior.

### Task 4: Full Verification

**Files:**

- Modify: any touched files needed for final cleanup

- [ ] **Step 1: Run the full test suite**

Run:

```bash
npm test
```

Expected: PASS for all tests.

- [ ] **Step 2: Run the production build**

Run:

```bash
npm run build
```

Expected: PASS for the client and server build.
