# Survivor Camp Prototype v0.4

Current playable loop:

1. 30-second camp/social phase.
2. Camp phase summary.
3. 12-second Tug of War button-mash challenge.
4. 30-second Tribal Council.
5. Vote reveal/result and restart.

## Tribal Council rule in this prototype

The Tug of War result controls Council permissions:

- **Lose Tug of War:** you may view the full 30-second Tribal Council and vote reveal, but you are a spectator only. Voting and participation controls are disabled.
- **Win Tug of War:** voting controls are enabled and you may submit one vote before the timer expires.

This permission distinction is intentional and should be enforced by the backend rather than trusted from the client.

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
  app.js                Camp + Tug of War prototype logic
  tribal.css            Tribal Council UI
  tribal.js             Tribal Council permission/timer/vote prototype
src/
  gameConfig.js         Server-owned prototype tuning values
server.js               Static server + minimal JSON API
package.json
docs/
  BACKEND_HANDOFF.md    General multiplayer backend notes
  API_CONTRACT.md       Proposed multiplayer HTTP/WebSocket contract
  TRIBAL_COUNCIL.md     Council-specific backend rules
```

## Existing API

- `GET /api/health` — liveness check.
- `GET /api/config` — prototype tuning values, including the 30-second Camp and Tribal Council timers.

## Important implementation note

The NPCs, camp movement, conversations, challenge result, and Tribal Council tally are currently simulated in the browser. That is intentional for rapid gameplay iteration. **Do not treat client state as authoritative in multiplayer.**

## Prototype controls

- Move: click or WASD/arrow keys.
- Talk: click a nearby castaway or use the conversation controls.
- Tug of War: mash **PULL!** or press **Space**.
- Tribal Council: participant mode can select/cast one vote; spectator mode is read-only.
