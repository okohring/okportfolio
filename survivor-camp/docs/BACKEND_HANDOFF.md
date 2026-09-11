# Backend handoff

## What exists today

The browser prototype owns almost all game state. It simulates one human player plus NPC castaways, camp zones, conversations, a 30-second phase timer, and a Tug of War challenge. `server.js` currently does only two things: serves the client and exposes safe tuning values through `/api/config`.

That makes the current build easy to iterate on, but it is **not secure or synchronized multiplayer architecture**.

## Recommended server ownership

For an actual multiplayer build, move these responsibilities to the backend:

- Lobby creation, join/leave, reconnect, readiness, and seat/tribe assignment.
- Canonical match phase (`LOBBY`, `CAMP`, `CHALLENGE_INTRO`, `TUG_OF_WAR`, `RESULT`, etc.).
- Canonical phase start/end timestamps. Clients should display a countdown from server time, not decide when the phase ends.
- Player position validation and proximity/zone membership if movement matters mechanically.
- Conversation membership/visibility rules: public, semi-private, private-ish, private.
- Camp resource/task effects and anti-spam/rate limits.
- Tug of War input acceptance, rate limiting, team score, win threshold, and result.
- Match history/event log sufficient for reconnects and debugging.

The browser should own rendering, interpolation, input collection, accessibility, local animation, and optimistic UI where appropriate.

## Suggested model

A match can be represented roughly as:

```js
{
  id,
  phase,
  phaseStartedAt,
  phaseEndsAt,
  players: {
    [playerId]: {
      displayName,
      tribeId,
      connected,
      position: { x, y },
      zoneId
    }
  },
  camp: {
    fire,
    water,
    shelter
  },
  challenge: {
    type: 'tug-of-war',
    teamProgress,
    startedAt,
    endsAt,
    winnerTribeId
  },
  revision
}
```

Use IDs rather than display names as keys in production.

## Networking recommendation

Use HTTP for account/session/lobby setup and WebSockets for live match state. A backend engineer can use Socket.IO, ws, uWebSockets.js, or another stack; the prototype does not depend on a specific library.

Prefer event messages with explicit versions and server timestamps. A compact event log also makes reconnect/resync easier than trying to replay arbitrary DOM state.

## Tug of War implementation

The current browser mechanic is deliberately local:

- duration: 12 seconds
- player input: +6.2 progress per accepted input
- opponent baseline: 17 progress/second with a small visual wave
- win threshold: ±100

For multiplayer, do **not** send a final score from the client. Send input intents, for example `challenge.pull`, and let the server:

1. authenticate the player and match;
2. verify the challenge is active;
3. rate-limit input;
4. apply the server-owned contribution;
5. broadcast updated team progress;
6. resolve the winner exactly once.

For fairness, keyboard repeat and click frequency should not directly determine unlimited server contribution. Cap accepted pulls per player per time window, or turn pulls into short-lived effort/velocity that is integrated server-side.

## Camp movement and conversations

The first multiplayer version does not need twitch-perfect movement. 8–12 updates/second per player plus interpolation is likely enough for a social camp map. The server can accept target positions rather than every animation frame.

Conversation visibility should be derived from membership + zone rules, not trusted client labels. Keep global announcements separate from proximity/private chat so moderation and logging policies can differ.

## Reconnect

On reconnect, the server should send one full authoritative snapshot and then resume deltas. Include a monotonically increasing `revision` or sequence number so a client can detect dropped/out-of-order updates.

## Persistence

You can keep an active match in memory initially. Persist accounts/lobbies/match outcomes only when needed. If the process must survive restarts, Redis is a reasonable home for transient match state; a relational DB can own durable user/match records.

## Suggested next engineering slice

The cleanest first backend milestone is:

1. create/join lobby;
2. server starts a 30-second CAMP phase;
3. clients receive canonical phase timestamps;
4. server transitions everyone to TUG_OF_WAR;
5. clients submit `challenge.pull` intents;
6. server resolves and broadcasts a winner;
7. reconnect returns the current match snapshot.

That proves the networking model without requiring the NPC/social simulation to be rewritten all at once.
