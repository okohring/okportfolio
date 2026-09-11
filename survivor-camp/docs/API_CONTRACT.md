# Proposed API / realtime contract

This is a target contract for the backend implementation. It is documentation only; only `/api/health` and `/api/config` are implemented in the prototype server.

## HTTP

### `POST /api/lobbies`
Create a lobby.

Response:
```json
{
  "lobbyId": "lob_123",
  "joinCode": "PALM42"
}
```

### `POST /api/lobbies/:lobbyId/join`
Join a lobby with an authenticated player/session.

### `POST /api/lobbies/:lobbyId/start`
Host/admin starts the match. The server decides `phaseStartedAt` and `phaseEndsAt`.

### `GET /api/matches/:matchId`
Return an authoritative snapshot for initial load/reconnect.

## WebSocket client → server

Every message should carry a message `type`; authenticated connection context should determine `playerId` rather than accepting arbitrary player IDs from the payload.

### `player.move`
```json
{
  "type": "player.move",
  "target": { "x": 1120, "y": 880 },
  "clientSeq": 81
}
```

### `chat.send`
```json
{
  "type": "chat.send",
  "conversationId": "convo_123",
  "text": "Want to grab water?",
  "clientSeq": 82
}
```

### `challenge.pull`
```json
{
  "type": "challenge.pull",
  "clientSeq": 83
}
```

The server applies contribution/rate limits. The client never sends `+6.2`, score, winner, or remaining time.

## WebSocket server → client

### `match.snapshot`
Full state used at match join and reconnect.

### `phase.changed`
```json
{
  "type": "phase.changed",
  "phase": "CAMP",
  "startedAt": "2026-09-11T17:00:00.000Z",
  "endsAt": "2026-09-11T17:00:30.000Z",
  "revision": 12
}
```

### `player.moved`
Validated/canonical position or target for another player.

### `chat.message`
Only sent to clients entitled to receive the conversation.

### `challenge.state`
```json
{
  "type": "challenge.state",
  "challenge": "tug-of-war",
  "progress": 22.5,
  "endsAt": "2026-09-11T17:00:44.000Z",
  "revision": 31
}
```

### `challenge.finished`
```json
{
  "type": "challenge.finished",
  "winnerTribeId": "tribe_a",
  "finalProgress": 100,
  "revision": 48
}
```

## Error envelope

For rejected realtime actions, prefer a stable machine code plus human-readable detail:

```json
{
  "type": "error",
  "code": "CHALLENGE_NOT_ACTIVE",
  "message": "Pull input ignored because Tug of War is not active.",
  "clientSeq": 83
}
```

## Versioning

Add a protocol version before external testers depend on the contract. A simple `protocolVersion: 1` in snapshots/handshakes is enough at this stage.
