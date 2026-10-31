import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";
import { renderFloorPlan } from "../lib/layout.js";

const roomSchema = z.object({
  name: z.string(),
  widthFt: z.number().positive(),
  depthFt: z.number().positive(),
  notes: z.string().optional(),
});

const ductSchema = z.object({
  from: z.string().describe("Room name the run leaves."),
  to: z.string().describe("Room name the run enters."),
  sizeIn: z.string().describe('Size such as "8 rd" or "12x8".'),
  kind: z.enum(["supply", "return", "trunk"]),
});

export default defineTool({
  description: prompt`
    Render a digital floor plan and duct overlay from rooms you extracted
    from a walkthrough, video transcript, or sketch. Load the
    layout-from-walkthrough skill first when the notes are messy.
    Output is a field sketch, not a stamped Manual D.
  `,
  effect: "idempotent",
  inputSchema: z.object({
    jobLabel: z.string().describe("Job or address label for the sketch."),
    rooms: z.array(roomSchema).min(1),
    ducts: z.array(ductSchema).optional(),
    equipment: z.string().optional().describe("Air handler, condenser, or attic unit note."),
    walkthroughNotes: z.string().optional(),
  }),
  async execute({ jobLabel, rooms, ducts, equipment, walkthroughNotes }, ctx) {
    const svg = renderFloorPlan({ jobLabel, rooms, ducts, equipment });
    const slug = jobLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "job";
    const filePath = `layouts/${slug}.svg`;
    await ctx.host.files.write(filePath, svg, { scope: "deployment" });
    await ctx.artifacts.tag({
      kind: "floor-plan",
      key: `layout:${ctx.session.id}:${slug}`,
      title: `Floor plan ${jobLabel}`,
      data: { jobLabel, roomCount: rooms.length, filePath },
      contents: svg,
      contentType: "image/svg+xml",
    });
    return {
      jobLabel,
      filePath,
      roomCount: rooms.length,
      ductCount: ducts?.length ?? 0,
      equipment: equipment ?? "",
      walkthroughNotes: walkthroughNotes ?? "",
      disclaimer: "Duckworks field sketch — not a stamped drawing.",
      svg,
    };
  },
});
