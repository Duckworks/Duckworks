import { describe, expect, it } from "vitest";
import { SAMPLE_WALKTHROUGH } from "../data/jobs";
import { parseWalkthrough, roomsOverlap } from "./walkthrough";

describe("parseWalkthrough", () => {
  it("extracts rooms, equipment, vents, and ducts", () => {
    const plan = parseWalkthrough(SAMPLE_WALKTHROUGH);
    const kinds = plan.items.map((item) => item.kind);
    expect(kinds).toContain("room");
    expect(kinds).toContain("equipment");
    expect(kinds).toContain("supply");
    expect(kinds).toContain("return");
    expect(kinds).toContain("duct");
    expect(plan.items.some((item) => /living/i.test(item.label))).toBe(true);
    expect(plan.items.some((item) => /ahu/i.test(item.label))).toBe(true);
    const rooms = plan.items.filter((item) => item.kind === "room");
    for (let i = 0; i < rooms.length; i += 1) {
      for (let j = i + 1; j < rooms.length; j += 1) {
        expect(roomsOverlap(rooms[i], rooms[j])).toBe(false);
      }
    }
  });

  it("ignores prose with no dimensions", () => {
    expect(parseWalkthrough("Just a noisy blower").items).toEqual([]);
  });
});
