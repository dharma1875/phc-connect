const test = require('node:test');
const assert = require('node:assert/strict');

const { calculateAttendanceStatus, buildAttendanceSummary } = require('../src/services/attendanceService');

test('calculateAttendanceStatus marks normal arrivals as PRESENT before 09:00', () => {
  assert.equal(calculateAttendanceStatus('08:45:00'), 'PRESENT');
});

test('calculateAttendanceStatus marks late arrivals as LATE after 09:00', () => {
  assert.equal(calculateAttendanceStatus('09:15:00'), 'LATE');
});

test('buildAttendanceSummary counts present, late, and absent rows', () => {
  const summary = buildAttendanceSummary([
    { status: 'PRESENT' },
    { status: 'LATE' },
    { status: 'ABSENT' },
    { status: 'PRESENT' },
  ]);

  assert.deepEqual(summary, {
    total: 4,
    present: 2,
    late: 1,
    absent: 1,
    checkedOut: 0,
    missing: 0,
  });
});
