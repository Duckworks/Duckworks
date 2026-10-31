import { defineArtifacts } from "@grok/agent-sdk/artifacts";
import * as z from "zod/v4";

export default defineArtifacts({
  kinds: {
    "morning-brief": {
      description: "A job-by-job morning heads-up from dispatch or work email.",
      schema: z.object({
        date: z.string(),
        jobCount: z.number(),
        source: z.string(),
      }),
    },
    "floor-plan": {
      description: "A field sketch of rooms and ducts. Not a stamped drawing.",
      schema: z.object({
        jobLabel: z.string(),
        roomCount: z.number(),
        filePath: z.string(),
      }),
    },
  },
});
