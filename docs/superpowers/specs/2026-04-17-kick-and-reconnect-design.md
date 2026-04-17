# Kick And Reconnect Design

**Date:** 2026-04-17

## Summary

Add host moderation so the host can kick a player from the lobby. Fix player disconnect handling so closing a tab marks that player disconnected immediately instead of leaving them active in the session. Disconnected players should be able to rejoin with the same nickname and reclaim their existing player record.

## Goals

- Let the host kick a player from the lobby.
- Stop counting closed-tab players as connected.
- Preserve disconnected players in the lobby so they can rejoin cleanly.
- Allow kicked or disconnected users to rejoin later with the same nickname.

## Non-Goals

- Permanent bans or moderation history.
- User accounts or durable player identity across server restarts.
- Multi-device same-player session merging.

## Disconnect Behavior

When a player socket disconnects, the server should immediately mark that player `isConnected = false`. That player should remain in the lobby roster with their score and nickname preserved, but they should no longer count as an active participant for:

- early round completion
- answer submission eligibility
- connected-player roster counts

If the same person returns and joins with the same nickname, the server should reclaim the existing player record by updating the stored socket id and setting `isConnected = true`. This avoids duplicate player rows and preserves score continuity.

## Kick Behavior

The host screen should show a small kick action for each non-host player in the roster. When the host kicks a player:

1. the player record is removed from the lobby entirely
2. the removed player no longer counts toward connected-player logic
3. any current-question answer from that player is removed from active consideration if needed
4. the server emits updated snapshots to all remaining participants

The kicked user is not banned. They can rejoin normally by entering the room code and nickname again.

## Rejoin Rules

- Same nickname + disconnected player record: reclaim existing record
- Same nickname + currently connected player record: reject as duplicate
- Same nickname after kick: allow as a fresh join

## UI Changes

Host screen:

- add a compact kick control beside each player row
- keep disconnected players visually distinct from connected ones

Player screen:

- if a kicked player is removed while connected, the next server update should leave them out of the lobby state so the client can fall back to the join flow

## Testing Impact

Add or update tests for:

- disconnect marks a player inactive
- rejoin with same nickname reclaims existing disconnected player
- host kick removes a player from the lobby
- kicked player can rejoin afterward
- disconnected players do not block early round completion
