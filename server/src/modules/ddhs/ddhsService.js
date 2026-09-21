const { pool } = require('../../config/db');
const { getAlertSummary } = require('../alerts/alertService');

function getCurrentDateInKolkata() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}

function buildFacilitySummary(rows = []) {
  const summary = { phc: 0, uphc: 0, hsc: 0 };

  rows.forEach((row) => {
    const type = String(row.facility_type || '').toLowerCase();
    if (type === 'phc') summary.phc = Number(row.total) || 0;
    if (type === 'uphc') summary.uphc = Number(row.total) || 0;
    if (type === 'hsc') summary.hsc = Number(row.total) || 0;
  });

  return summary;
}

function buildAttendanceCounts(attendanceSummary = {}) {
  const present = Number(attendanceSummary.present) || 0;
  const late = Number(attendanceSummary.late) || 0;
  const absent = Number(attendanceSummary.absent) || 0;
  const leave = Number(attendanceSummary.leave ?? attendanceSummary.leave_count) || 0;
  const totalDoctors = Number(attendanceSummary.totalDoctors) || 0;

  return {
    present,
    late,
    notMarked: Math.max(totalDoctors - present - late - absent - leave, 0),
    absent,
    leave,
  };
}

async function getDashboardSummary() {
  const [facilityCounts] = await pool.query(
    `
      SELECT facility_type, COUNT(*) AS total
      FROM facilities
      WHERE status = 'ACTIVE'
      GROUP BY facility_type
    `
  );

  const [doctorCountRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM doctors WHERE status = 'ACTIVE'`
  );

  const [attendanceRows] = await pool.query(
    `
      SELECT
        SUM(CASE WHEN ar.status = 'PRESENT' THEN 1 ELSE 0 END) AS present,
        SUM(CASE WHEN ar.status = 'LATE' THEN 1 ELSE 0 END) AS late,
        SUM(CASE WHEN ar.status = 'ABSENT' THEN 1 ELSE 0 END) AS absent,
        SUM(CASE WHEN ar.status = 'LEAVE' THEN 1 ELSE 0 END) AS leave_count,
        COUNT(DISTINCT d.id) AS totalDoctors
      FROM doctors d
      LEFT JOIN doctor_facility_assignments a
        ON a.doctor_id = d.id AND a.is_active = TRUE
      LEFT JOIN attendance_records ar
        ON ar.doctor_id = d.id
       AND ar.facility_id = a.facility_id
       AND ar.attendance_date = CURDATE()
      WHERE d.status = 'ACTIVE'
    `
  );

  const [servicesRows] = await pool.query(
    `
      SELECT COUNT(*) AS submittedToday
      FROM daily_service_reports
      WHERE service_date = CURDATE()
    `
  );

  const facilitySummary = buildFacilitySummary(facilityCounts);
  const attendanceSummary = buildAttendanceCounts(attendanceRows[0] || {});
  const alertSummary = await getAlertSummary();

  return {
    facilities: facilitySummary,
    doctors: Number(doctorCountRows[0]?.total || 0),
    attendance: attendanceSummary,
    services: {
      submittedToday: Number(servicesRows[0]?.submittedToday || 0),
    },
    alerts: {
      open: alertSummary.open,
      highSeverity: alertSummary.highSeverity,
    },
  };
}

async function getDistricts() {
  const [rows] = await pool.query(
    `SELECT id, name FROM districts WHERE status = 'ACTIVE' ORDER BY name ASC`
  );

  return rows;
}

async function getTaluksByDistrict(districtId) {
  const [rows] = await pool.query(
    `SELECT id, name FROM taluks WHERE district_id = ? AND status = 'ACTIVE' ORDER BY name ASC`,
    [districtId]
  );

  return rows;
}

async function getFacilities(filters = {}) {
  const {
    districtId,
    talukId,
    facilityType,
    status,
    search,
  } = filters;

  let query = `
    SELECT f.id, f.name, f.facility_type, f.address, f.status,
           d.name AS district_name,
           t.name AS taluk_name,
           COUNT(DISTINCT dfa.doctor_id) AS doctor_count
    FROM facilities f
    INNER JOIN districts d ON d.id = f.district_id
    INNER JOIN taluks t ON t.id = f.taluk_id
    LEFT JOIN doctor_facility_assignments dfa ON dfa.facility_id = f.id AND dfa.is_active = TRUE
    WHERE 1 = 1
  `;
  const params = [];

  if (districtId) {
    query += ' AND f.district_id = ?';
    params.push(Number(districtId));
  }

  if (talukId) {
    query += ' AND f.taluk_id = ?';
    params.push(Number(talukId));
  }

  if (facilityType) {
    query += ' AND f.facility_type = ?';
    params.push(facilityType);
  }

  if (status) {
    query += ' AND f.status = ?';
    params.push(status);
  }

  if (search) {
    query += ' AND (f.name LIKE ? OR f.id LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' GROUP BY f.id, f.name, f.facility_type, f.address, f.status, d.name, t.name';
  query += ' ORDER BY f.name ASC';

  const [rows] = await pool.query(query, params);
  return rows;
}

async function getFacilityById(facilityId) {
  const [rows] = await pool.query(
    `
      SELECT f.id, f.name, f.facility_type, f.address, f.status,
             d.name AS district_name,
             t.name AS taluk_name,
             f.district_id,
             f.taluk_id
      FROM facilities f
      INNER JOIN districts d ON d.id = f.district_id
      INNER JOIN taluks t ON t.id = f.taluk_id
      WHERE f.id = ?
      LIMIT 1
    `,
    [facilityId]
  );

  return rows[0] || null;
}

async function getFacilityDoctors(facilityId) {
  const [rows] = await pool.query(
    `
            SELECT d.id, d.full_name, d.designation, d.specialization, d.doctor_id,
              ar.status AS attendance_status,
              CASE WHEN ar.id IS NULL THEN 'NOT_MARKED' ELSE ar.status END AS attendance_value,
              CASE WHEN dsr.id IS NULL THEN 'NOT_SUBMITTED' ELSE 'SUBMITTED' END AS service_status,
              dsr.submitted_at AS service_submitted_at
      FROM doctor_facility_assignments a
      INNER JOIN doctors d ON d.id = a.doctor_id
      LEFT JOIN attendance_records ar
        ON ar.doctor_id = d.id
       AND ar.facility_id = a.facility_id
       AND ar.attendance_date = CURDATE()
      LEFT JOIN daily_service_reports dsr
        ON dsr.doctor_id = d.id
       AND dsr.facility_id = a.facility_id
       AND dsr.service_date = CURDATE()
      WHERE a.facility_id = ? AND a.is_active = TRUE
      ORDER BY d.full_name ASC
    `,
    [facilityId]
  );

  return rows;
}

async function getFacilityServiceStatus(facilityId) {
  const [rows] = await pool.query(
    `
      SELECT dsr.id, dsr.submitted_at, dsr.service_date,
             COUNT(*) AS report_count
      FROM daily_service_reports dsr
      WHERE dsr.facility_id = ?
        AND dsr.service_date = CURDATE()
        AND dsr.submitted_at IS NOT NULL
      GROUP BY dsr.service_date, dsr.submitted_at, dsr.id
      ORDER BY dsr.submitted_at DESC
      LIMIT 1
    `,
    [facilityId]
  );

  return rows[0] || null;
}

async function getAttendanceRecords(filters = {}) {
  const {
    districtId,
    talukId,
    facilityId,
    facilityType,
    date,
    status,
  } = filters;
  const attendanceDate = date || getCurrentDateInKolkata();

  let query = `
    SELECT ar.id, COALESCE(ar.attendance_date, ?) AS attendance_date,
           ar.check_in_time, ar.check_out_time,
           COALESCE(ar.status, 'NOT_MARKED') AS status,
           d.full_name AS doctor_name,
           f.name AS facility_name,
           f.facility_type,
           t.name AS taluk_name,
           dist.name AS district_name
    FROM doctor_facility_assignments a
    INNER JOIN doctors d ON d.id = a.doctor_id AND d.status = 'ACTIVE'
    INNER JOIN facilities f ON f.id = a.facility_id
    INNER JOIN taluks t ON t.id = f.taluk_id
    INNER JOIN districts dist ON dist.id = f.district_id
    LEFT JOIN attendance_records ar
      ON ar.doctor_id = a.doctor_id
     AND ar.facility_id = a.facility_id
     AND ar.attendance_date = ?
    WHERE a.is_active = TRUE
  `;
  const params = [attendanceDate, attendanceDate];

  if (districtId) {
    query += ' AND f.district_id = ?';
    params.push(Number(districtId));
  }

  if (talukId) {
    query += ' AND f.taluk_id = ?';
    params.push(Number(talukId));
  }

  if (facilityId) {
    query += ' AND f.id = ?';
    params.push(Number(facilityId));
  }

  if (facilityType) {
    query += ' AND f.facility_type = ?';
    params.push(facilityType);
  }

  if (date) {
  }

  if (status === 'NOT_MARKED') {
    query += ' AND ar.id IS NULL';
  } else if (status) {
    query += ' AND ar.status = ?';
    params.push(status);
  }

  query += ' ORDER BY d.full_name ASC';

  const [rows] = await pool.query(query, params);
  return rows;
}

async function getAttendanceSummary(filters = {}) {
  const rows = await getAttendanceRecords(filters);

  const summary = {
    present: 0,
    late: 0,
    notMarked: 0,
    absent: 0,
    leave: 0,
  };

  rows.forEach((row) => {
    if (row.status === 'PRESENT') summary.present += 1;
    if (row.status === 'LATE') summary.late += 1;
    if (row.status === 'ABSENT') summary.absent += 1;
    if (row.status === 'LEAVE') summary.leave += 1;
    if (row.status === 'NOT_MARKED') summary.notMarked += 1;
  });

  return summary;
}

async function getServiceReports(filters = {}) {
  const {
    districtId,
    talukId,
    facilityId,
    facilityType,
    date,
    serviceTypeId,
  } = filters;

  let query = `
    SELECT dsr.id, dsr.service_date, dsr.submitted_at, dsr.value, dsr.notes,
           f.name AS facility_name,
           d.full_name AS doctor_name,
           st.name AS service_name,
           dist.name AS district_name,
           t.name AS taluk_name
    FROM daily_service_reports dsr
    INNER JOIN facilities f ON f.id = dsr.facility_id
    INNER JOIN doctors d ON d.id = dsr.doctor_id
    INNER JOIN service_types st ON st.id = dsr.service_type_id
    INNER JOIN taluks t ON t.id = f.taluk_id
    INNER JOIN districts dist ON dist.id = f.district_id
    WHERE 1 = 1
  `;
  const params = [];

  if (districtId) {
    query += ' AND f.district_id = ?';
    params.push(Number(districtId));
  }

  if (talukId) {
    query += ' AND f.taluk_id = ?';
    params.push(Number(talukId));
  }

  if (facilityId) {
    query += ' AND dsr.facility_id = ?';
    params.push(Number(facilityId));
  }

  if (facilityType) {
    query += ' AND f.facility_type = ?';
    params.push(facilityType);
  }

  if (date) {
    query += ' AND dsr.service_date = ?';
    params.push(date);
  }

  if (serviceTypeId) {
    query += ' AND dsr.service_type_id = ?';
    params.push(Number(serviceTypeId));
  }

  query += ' ORDER BY dsr.service_date DESC, dsr.submitted_at DESC';

  const [rows] = await pool.query(query, params);
  return rows;
}

async function getServiceSummary(filters = {}) {
  const {
    districtId,
    talukId,
    facilityId,
    facilityType,
    date,
    serviceTypeId,
  } = filters;

  let query = `
    SELECT st.name AS service_type_name, SUM(dsr.value) AS total
    FROM daily_service_reports dsr
    INNER JOIN facilities f ON f.id = dsr.facility_id
    INNER JOIN service_types st ON st.id = dsr.service_type_id
    WHERE 1 = 1
  `;
  const params = [];

  if (districtId) { query += ' AND f.district_id = ?'; params.push(Number(districtId)); }
  if (talukId) { query += ' AND f.taluk_id = ?'; params.push(Number(talukId)); }
  if (facilityId) { query += ' AND dsr.facility_id = ?'; params.push(Number(facilityId)); }
  if (facilityType) { query += ' AND f.facility_type = ?'; params.push(facilityType); }
  if (date) { query += ' AND dsr.service_date = ?'; params.push(date); }
  if (serviceTypeId) { query += ' AND dsr.service_type_id = ?'; params.push(Number(serviceTypeId)); }

  query += ' GROUP BY st.id, st.name ORDER BY st.id ASC';

  const [rows] = await pool.query(query, params);
  return rows;
}

module.exports = {
  buildFacilitySummary,
  buildAttendanceCounts,
  getDashboardSummary,
  getDistricts,
  getTaluksByDistrict,
  getFacilities,
  getFacilityById,
  getFacilityDoctors,
  getFacilityServiceStatus,
  getAttendanceRecords,
  getAttendanceSummary,
  getServiceReports,
  getServiceSummary,
  getCurrentDateInKolkata,
};
