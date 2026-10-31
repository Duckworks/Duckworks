import assert from "node:assert/strict";
import { test } from "node:test";
import { layoutDucts, roundDuctInches } from "./layout.js";

test("200 cfm at 600 fpm snaps to 8 in", () => {
  assert.equal(roundDuctInches(200, 600).inches, 8);
});

test("two adjacent rooms get area CFM, two supplies, and one return", () => {
  const layout = layoutDucts({
    rooms: [
      { name: "Living", widthFt: 20, lengthFt: 15, xFt: 0, yFt: 0 },
      { name: "Bedroom", widthFt: 12, lengthFt: 12, xFt: 20, yFt: 0 },
    ],
    unit: { xFt: 0, yFt: 0, label: "Furnace" },
  });
  assert.equal(layout.totalCfm, 444);
  assert.equal(layout.registers.filter((register) => register.kind === "supply").length, 2);
  assert.equal(layout.registers.filter((register) => register.kind === "return").length, 1);
  assert.equal(layout.registers.find((register) => register.kind === "return")?.cfm, 444);
  assert.match(layout.svg, /Living/);
  assert.doesNotMatch(layout.svg, /<script/);
  assert.equal(
    layout.warnings.some((warning) => /overlap/i.test(warning)),
    false,
  );
});

test("tonnage sizes a trunk and escapes room names in the SVG", () => {
  const layout = layoutDucts({
    rooms: [{ name: "Hall <A>", widthFt: 10, lengthFt: 10, xFt: 0, yFt: 0 }],
    unit: { xFt: 0, yFt: 0 },
    tons: 3,
    style: "trunk",
  });
  assert.equal(layout.totalCfm, 1200);
  assert.match(layout.svg, /Hall &lt;A&gt;/);
  const trunk = layout.runs.find((run) => run.kind === "trunk");
  assert.ok(trunk);
  assert.ok(trunk.diameterIn >= 16);
});

test("empty room lists throw and real overlaps warn", () => {
  assert.throws(() => layoutDucts({ rooms: [], unit: { xFt: 0, yFt: 0 } }));
  const overlap = layoutDucts({
    rooms: [
      { name: "A", widthFt: 10, lengthFt: 10, xFt: 0, yFt: 0 },
      { name: "B", widthFt: 10, lengthFt: 10, xFt: 5, yFt: 0 },
    ],
    unit: { xFt: 0, yFt: 0 },
  });
  assert.equal(
    overlap.warnings.some((warning) => /overlaps/i.test(warning)),
    true,
  );
});
