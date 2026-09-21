const { pool } = require('../../config/db');

function getToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}

function normalizeRange(filters = {}) {
  const today = getToday();
  const fromDate = filters.fromDate || today;
  const toDate = filters.toDate || today;
  const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
  if (!validDate(fromDate) || !validDate(toDate)) throw new Error('Invalid date range.');
  if (fromDate > toDate) throw new Error('Invalid date range.');
  if (toDate > today) throw new Error('Reports cannot include future dates.');
  return { ...filters, fromDate, toDate };
}

function numericFilters(filters, alias = 'f') {
  const params = [];
  let sql = '';
  [['districtId', 'district_id'], ['talukId', 'taluk_id'], ['facilityId', 'id']].forEach(([key, column]) => {
    if (filters[key] !== undefined && filters[key] !== '') {
      const value = Number(filters[key]);
      if (!Number.isInteger(value) || value < 1) throw new Error(`Invalid ${key}.`);
      sql += ` AND ${alias}.${column} = ?`;
      params.push(value);
    }
  });
  if (filters.facilityType) { sql += ` AND ${alias}.facility_type = ?`; params.push(filters.facilityType); }
  return { sql, params };
}

function assignmentFilter(filters, alias = 'f') {
  const result = numericFilters(filters, alias);
  return {
    sql: result.sql,
    params: result.params,
  };
}

async function getAttendance(filters = {}) {
  const range = normalizeRange(filters);
  const filter = assignmentFilter(range);
  const [rows] = await pool.query(
    `WITH RECURSIVE dates AS (
       SELECT CAST(? AS DATE) AS report_date
       UNION ALL SELECT report_date + INTERVAL 1 DAY FROM dates WHERE report_date < CAST(? AS DATE)
     )
     SELECT COUNT(*) AS totalDoctors,
       SUM(CASE WHEN ar.status = 'PRESENT' THEN 1 ELSE 0 END) AS present,
       SUM(CASE WHEN ar.status = 'LATE' THEN 1 ELSE 0 END) AS late,
      SUM(CASE WHEN ar.status = 'LEAVE' THEN 1 ELSE 0 END) AS leave_count,
       SUM(CASE WHEN ar.id IS NULL THEN 1 ELSE 0 END) AS notMarked,
       SUM(CASE WHEN al.id IS NOT NULL THEN 1 ELSE 0 END) AS absentAlerts
     FROM dates dt
     INNER JOIN doctor_facility_assignments a ON a.assigned_from <= dt.report_date
       AND (a.assigned_to IS NULL OR a.assigned_to >= dt.report_date) AND a.is_active = TRUE
     INNER JOIN doctors d ON d.id = a.doctor_id AND d.status = 'ACTIVE'
     INNER JOIN facilities f ON f.id = a.facility_id AND f.status = 'ACTIVE' ${filter.sql}
     LEFT JOIN attendance_records ar ON ar.doctor_id = a.doctor_id AND ar.facility_id = a.facility_id
       AND ar.attendance_date = dt.report_date
     LEFT JOIN alert_logs al ON al.doctor_id = a.doctor_id AND al.facility_id = a.facility_id
       AND al.alert_date = dt.report_date AND al.alert_type IN ('ABSENT', 'ABSENTEEISM')`,
    [range.fromDate, range.toDate, ...filter.params]
  );
  const row = rows[0] || {};
  return {
    totalDoctors: Number(row.totalDoctors) || 0,
    present: Number(row.present) || 0,
    late: Number(row.late) || 0,
    leave: Number(row.leave ?? row.leave_count) || 0,
    notMarked: Number(row.notMarked) || 0,
    absentAlerts: Number(row.absentAlerts) || 0,
  };
}

