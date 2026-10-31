import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseDispatch,
  SAMPLE_DISPATCH,
  startMinutes,
  categorize,
} from '../js/parse-dispatch.js';

test('sample dispatch becomes three stops in route order', () => {
  const board = parseDispatch(SAMPLE_DISPATCH, { now: new Date('2026-10-31T15:00:00Z') });
  assert.equal(board.dateLabel, 'Saturday, October 31');
  assert.equal(board.jobs.length, 3);
  assert.deepEqual(
    board.jobs.map((job) => job.customer),
    ['Maria Alvarez', 'James Okonkwo', 'Priya Shah'],
  );
  assert.deepEqual(
    board.jobs.map((job) => job.startMinutes),
    [7 * 60 + 30, 10 * 60, 13 * 60 + 15],
  );
  assert.equal(board.jobs[0].category, 'No cool');
  assert.equal(board.jobs[1].category, 'Maintenance');
  assert.equal(board.jobs[2].category, 'Airflow');
  assert.equal(board.jobs[0].phone, '727-555-0148');
  assert.match(board.jobs[0].address, /418 Sample Ave/);
  assert.ok(board.jobs[0].stage.some((item) => /capacitor/i.test(item)));
  assert.ok(board.jobs[0].stage.some((item) => /disconnect/i.test(item)));
  assert.equal(board.summary.stops, 3);
  assert.match(board.summary.first, /7:30/);
});

test('an html dispatch email keeps the complaint', () => {
  const raw = `From: Dispatch <dispatch@example.com>
Subject: Today
MIME-Version: 1.0
Content-Type: text/html

<html><body><p>9 AM</p><p>Customer: Ana Ruiz</p><p>Address: 10 Oak St, Largo, FL 33778</p><p>Complaint: No heat. Heat pump blows cool air.</p></body></html>`;
  const board = parseDispatch(raw);
  assert.equal(board.jobs.length, 1);
  assert.equal(board.jobs[0].customer, 'Ana Ruiz');
  assert.equal(board.jobs[0].category, 'No heat');
  assert.equal(board.jobs[0].startMinutes, 9 * 60);
  assert.match(board.jobs[0].address, /10 Oak St/);
});

test('11-1 PM starts in the morning', () => {
  assert.equal(startMinutes('11-1 PM'), 11 * 60);
  assert.equal(startMinutes('1-3 PM'), 13 * 60);
  assert.equal(categorize('Water at the handler'), 'Water');
});

test('a paste with no stop explains itself', () => {
  const board = parseDispatch('See you at the shop.');
  assert.equal(board.jobs.length, 0);
  assert.equal(board.warnings.length, 1);
});
