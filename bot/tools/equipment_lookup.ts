import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { lookupEquipment } from "../lib/hvac-kb.js";

export default defineTool({
  description: prompt`
    Look up a local HVAC equipment or SOP card (capacitors, charge,
    drains, static, furnace sequence, defrost, recovery, coil clean,
    duct takeoff, nameplates). Call this before you answer a parts or
    procedure question. It does not invent model-specific OEM numbers.
  `,
  effect: "read",
  inputSchema: z.object({
    query: z.string().describe("Symptom, part, refrigerant, or SOP topic."),
  }),
  async execute({ query }) {
    const cards = lookupEquipment(query);
    return {
      query,
      matchCount: cards.length,
      cards,
      disclaimer:
        "Field aid only. Read the nameplate. Not a stamped design or a license.",
    };
  },
});
