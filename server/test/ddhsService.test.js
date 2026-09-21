const test = require('node:test');
const assert = require('node:assert/strict');

const { buildAttendanceCounts, buildFacilitySummary } = require('../src/modules/ddhs/ddhsService');

test('buildAttendanceCounts includes notMarked when records are missing', () => {
  const summary = buildAttendanceCounts({ present: 5, late: 2, absent: 1, leave: 0, totalDoctors: 12 });

  assert.deepEqual(summary, {
    present: 5,
    late: 2,
    notMarked: 4,
    absent: 1,
    leave: 0,
  });
});

test('buildFacilitySummary groups facility counts by type', () => {
  const summary = buildFacilitySummary([
    { facility_type: 'PHC', total: 4 },
    { facility_type: 'UPHC', total: 2 },
    { facility_type: 'HSC', total: 3 },
  ]);

  assert.deepEqual(summary, {
    phc: 4,
    uphc: 2,
    hsc: 3,
  });
});
