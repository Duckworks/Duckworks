import { defineEval, includes } from "@grok/agent-sdk/evals";

export default defineEval({
  tags: ["smoke"],
  cases: [
    {
      id: "capacitor",
      description: "A no-start condenser question hits the SOP card.",
      async test(t) {
        await t.send(
          "Condenser hums and will not start. 3-ton. What do I check on the dual capacitor?",
        );
        t.succeeded();
        t.calledTool("equipment_lookup");
        t.notCalledTool("floor_plan");
        t.check(t.reply, includes(/capacitor|nameplate|µF|uF|microfarad/i));
      },
    },
  ],
});
