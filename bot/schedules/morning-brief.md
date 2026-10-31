---
cron: "30 10 * * 1-5"
---

Draft today's Duckworks morning heads-up. It is weekday morning in
America/New_York.

1. Call `morning_brief` with lookbackHours=36. Do not invent a route.
   If a previous turn stored dispatch text, pass it as emails.
2. If the tool returns no jobs, say that dispatch was empty and ask the
   tech to paste today's route. Do not invent stops.
3. Reply with the job-by-job brief: time window, address, work type,
   parts/risks, and the van pull list.
4. Never send email. Never contact a customer.
