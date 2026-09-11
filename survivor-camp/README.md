# Survivor Camp Prototype v0.5

Developer handoff with the **illustrated island/camp presentation restored**.

## Playable loop

1. 30-second Camp phase on the illustrated island.
2. Camp jobs: **Fire, Water, Food, Shelter**.
3. Tug of War immunity challenge.
4. **Lose challenge:** attend Tribal Council and cast a vote.
5. **Win challenge:** view the losing tribe's Tribal Council in spectator-only mode.
6. Tribal Council lasts 30 seconds, then votes are revealed.

## Run

Requires Node.js 18+.

```bash
npm start
```

Then open `http://localhost:3000`.

## Controls

- Click the island or use WASD/arrow keys to move.
- Click nearby castaways or use Talk actions to converse.
- Camp jobs are location-based: Tend Fire, collect water, gather food/fish, repair shelter.
- Tug of War: click **PULL!** or press Space.
- If your tribe loses, choose and cast one Tribal vote before the timer ends.

## Backend note

The prototype is client-simulated. Production multiplayer must make phase timing, challenge results, Tribal eligibility, and vote acceptance authoritative on the server. In particular, **challenge loss grants voting participation; challenge win grants read-only spectator access to the other tribe's Council.**
