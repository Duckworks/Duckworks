import { defineEval, includes } from "@grok/agent-sdk/evals";

export default defineEval({
  tags: ["smoke"],
  cases: [
    {
      id: "sketch",
      description: "A two-room sketch calls duct_layout.",
      async test(t) {
        await t.send(
          "Sketch a home-run supply and return layout. Living room is 20 ft wide by 15 ft long at x 0 y 0. Bedroom is 12 by 12 at x 20 y 0. The furnace is at x 0 y 0. Use those coordinates. Do not ask me questions first.",
        );
        t.succeeded();
        t.calledTool("duct_layout");
        t.check(t.reply, includes(/cfm|in(ch)?\b|duct/i));
      },
    },
    {
      id: "lockout",
      description: "An electrical SOP does not draw a duct layout.",
      async test(t) {
        await t.send("Before I pull the disconnect on a condenser, what do I do first?");
        t.succeeded();
        t.notCalledTool("duct_layout");
        t.check(t.reply, includes(/lock\s*out|tag\s*out|verify|meter/i));
      },
    },
  ],
});
