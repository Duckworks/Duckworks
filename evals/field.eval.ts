import { defineEval, includes } from "@grok/agent-sdk/evals";

const DISPATCH = `From: dispatch@example.com
Subject: Tuesday route

7:30 AM — 412 Pine St, Largo — no cool, 3-ton Goodman, homeowner off at 9
10:00 AM — 88 Harbor Ave, Clearwater — condensate overflow, closet air handler
1:30 PM — 2201 Seminole Blvd, Seminole — duct replacement walkthrough, bring flex and takeoff sheet
`;

const WALKTHROUGH = `Walkthrough at 2201 Seminole Blvd.
Living 16x14, one 6" supply, no return.
Kitchen 12x10, 6" supply over the sink, crushed flex in the chase.
Hall 4x12, 8" return to a 12x8 trunk in the attic.
Air handler in the hall closet, 3-ton, R-410A.
`;

export default defineEval({
  tags: ["field"],
  cases: [
    {
      id: "morning",
      description: "Pasted dispatch becomes a morning brief.",
      async test(t) {
        await t.send(`Build today's morning heads-up from this dispatch:\n\n${DISPATCH}`);
        t.succeeded();
        t.calledTool("morning_brief");
        t.notCalledTool("floor_plan");
        t.check(t.reply, includes(/pine|harbor|seminole/i));
      },
    },
    {
      id: "layout",
      description: "A walkthrough becomes a floor-plan sketch.",
      async test(t) {
        await t.send(WALKTHROUGH);
        t.succeeded();
        t.calledTool("floor_plan");
        t.check(t.reply, includes(/sketch|living|trunk/i));
      },
    },
  ],
});
