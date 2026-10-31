import test from 'node:test';
import assert from 'node:assert/strict';
import { parseWalkthrough, SAMPLE_WALKTHROUGH } from '../js/parse-walkthrough.js';
import { buildPlan, roundDuctInches } from '../js/layout.js';
import { renderPlanSvg } from '../js/plan-svg.js';

test('sample house lays out a 3-ton supply plan', () => {
  const model = parseWalkthrough(SAMPLE_WALKTHROUGH);
  assert.equal(model.rooms.length, 6);
  assert.equal(model.tons, 3);
  assert.equal(model.handlerRoom.toLowerCase(), 'garage');
  assert.equal(model.condenserSide, 'east');
  assert.equal(model.returnRoom.toLowerCase(), 'living room');
  assert.equal(model.rooms[1].openTo.toLowerCase(), 'living room');

  const plan = buildPlan(model);
  assert.deepEqual(plan.warnings, []);
  assert.equal(plan.totalCfm, 1200);
  assert.equal(plan.supplies.length, 5);
  assert.equal(plan.rooms.find((room) => room.name === 'Garage').cfm, 0);
  const living = plan.rooms.find((room) => room.name === 'Living room');
  assert.equal(living.cfm, 423);
  assert.equal(living.duct, 12);
  assert.equal(plan.trunk.duct, 16);
  assert.equal(plan.trunk.cfm, 1200);
  assert.equal(
    plan.rooms.filter((room) => room.conditioned).reduce((sum, room) => sum + room.cfm, 0),
    1200,
  );
  assert.equal(plan.handler.room, 'Garage');
  assert.equal(plan.condenser.side, 'east');
  assert.equal(plan.openings.length, 1);
  assert.equal(plan.returns[0].room, 'Living room');
  assert.equal(plan.ducts.filter((duct) => duct.kind === 'supply').length, 5);
});

test('missing tonnage uses one CFM per square foot and says so', () => {
  const plan = buildPlan({
    rooms: [
      { name: 'Office', w: 10, d: 10, openTo: null },
    ],
    tons: null,
    warnings: [],
  });
  assert.equal(plan.totalCfm, 100);
  assert.equal(plan.rooms[0].duct, roundDuctInches(100, 600));
  assert.ok(plan.warnings.some((warning) => /1 CFM per square foot/.test(warning)));
});

test('room names cannot break out of the svg', () => {
  const plan = buildPlan({
    rooms: [{ name: '<script>alert(1)</script>', w: 12, d: 10, openTo: null }],
    tons: 1.5,
    warnings: [],
  });
  const svg = renderPlanSvg(plan);
  assert.equal(svg.includes('<script>'), false);
  assert.match(svg, /&lt;script&gt;/);
  assert.match(svg, /Trunk/);
  assert.match(svg, /AHU/);
});

test('a note with no rooms does not invent a layout', () => {
  const plan = buildPlan(parseWalkthrough('Call the office when you leave.'));
  assert.equal(plan.rooms.length, 0);
  assert.equal(renderPlanSvg(plan), '');
});
