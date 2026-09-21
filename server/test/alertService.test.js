const test = require('node:test');
const assert = require('node:assert/strict');

const {
  hasEvaluationTimePassed,
  buildAbsenceMessage,
} = require('../src/modules/alerts/alertService');

test('absence policy stays NOT MARKED before evaluation time', () => {
  assert.equal(hasEvaluationTimePassed('09:59', '10:00'), false);
  assert.equal(hasEvaluationTimePassed('10:00', '10:00'), true);
});

test('absence messages identify the doctor and date', () => {
  assert.match(buildAbsenceMessage('Dr. Raman', '2026-09-15'), /Dr\. Raman/);
  assert.match(buildAbsenceMessage('Dr. Raman', '2026-09-15'), /2026-09-15/);
});