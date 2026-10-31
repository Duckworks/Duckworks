# Duckworks

Field-tech sidekick for HVAC and trades. This repo is the Agent SDK
version of the Grok Bot at
[x.ai/bot/d1ug4cTbeJgreRt7xr42e](https://x.ai/bot/d1ug4cTbeJgreRt7xr42e).

It drafts a morning heads-up from work email or pasted dispatch, turns
walkthrough notes into a floor-plan and duct sketch, and answers
equipment and SOP questions from a local field card.

Grok Bot import (`agent-sdk init --from grokbot`) is no longer in the
CLI, so this project recreates the public bot from its card and the
same three jobs.

## What it does

- Weekday morning brief (10:30 UTC cron, about 6:30 AM Eastern).
- `morning_brief` parses pasted dispatch or work-order email. It does not
  send mail. Add a Gmail `cursorAccount` host connection after you log in
  if you want the weekday search to read the inbox.
- `floor_plan` renders an SVG field sketch. Not a stamped drawing.
- `equipment_lookup` returns local SOP cards. It does not invent OEM numbers.

## Test it locally

```bash
npx --yes "@grok/agent-sdk@0.5.0" validate --dir .
npx --yes "@grok/agent-sdk@0.5.0" info --dir . --json
npx tsc --noEmit
npx --yes "@grok/agent-sdk@0.5.0" tool call equipment_lookup --dir . --input '{"query":"dual capacitor"}'
npx --yes "@grok/agent-sdk@0.5.0" run --dir . --message "Condenser hums and will not start. What do I check?"
npx --yes "@grok/agent-sdk@0.5.0" eval --dir .
npx --yes "@grok/agent-sdk@0.5.0" dev
```

Playground: the URL `dev` prints (`http://127.0.0.1:3000/playground`).
Paste dispatch to try the morning brief. The tools never send email.

## Deploy it

1. Commit and push this project.
2. Run `npx --yes "@grok/agent-sdk@0.5.0" validate --dir .`, then
   `npx --yes "@grok/agent-sdk@0.5.0" deploy --dir . --dry-run`.
3. Run `npx --yes "@grok/agent-sdk@0.5.0" deploy --dir .` in your own
   terminal so the one-time alias token stays off this transcript.
4. Open [Deployed Agents](https://cursor.com/dashboard/deployed-agents).
5. Optional: add `bot/host-connections/gmail.ts` with
   `defineConnection({ cursorAccount: true, servers: ["Gmail"] })` after
   you can sign in, then redeploy.
