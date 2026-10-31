# Duckworks

Sidekick for HVAC and trades field techs.

- Weekday and Saturday morning, it reads work email and writes a truck brief for the day's jobs. It does not send or change mail.
- It turns a walkthrough, a sketch, or room sizes into a floor-plan SVG and a round-duct takeoff.
- It answers equipment and SOP questions from the data plate and the job in front of you, and it says when a number has to come from the manufacturer.

The duct sketch uses 1 cfm per square foot, or 400 cfm per ton when tonnage is given. Branches are sized near 600 fpm and a trunk near 800 fpm, then snapped up to a common round size. That is a field sketch, not a Manual D calculation.

The morning schedule is `30 11 * * 1-6` UTC (6:30am America/New_York standard time, 7:30am daylight time).

Connect Gmail on the Cursor account before the morning brief can see jobs. Mail send, delete, and label tools are not advertised.

## Run it locally

```bash
npx @grok/agent-sdk dev
```

Open the playground URL it prints. Ask for a duct sketch or for today's jobs.

```bash
npx @grok/agent-sdk validate --dir .
npx tsc --noEmit -p .
npm test
npx @grok/agent-sdk tool call duct_layout --dir . --input '{"rooms":[{"name":"Living","widthFt":20,"lengthFt":15,"xFt":0,"yFt":0}],"unit":{"xFt":0,"yFt":0,"label":"furnace"}}'
```

A model turn needs `npx @grok/agent-sdk login` or `CURSOR_API_KEY`.
