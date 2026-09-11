# Survivor Camp Prototype v0.3

A frontend gameplay prototype intended as a **developer handoff**, not a production multiplayer implementation.

Current playable loop:

1. 30-second camp/social phase.
2. Camp phase summary.
3. 12-second Tug of War button-mash challenge.
4. Win/loss result and restart.

## Run locally

Requires Node.js 18+.

```bash
npm start
```

Open `http://localhost:3000`.

No npm dependencies are required for the prototype.

## Project structure

```text
public/                 Browser client prototype
  index.html
  style.css
  app.js
src/
  gameConfig.js         Server-owned prototype tuning values
server.js               Static server + minimal JSON API
package.json
docs/
  BACKEND_HANDOFF.md    What should move server-side next
  API_CONTRACT.md       Proposed multiplayer HTTP/WebSocket contract
```

## Existing API

- `GET /api/health` — liveness check.
- `GET /api/config` — prototype tuning values. The client has matching fallback values so visual work remains testable if the endpoint is unavailable.

## Important implementation note

The NPCs, camp movement, conversations, timer progression, and Tug of War result are currently simulated in the browser. That is intentional for rapid gameplay iteration. **Do not treat client state as authoritative in multiplayer.** See `docs/BACKEND_HANDOFF.md` for the recommended ownership split.

## Prototype controls

- Move: click or WASD/arrow keys.
- Talk: click a nearby castaway or use the conversation controls.
- Tug of War: mash **PULL!** or press **Space**.

## Product intent

The camp phase is trying to make social movement readable: who leaves the group, where private conversations happen, and whether mundane camp tasks can double as social cover. Tug of War is deliberately simple; its purpose is to prove the transition from social phase → challenge phase before building richer multiplayer challenge logic.
