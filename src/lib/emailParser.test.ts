import { describe, expect, it } from "vitest";
import { SAMPLE_DISPATCH } from "../data/jobs";
import { detectJobType, jobFromParsed, parseDispatchEmail } from "./emailParser";

describe("parseDispatchEmail", () => {
  it("reads a labeled dispatch", () => {
    const parsed = parseDispatchEmail(SAMPLE_DISPATCH);
    expect(parsed.customer).toBe("Angela Brooks");
    expect(parsed.city).toBe("Safety Harbor");
    expect(parsed.address).toMatch(/312 Harbor View/i);
    expect(parsed.type).toBe("leak");
    expect(parsed.equipment).toMatch(/Carrier 24ACC6/i);
    expect(parsed.phone).toMatch(/727/);
  });

  it("detects no-cool from loose prose", () => {
    expect(detectJobType("Unit won't cool and the house is 82")).toBe("no_cool");
    expect(detectJobType("Seasonal tune-up")).toBe("maintenance");
  });

  it("builds a stat leak ticket with drain parts", () => {
    const job = jobFromParsed(parseDispatchEmail(SAMPLE_DISPATCH), SAMPLE_DISPATCH);
    expect(job.priority).toBe("stat");
    expect(job.partsHints).toContain("condensate pump");
    expect(job.sopIds).toContain("sop-condensate");
    expect(job.source).toBe("email");
  });
});
