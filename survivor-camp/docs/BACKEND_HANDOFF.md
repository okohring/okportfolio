# Backend handoff

The browser currently simulates camp movement, NPC behavior, camp jobs, challenge inputs, and Tribal voting.

Move these server-side for multiplayer: lobby/tribe assignment, phase timestamps, player locations, camp resource changes, challenge input rate limiting/results, Tribal rosters, vote eligibility, vote secrecy, tallies, reconnect snapshots, and event logs.

## Required phase rule

- If the player's tribe **loses** the immunity challenge, that player attends Tribal Council and is eligible to cast a vote.
- If the player's tribe **wins** immunity, that player may view the losing tribe's Tribal Council but must be **spectator-only**. The server must reject vote/participation events from spectators even if a modified client sends them.

## Camp jobs

The four visible camp resources are Fire, Water, Food, and Shelter. The current client increments them locally through location-based actions. In production, treat each job action as a validated server event with cooldown/rate limits.
