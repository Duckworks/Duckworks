import { describe, expect, it } from "vitest";
import { DEMO_JOBS } from "../data/jobs";
import { briefingHeadline, pullList, sortJobs } from "./briefing";

describe("briefing", () => {
  it("puts stat jobs first", () => {
    const ordered = sortJobs(DEMO_JOBS);
    expect(ordered[0]?.priority).toBe("stat");
    expect(ordered.at(-1)?.priority).toBe("flex");
  });

  it("rolls a shared pull list", () => {
    const caps = pullList(DEMO_JOBS).find((item) => item.name.includes("capacitor") || item.name.includes("static"));
    expect(caps).toBeTruthy();
  });

  it("counts stat jobs in the headline", () => {
    expect(briefingHeadline(DEMO_JOBS)).toMatch(/stat/i);
    expect(briefingHeadline([])).toMatch(/paste a dispatch/i);
  });
});
