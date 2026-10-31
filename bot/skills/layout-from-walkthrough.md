---
description: Use when turning a walkthrough, video transcript, or sketch into rooms and ducts.
---

# Layout from a walkthrough

1. List every named room. Guessing a missing dimension is allowed only if you mark it `est`.
2. For each room capture width × depth, supply count, return count, and obvious problems (kinked flex, no return, low headroom).
3. Note trunk size, takeoff size, and equipment location (attic, closet, pad).
4. Call `floor_plan` once with those rooms and ducts. Put equipment in `equipment`.
5. Reply with the sketch, a takeoff list, and the three riskiest runs. Label it a field sketch.

If the user only sent a video and no transcript, say you need the walkthrough notes or a still of each room. Do not claim you watched a file that is not in the turn.
