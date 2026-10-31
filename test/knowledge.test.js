import test from 'node:test';
import assert from 'node:assert/strict';
import { searchKnowledge, KNOWLEDGE } from '../js/knowledge.js';

test('symptom words find the note a tech would ask for', () => {
  assert.equal(searchKnowledge('capacitor')[0].item.id, 'outdoor-unit-silent');
  assert.equal(searchKnowledge('frozen coil')[0].item.id, 'frozen-coil');
  assert.equal(searchKnowledge('float switch')[0].item.id, 'float-switch');
  assert.equal(searchKnowledge('refrigerant')[0].item.id, 'do-not-add-refrigerant-first');
});

test('an empty question lists the whole notebook', () => {
  assert.equal(searchKnowledge('   ').length, KNOWLEDGE.length);
});

test('every note has a first answer, checks, and a place to stop', () => {
  for (const entry of KNOWLEDGE) {
    assert.ok(entry.lead.length > 40, entry.id);
    assert.ok(entry.checks.length >= 3, entry.id);
    assert.ok(entry.safety.length > 20, entry.id);
    assert.ok(entry.stop.length > 20, entry.id);
  }
});
