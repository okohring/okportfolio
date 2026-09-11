# Proposed realtime contract

Only `/api/health` and `/api/config` exist today. For multiplayer, suggested events include `match.snapshot`, `phase.changed`, `camp.action`, `challenge.pull`, `challenge.result`, `tribal.started`, `tribal.vote`, and `tribal.result`.

The server should include an explicit Tribal role in snapshots, e.g. `tribalRole: "participant" | "spectator"`. A `tribal.vote` from a spectator must be rejected.
