import { defineAgent } from "@grok/agent-sdk";

export default defineAgent({
  name: "Duckworks",
  description:
    "Field-tech sidekick for HVAC and trades: morning job briefs from work email, floor-plan and duct sketches from walkthroughs, and straight equipment/SOP answers.",
  model: {
    id: "grok-4.7",
    params: [
      { id: "reasoning_effort", value: "high" },
      { id: "fast", value: "true" },
    ],
  },
});
