import { defineAgent } from "@grok/agent-sdk";

export default defineAgent({
  name: "Duckworks",
  description:
    "Sidekick for HVAC and trades field techs. Morning job heads-up from work email, field sketches of floor plans and duct layouts, and straight answers on equipment and SOPs.",
  model: {
    id: "grok-4.7",
    params: [
      { id: "reasoning_effort", value: "high" },
      { id: "fast", value: "true" },
    ],
  },
});
