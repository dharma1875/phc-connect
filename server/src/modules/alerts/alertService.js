const { pool } = require('../../config/db');

const ALERT_ENTITY = 'ABSENTEEISM_ALERT';

function getConfiguredEvaluationTime() {
  return process.env.ABSENCE_EVALUATION_TIME || '10:00';
}

function getKolkataDateTime(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(now).reduce((values, part) => ({ ...values, [part.type]: part.value }), {});

  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

function hasEvaluationTimePassed(currentTime, evaluationTime = getConfiguredEvaluationTime()) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(evaluationTime) && currentTime >= evaluationTime;
}

function buildAbsenceMessage(doctorName, date) {
  return `Doctor ${doctorName} has no attendance record for ${date} after the configured attendance evaluation time.`;
}

async function writeAudit(userId, action, entityId, details) {
  await pool.query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
     VALUES (?, ?, ?, ?, ?)`,
    [userId || null, action, ALERT_ENTITY, entityId || null, JSON.stringify(details)]
  );
}

async function checkAbsenteeism(now = new Date()) {
  const { date, time } = getKolkataDateTime(now);
  if (!hasEvaluationTimePassed(time)) {
    return { alertsCreated: 0, alertsAlreadyExisting: 0, evaluated: false, date };
  }

  const [rows] = await pool.query(
    `SELECT d.id AS doctor_id, d.full_name, a.facility_id
       FROM doctors d
       INNER JOIN doctor_facility_assignments a ON a.doctor_id = d.id AND a.is_active = TRUE
       INNER JOIN facilities f ON f.id = a.facility_id AND f.status = 'ACTIVE'
       LEFT JOIN attendance_records ar
         ON ar.doctor_id = d.id AND ar.facility_id = a.facility_id AND ar.attendance_date = ?
      WHERE d.status = 'ACTIVE' AND ar.id IS NULL`,
    [date]
  );

  let alertsCreated = 0;
  let alertsAlreadyExisting = 0;
  for (const row of rows) {
    try {
      const [result] = await pool.query(
        `INSERT INTO alert_logs
          (doctor_id, facility_id, alert_date, alert_type, severity, status, message)
         VALUES (?, ?, ?, 'ABSENT', 'HIGH', 'OPEN', ?)`,
        [row.doctor_id, row.facility_id, date, buildAbsenceMessage(row.full_name, date)]
      );
      await writeAudit(null, 'ALERT_CREATED', result.insertId, { doctorId: row.doctor_id, facilityId: row.facility_id, alertDate: date });
      alertsCreated += 1;
    } catch (error) {
      if (error.code !== 'ER_DUP_ENTRY') throw error;
      alertsAlreadyExisting += 1;
    }
  }

  return { alertsCreated, alertsAlreadyExisting, evaluated: true, date };
}

function appendAlertFilters(filters = {}) {
  const { districtId, talukId, facilityId, facilityType, doctorId, alertType, severity, status, date } = filters;
  let query = `
    FROM alert_logs al
    INNER JOIN facilities f ON f.id = al.facility_id
    INNER JOIN districts dist ON dist.id = f.district_id
    INNER JOIN taluks t ON t.id = f.taluk_id
    LEFT JOIN doctors d ON d.id = al.doctor_id
    WHERE 1 = 1`;
  const params = [];
  const conditions = [
    ['districtId', 'f.district_id = ?', districtId, true], ['talukId', 'f.taluk_id = ?', talukId, true],
    ['facilityId', 'al.facility_id = ?', facilityId, true], ['doctorId', 'al.doctor_id = ?', doctorId, true],
    ['facilityType', 'f.facility_type = ?', facilityType, false], ['alertType', 'al.alert_type = ?', alertType, false],
    ['severity', 'al.severity = ?', severity, false], ['status', 'al.status = ?', status, false], ['date', 'al.alert_date = ?', date, false],
  ];
  conditions.forEach(([, clause, value, numeric]) => {
    if (value !== undefined && value !== null && value !== '') { query += ` AND ${clause}`; params.push(numeric ? Number(value) : value); }
  });
  return { query, params };
}

function normalizeFilterParams(filters = {}) {
  const numericKeys = ['districtId', 'talukId', 'facilityId', 'doctorId'];
  const normalized = { ...filters };
  for (const key of numericKeys) {
    if (normalized[key] !== undefined && normalized[key] !== '') {
      const value = Number(normalized[key]);
      if (!Number.isInteger(value) || value < 1) throw new Error(`Invalid ${key}.`);
      normalized[key] = value;
    }
  }
  return normalized;
}

async function getAlerts(filters = {}) {
  const normalized = normalizeFilterParams(filters);
  const { query, params } = appendAlertFilters(normalized);
  const [rows] = await pool.query(
    `SELECT al.id, al.alert_date, al.alert_type, al.severity, al.status, al.message, al.created_at,
            al.acknowledged_at, al.resolved_at, d.full_name AS doctor_name,
            f.name AS facility_name, f.facility_type, t.name AS taluk_name, dist.name AS district_name
       ${query} ORDER BY al.alert_date DESC, al.created_at DESC`, params
  );
  return rows;
}

async function getAlertById(id) {
  const [rows] = await pool.query(
    `SELECT al.*, d.full_name AS doctor_name, d.doctor_id AS doctor_code,
            f.name AS facility_name, f.facility_type, t.name AS taluk_name, dist.name AS district_name
       FROM alert_logs al
       INNER JOIN facilities f ON f.id = al.facility_id
       INNER JOIN districts dist ON dist.id = f.district_id
       INNER JOIN taluks t ON t.id = f.taluk_id
       LEFT JOIN doctors d ON d.id = al.doctor_id
      WHERE al.id = ? LIMIT 1`, [id]
  );
  return rows[0] || null;
}

async function getAlertSummary() {
  const [rows] = await pool.query(
    `SELECT
       SUM(status = 'OPEN') AS open, SUM(status = 'ACKNOWLEDGED') AS acknowledged,
       SUM(status = 'RESOLVED') AS resolved, SUM(severity = 'HIGH') AS highSeverity,
       SUM(severity = 'MEDIUM') AS mediumSeverity, SUM(severity = 'LOW') AS lowSeverity
       FROM alert_logs`
  );
  return Object.fromEntries(Object.entries(rows[0] || {}).map(([key, value]) => [key, Number(value) || 0]));
}

async function updateAlertStatus(id, status, userId, resolutionNote) {
  const alert = await getAlertById(id);
  if (!alert) return null;
  if (status === 'ACKNOWLEDGED' && alert.status !== 'OPEN') throw new Error('Only open alerts can be acknowledged.');
  if (status === 'RESOLVED' && !['OPEN', 'ACKNOWLEDGED'].includes(alert.status)) throw new Error('Alert is already resolved.');

  const fields = status === 'ACKNOWLEDGED'
    ? ['status = ?', 'acknowledged_at = NOW()', 'acknowledged_by = ?']
    : ['status = ?', 'resolved_at = NOW()', 'resolved_by = ?'];
  const values = [status, userId];
  if (status === 'RESOLVED' && resolutionNote) { fields.push('message = CONCAT(message, ?)'); values.push(` Resolution note: ${resolutionNote}`); }
  values.push(id);
  await pool.query(`UPDATE alert_logs SET ${fields.join(', ')} WHERE id = ?`, values);
  await writeAudit(userId, `ALERT_${status}`, id, { resolutionNote: resolutionNote || null });
  return getAlertById(id);
}

module.exports = {
  getConfiguredEvaluationTime, getKolkataDateTime, hasEvaluationTimePassed,
  buildAbsenceMessage, checkAbsenteeism, getAlerts, getAlertById, getAlertSummary, updateAlertStatus,
};