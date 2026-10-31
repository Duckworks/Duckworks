import { prompt } from "@grok/agent-sdk";
import { defineTool } from "@grok/agent-sdk/tools";
import { z } from "zod";
import { layoutDucts, type LayoutResult } from "../lib/layout.js";

const roomSchema = z.object({
  name: z.string().trim().min(1).max(40),
  widthFt: z.number().positive().max(200),
  lengthFt: z.number().positive().max(200),
  xFt: z.number().min(-500).max(500),
  yFt: z.number().min(-500).max(500),
});

const registerSchema = z.object({
  room: z.string().trim().min(1).max(40),
  wall: z.enum(["n", "e", "s", "w"]),
  kind: z.enum(["supply", "return"]),
  cfm: z.number().positive().max(20000).optional(),
});

export default defineTool({
  description: prompt`
    Draw a field sketch of a floor plan and round-duct layout from room sizes.
    Call this whenever the tech wants a floor plan, a duct layout, or a takeoff
    from a walkthrough, a sketch, or room dimensions. Do not invent duct sizes
    yourself. x increases east and y increases north, in feet, with one shared
    origin. Omit registers to place one supply per room and one return in the
    largest room.
  `,
  effect: "read",
  inputSchema: z.object({
    rooms: z.array(roomSchema).min(1).max(16),
    unit: z.object({
      xFt: z.number().min(-500).max(500),
      yFt: z.number().min(-500).max(500),
      label: z.string().trim().max(40).optional(),
    }),
    tons: z.number().positive().max(25).optional(),
    style: z.enum(["home-run", "trunk"]).optional(),
    registers: z.array(registerSchema).max(40).optional(),
  }),
  async execute(input): Promise<LayoutResult> {
    return layoutDucts({
      rooms: input.rooms,
      unit: input.unit,
      tons: input.tons,
      style: input.style,
      registers: input.registers,
    });
  },
});
