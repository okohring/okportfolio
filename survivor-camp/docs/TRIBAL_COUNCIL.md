# Tribal Council backend rules

The frontend prototype includes a 30-second Tribal Council phase after Tug of War. The important part for the production backend is not the mock tally; it is **server-authoritative access control**.

## Prototype rule

- A player who **loses Tug of War** enters Tribal Council as a **spectator**.
- Spectators may receive the Council timer, castaway list, Council activity, final tally, and voted-out result.
- Spectators may **not** select a vote, submit a vote, change a vote, trigger a Council action, or influence the tally.
- A player who **wins Tug of War** is treated as an active Council participant in this prototype and may submit one vote.

## Server ownership

The server should own:

- `TRIBAL_COUNCIL` phase start/end timestamps;
- each player's Council access (`participant` or `spectator`);
- vote eligibility and one-vote enforcement;
- accepted vote target validation;
- final tally and tie resolution;
- the voted-out player and phase transition;
- reconnect/resync state.

Never accept a client-provided `canVote`, `spectator`, tally, or Council result as authoritative.

## Suggested realtime messages

Client → server, eligible players only:

```json
{
  "type": "tribal.vote",
  "targetPlayerId": "player_7",
  "clientSeq": 84
}
```

Server → client:

```json
{
  "type": "tribal.state",
  "endsAt": "2026-09-11T17:01:20.000Z",
  "access": "spectator",
  "voteSubmitted": false,
  "revision": 49
}
```

At resolution:

```json
{
  "type": "tribal.finished",
  "votedOutPlayerId": "player_7",
  "tally": {
    "player_7": 4,
    "player_3": 3
  },
  "revision": 57
}
```

If a spectator sends `tribal.vote`, reject it server-side even if a modified client exposes a button:

```json
{
  "type": "error",
  "code": "TRIBAL_SPECTATOR_ONLY",
  "message": "This player has read-only Tribal Council access.",
  "clientSeq": 84
}
```

## Production note

The current frontend randomly simulates NPC votes only so the phase can be demonstrated end-to-end. Replace that with actual eligible player votes or whatever NPC/AI rules the final game uses. The 30-second timer should come from a server-owned deadline, not a client `setInterval`.