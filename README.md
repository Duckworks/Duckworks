# Duckworks

Field sidekick for HVAC techs. Built for the morning you are already late, the house you just walked, and the question you would ask the lead if they picked up.

[Duckworks on Grok](https://x.ai/bot/d1ug4cTbeJgreRt7xr42e) is the same idea in a bot: a morning heads-up from the work email, a floor plan from a walkthrough, and straight answers on equipment and SOPs. This repo is the tool you can run on a phone or a shop computer.

## What it does

**Morning.** Paste the dispatch, or drop a `.txt` or `.eml` file. Duckworks sorts the stops, pulls the complaint, and lists what to stage before the first driveway. Addresses open in maps. Phone numbers dial. The sample route is fiction, so you can see the shape of a board without using a real ticket.

**Plan.** Write the walk the way you talk it: `Living room 18 x 14`, what it opens to, where the air handler sits, which way the condenser faces, and the tons. You can also trace a sketch or pin rooms while a walkthrough video plays. The drawing is a supply schematic: about 400 CFM per ton, split by room area, branches near 600 ft/min, trunk near 900, snapped to a standard round-pipe size. Garages and attics stay off the supply. Download the SVG. It is a way to talk through the house, not a permit set.

**Answers.** Ask for the symptom. Capacitor, frozen coil, float switch, heat pump blowing cool. You get the first move, the checks in order, the safety line, and the point where you stop and write it up.

The nameplate, the manufacturer’s instructions, and local code win when they disagree with a note in here.

## Run it

```bash
npm start
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173).

```bash
npm test
```

The morning board reads what you paste or drop. It does not sign in to a mailbox, and this repo does not keep a token that could.
