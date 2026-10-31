# Duckworks

Field sidekick for HVAC and trades techs. This is the working companion to the [Duckworks Grok Bot](https://x.ai/bot/d1ug4cTbeJgreRt7xr42e).

It does three jobs on a phone in the truck:

1. **Morning heads-up** — paste a dispatch email and get today’s board, stat jobs first, and a single pull list.
2. **Layouts** — turn a walkthrough (or a photo of a sketch) into rooms, the air handler, supplies, returns, and trunk lines.
3. **Straight answers** — equipment notes and SOPs you can follow in an attic: no-cool, charge, capacitors, condensate, furnaces, heat pumps, static, safety.

The book is local. No login, no model call. Dispatch and plans stay in this browser.

## Run it

```bash
npm install
npm test
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173).

## How a tech uses it

- **Briefing** already has a Largo / Clearwater / Seminole / Pinellas Park Saturday board. Paste another shop email (ServiceTitan-style labels or loose prose) and hit **Add job from email**.
- **Jobs** is the ticket: window, site, equipment, pull list, and the SOP that matches the complaint. **Sketch this job** sends the notes into Layout.
- **Layout** parses lines like `Living room 16x14` and `Supply to kitchen`. Upload a napkin photo as an underlay, then drag rooms.
- **Knowledge** answers “heat pump iced in heat” from the heat-pump SOP. Filter by charging, electrical, condensate, gas, duct, safety, or a model (GSX16, XR15, 24ACC).

## Source map

| Path | Role |
| --- | --- |
| `src/lib/emailParser.ts` | Dispatch → job |
| `src/lib/walkthrough.ts` | Walkthrough → floor plan |
| `src/lib/knowledgeSearch.ts` | Symptom / model → SOP |
| `src/data/knowledge.ts` | Field book |
| `src/data/jobs.ts` | Demo Tampa Bay board |

`npm test` covers those three parsers and the briefing pull list.