async function getAttendanceTrend(filters = {}) {
  const range = normalizeRange(filters);
  const filter = assignmentFilter(range);
  const [rows] = await pool.query(
    `WITH RECURSIVE dates AS (
       SELECT CAST(? AS DATE) AS report_date
       UNION ALL SELECT report_date + INTERVAL 1 DAY FROM dates WHERE report_date < CAST(? AS DATE)
     )
     SELECT dt.report_date AS date,
      SUM(ar.status = 'PRESENT') AS present, SUM(ar.status = 'LATE') AS late,
      SUM(ar.status = 'LEAVE') AS leave_count, SUM(ar.id IS NULL) AS notMarked
     FROM dates dt
     CROSS JOIN doctor_facility_assignments a
     INNER JOIN doctors d ON d.id = a.doctor_id AND d.status = 'ACTIVE'
     INNER JOIN facilities f ON f.id = a.facility_id AND f.status = 'ACTIVE' ${filter.sql}
     LEFT JOIN attendance_records ar ON ar.doctor_id = a.doctor_id AND ar.facility_id = a.facility_id
       AND ar.attendance_date = dt.report_date
     WHERE a.is_active = TRUE
     GROUP BY dt.report_date ORDER BY dt.report_date ASC`,
    [range.fromDate, range.toDate, ...filter.params]
  );
  return rows.map((row) => ({ ...row, present: Number(row.present) || 0, late: Number(row.late) || 0, leave: Number(row.leave ?? row.leave_count) || 0, notMarked: Number(row.notMarked) || 0 }));
}

async function getServices(filters = {}) {
  const range = normalizeRange(filters);
  const filter = assignmentFilter(range);
  const [rows] = await pool.query(
    `SELECT st.name AS serviceType, SUM(dsr.value) AS total, COUNT(*) AS reports
       FROM daily_service_reports dsr
       INNER JOIN service_types st ON st.id = dsr.service_type_id
       INNER JOIN facilities f ON f.id = dsr.facility_id AND f.status = 'ACTIVE' ${filter.sql}
      WHERE dsr.service_date BETWEEN ? AND ?
      GROUP BY st.id, st.name ORDER BY st.name ASC`,
    [range.fromDate, range.toDate, ...filter.params]
  );
  return rows.map((row) => ({ serviceType: row.serviceType, total: Number(row.total) || 0, reports: Number(row.reports) || 0 }));
}

async function getServiceTrend(filters = {}) {
  const range = normalizeRange(filters);
  const filter = assignmentFilter(range);
  const [rows] = await pool.query(
    `SELECT dsr.service_date AS date, st.name AS serviceType, SUM(dsr.value) AS total
       FROM daily_service_reports dsr
       INNER JOIN service_types st ON st.id = dsr.service_type_id
       INNER JOIN facilities f ON f.id = dsr.facility_id AND f.status = 'ACTIVE' ${filter.sql}
      WHERE dsr.service_date BETWEEN ? AND ?
      GROUP BY dsr.service_date, st.id, st.name ORDER BY dsr.service_date ASC`,
    [...filter.params, range.fromDate, range.toDate]
  );
  return rows.map((row) => ({ ...row, total: Number(row.total) || 0 }));
}

