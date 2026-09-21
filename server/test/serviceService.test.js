const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeServiceValue,
  groupMonthlyServiceTotals,
} = require('../src/services/serviceService');

test('normalizeServiceValue accepts valid integer values', () => {
  assert.equal(normalizeServiceValue('OPD Patients', 58), 58);
});

test('normalizeServiceValue rejects negative values', () => {
  assert.throws(() => normalizeServiceValue('ANC Check-ups', -1), /non-negative whole number/i);
});

test('normalizeServiceValue maps medicine stock statuses to valid values', () => {
  assert.equal(normalizeServiceValue('Medicine Stock Status', 'LOW_STOCK'), 2);
});

test('groupMonthlyServiceTotals sums totals by service type', () => {
  const totals = groupMonthlyServiceTotals([
    { service_type_name: 'OPD Patients', value: 58 },
    { service_type_name: 'OPD Patients', value: 42 },
    { service_type_name: 'ANC Check-ups', value: 12 },
  ]);

  assert.deepEqual(totals, [
    { serviceType: 'OPD Patients', total: 100 },
    { serviceType: 'ANC Check-ups', total: 12 },
  ]);
});
