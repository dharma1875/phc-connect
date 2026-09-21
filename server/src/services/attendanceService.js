function normalizeTimeValue(value) {
  if (!value) {
    return null;
  }

  const [hours = '00', minutes = '00', seconds = '00'] = String(value).split(':');
  const hh = String(Number(hours)).padStart(2, '0');
  const mm = String(Number(minutes)).padStart(2, '0');
  const ss = String(Number(seconds)).padStart(2, '0');

  return `${hh}:${mm}:${ss}`;
}

function calculateAttendanceStatus(checkInTime) {
  const normalizedTime = normalizeTimeValue(checkInTime);
  if (!normalizedTime) {
    return 'ABSENT';
  }

  const threshold = '09:00:00';
  return normalizedTime <= threshold ? 'PRESENT' : 'LATE';
}

function buildAttendanceSummary(rows = []) {
  const summary = {
    total: rows.length,
    present: 0,
    late: 0,
    absent: 0,
    checkedOut: 0,
    missing: 0,
  };

  rows.forEach((row) => {
    const status = row.status || 'ABSENT';
    const hasCheckIn = Object.prototype.hasOwnProperty.call(row, 'check_in_time') && Boolean(row.check_in_time);
    const hasCheckOut = Object.prototype.hasOwnProperty.call(row, 'check_out_time') && Boolean(row.check_out_time);

    if (status === 'PRESENT') summary.present += 1;
    if (status === 'LATE') summary.late += 1;
    if (status === 'ABSENT') summary.absent += 1;
    if (hasCheckOut) summary.checkedOut += 1;
    if (status !== 'ABSENT' && (Object.prototype.hasOwnProperty.call(row, 'check_in_time') || Object.prototype.hasOwnProperty.call(row, 'check_out_time')) && (!hasCheckIn || !hasCheckOut)) {
      summary.missing += 1;
    }
  });

  return summary;
}

module.exports = {
  calculateAttendanceStatus,
  buildAttendanceSummary,
  normalizeTimeValue,
};