async function getAbsenteeism(filters = {}) {
  const range = normalizeRange(filters);
  const filter = assignmentFilter(range);
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS totalAlerts, SUM(al.status = 'OPEN') AS open,
       SUM(al.status = 'ACKNOWLEDGED') AS acknowledged, SUM(al.status = 'RESOLVED') AS resolved,
       SUM(al.severity = 'HIGH') AS highSeverity, SUM(al.severity = 'MEDIUM') AS mediumSeverity,
       SUM(al.severity = 'LOW') AS lowSeverity
      FROM alert_logs al INNER JOIN facilities f ON f.id = al.facility_id ${filter.sql}
          WHERE al.alert_date BETWEEN ? AND ? AND al.alert_type IN ('ABSENT', 'ABSENTEEISM')`,
    [...filter.params, range.fromDate, range.toDate]
  );
  const [types] = await pool.query(
    `SELECT al.alert_type AS alertType, COUNT(*) AS total
      FROM alert_logs al INNER JOIN facilities f ON f.id = al.facility_id ${filter.sql}
          WHERE al.alert_date BETWEEN ? AND ? AND al.alert_type IN ('ABSENT', 'ABSENTEEISM') GROUP BY al.alert_type ORDER BY al.alert_type`,
    [...filter.params, range.fromDate, range.toDate]
  );
  const row = rows[0] || {};
  return { ...Object.fromEntries(Object.entries(row).map(([key, value]) => [key, Number(value) || 0])), types };
}

async function getAbsenteeismTrend(filters = {}) {
  const range = normalizeRange(filters);
  const filter = assignmentFilter(range);
  const [rows] = await pool.query(
    `SELECT al.alert_date AS date, COUNT(*) AS alerts
       FROM alert_logs al INNER JOIN facilities f ON f.id = al.facility_id ${filter.sql}
      WHERE al.alert_date BETWEEN ? AND ? AND al.alert_type IN ('ABSENT', 'ABSENTEEISM')
      GROUP BY al.alert_date ORDER BY al.alert_date`,
    [...filter.params, range.fromDate, range.toDate]
  );
  return rows.map((row) => ({ date: row.date, alerts: Number(row.alerts) || 0 }));
}

async function getFacilities(filters = {}) {
  const range = normalizeRange(filters);
  const filter = assignmentFilter(range);
  const [rows] = await pool.query(
    `WITH RECURSIVE dates AS (
       SELECT CAST(? AS DATE) AS report_date
       UNION ALL SELECT report_date + INTERVAL 1 DAY FROM dates WHERE report_date < CAST(? AS DATE)
     )
     SELECT f.id AS facilityId, f.name AS facilityName, f.facility_type AS facilityType,
       COUNT(DISTINCT a.doctor_id) AS doctorCount,
       COUNT(DISTINCT CASE WHEN ar.status = 'PRESENT' THEN CONCAT(ar.attendance_date, '-', ar.doctor_id) END) AS present,
      COUNT(DISTINCT CONCAT(dt.report_date, '-', a.doctor_id)) AS expected,
       (SELECT COUNT(*) FROM daily_service_reports dsr WHERE dsr.facility_id = f.id AND dsr.service_date BETWEEN ? AND ?) AS serviceReports,
       (SELECT COUNT(*) FROM alert_logs al WHERE al.facility_id = f.id AND al.alert_date BETWEEN ? AND ? AND al.status <> 'RESOLVED') AS openAlerts
     FROM facilities f
     INNER JOIN doctor_facility_assignments a ON a.facility_id = f.id AND a.is_active = TRUE
     INNER JOIN doctors d ON d.id = a.doctor_id AND d.status = 'ACTIVE'
    CROSS JOIN dates dt
     LEFT JOIN attendance_records ar ON ar.facility_id = f.id AND ar.doctor_id = a.doctor_id AND ar.attendance_date = dt.report_date
     WHERE f.status = 'ACTIVE' ${filter.sql}
     GROUP BY f.id, f.name, f.facility_type ORDER BY f.name`,
    [range.fromDate, range.toDate, range.fromDate, range.toDate, range.fromDate, range.toDate, ...filter.params]
  );
  return rows.map((row) => ({ ...row, doctorCount: Number(row.doctorCount) || 0, attendancePercentage: row.expected ? Math.round((Number(row.present) / Number(row.expected)) * 100) : 0, serviceReports: Number(row.serviceReports) || 0, openAlerts: Number(row.openAlerts) || 0 }));
}

async function getTaluks(filters = {}) {
  const range = normalizeRange(filters);
  const districtId = filters.districtId ? Number(filters.districtId) : null;
  const talukId = filters.talukId ? Number(filters.talukId) : null;
  if ((districtId !== null && (!Number.isInteger(districtId) || districtId < 1)) || (talukId !== null && (!Number.isInteger(talukId) || talukId < 1))) throw new Error('Invalid taluk filter.');
  const [rows] = await pool.query(
    `SELECT t.id AS talukId, t.name AS talukName, COUNT(DISTINCT f.id) AS facilities,
       COUNT(DISTINCT d.id) AS doctors, COUNT(DISTINCT dsr.id) AS serviceReports,
       COUNT(DISTINCT CASE WHEN al.status <> 'RESOLVED' THEN al.id END) AS alerts
       FROM taluks t INNER JOIN facilities f ON f.taluk_id = t.id AND f.status = 'ACTIVE'
       LEFT JOIN doctor_facility_assignments a ON a.facility_id = f.id AND a.is_active = TRUE
       LEFT JOIN doctors d ON d.id = a.doctor_id AND d.status = 'ACTIVE'
       LEFT JOIN daily_service_reports dsr ON dsr.facility_id = f.id AND dsr.service_date BETWEEN ? AND ?
       LEFT JOIN alert_logs al ON al.facility_id = f.id AND al.alert_date BETWEEN ? AND ?
      WHERE 1 = 1 ${districtId ? ' AND t.district_id = ?' : ''} ${talukId ? ' AND t.id = ?' : ''} ${filters.facilityType ? ' AND f.facility_type = ?' : ''}
       GROUP BY t.id, t.name ORDER BY t.name`,
    [range.fromDate, range.toDate, range.fromDate, range.toDate, ...(districtId ? [districtId] : []), ...(talukId ? [talukId] : []), ...(filters.facilityType ? [filters.facilityType] : [])]
  );
  return Promise.all(rows.map(async (row) => {
    const attendance = await getAttendance({ ...filters, talukId: row.talukId });
    return { ...row, facilities: Number(row.facilities) || 0, doctors: Number(row.doctors) || 0, attendancePercentage: attendance.totalDoctors ? Math.round((attendance.present / attendance.totalDoctors) * 100) : 0, serviceReports: Number(row.serviceReports) || 0, alerts: Number(row.alerts) || 0 };
  }));
}

async function getFacilityTypes(filters = {}) {
  const range = normalizeRange(filters);
  const types = ['PHC', 'UPHC', 'HSC'];
  const result = [];
  for (const facilityType of types) {
    const scoped = { ...filters, facilityType };
    const [facilities, attendance, alerts] = await Promise.all([getFacilities(scoped), getAttendance(scoped), getAbsenteeism(scoped)]);
    result.push({ facilityType, facilities: facilities.length, doctors: attendance.totalDoctors, present: attendance.present, alerts: alerts.open + alerts.acknowledged });
  }
  return result;
}

async function getSummary(filters = {}) {
  const [facilities, attendance, services, absenteeism] = await Promise.all([getFacilities(filters), getAttendance(filters), getServices(filters), getAbsenteeism(filters)]);
  const counts = facilities.reduce((result, item) => { const key = item.facilityType.toLowerCase(); result[key] = (result[key] || 0) + 1; return result; }, {});
  return { facilities: { total: facilities.length, phc: counts.phc || 0, uphc: counts.uphc || 0, hsc: counts.hsc || 0 }, doctors: attendance.totalDoctors, attendance, services: { reports: services.reduce((total, row) => total + row.reports, 0) }, alerts: { open: absenteeism.open, acknowledged: absenteeism.acknowledged, resolved: absenteeism.resolved } };
}

async function recordReportView(userId, reportName, filters) {
  await pool.query(
    `INSERT INTO audit_logs (user_id, action, entity_type, details) VALUES (?, 'REPORT_VIEWED', 'REPORT', ?)`,
    [userId, JSON.stringify({ report: reportName, filters: { districtId: filters.districtId || null, talukId: filters.talukId || null, facilityId: filters.facilityId || null, facilityType: filters.facilityType || null, fromDate: filters.fromDate || null, toDate: filters.toDate || null } })]
  );
}

module.exports = { normalizeRange, getAttendance, getAttendanceTrend, getServices, getServiceTrend, getAbsenteeism, getAbsenteeismTrend, getFacilities, getTaluks, getFacilityTypes, getSummary, recordReportView };