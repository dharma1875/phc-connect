const { pool } = require('../config/db');

const MEDICINE_STATUS_MAP = {
  AVAILABLE: 1,
  LOW_STOCK: 2,
  OUT_OF_STOCK: 3,
};

function normalizeServiceDate(serviceDate) {
  if (!serviceDate) {
    throw Object.assign(new Error('Service date is required.'), { statusCode: 400 });
  }

  const date = new Date(`${serviceDate}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    throw Object.assign(new Error('Service date is invalid.'), { statusCode: 400 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date > today) {
    throw Object.assign(new Error('Service date cannot be in the future.'), { statusCode: 400 });
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function normalizeServiceValue(serviceName, value) {
  if (serviceName === 'Medicine Stock Status') {
    const normalized = String(value || '').trim().toUpperCase();

    if (!MEDICINE_STATUS_MAP[normalized]) {
      throw Object.assign(new Error('Medicine Stock Status must be AVAILABLE, LOW_STOCK, or OUT_OF_STOCK.'), { statusCode: 400 });
    }

    return MEDICINE_STATUS_MAP[normalized];
  }

  const numericValue = Number(value);

  if (!Number.isInteger(numericValue) || numericValue < 0) {
    throw Object.assign(new Error(`${serviceName} must be a non-negative whole number.`), { statusCode: 400 });
  }

  return numericValue;
}

async function getDoctorProfileByUserId(userId) {
  const [rows] = await pool.query(
    `
      SELECT d.id, d.doctor_id, d.full_name
      FROM doctors d
      WHERE d.user_id = ?
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}

async function getActiveDoctorFacility(doctorId) {
  const [rows] = await pool.query(
    `
      SELECT a.id, a.facility_id, f.name AS facility_name, f.facility_type,
             t.name AS taluk_name, dist.name AS district_name
      FROM doctor_facility_assignments a
      INNER JOIN facilities f ON f.id = a.facility_id
      INNER JOIN taluks t ON t.id = f.taluk_id
      INNER JOIN districts dist ON dist.id = f.district_id
      WHERE a.doctor_id = ? AND a.is_active = TRUE
      ORDER BY a.created_at DESC
      LIMIT 1
    `,
    [doctorId]
  );

  return rows[0] || null;
}

async function getActiveServiceTypes() {
  const [rows] = await pool.query(
    `
      SELECT id, name
      FROM service_types
      WHERE is_active = TRUE
      ORDER BY id ASC
    `
  );

  return rows;
}

async function getServiceTypeById(serviceTypeId) {
  const [rows] = await pool.query(
    `
      SELECT id, name, is_active
      FROM service_types
      WHERE id = ? AND is_active = TRUE
      LIMIT 1
    `,
    [serviceTypeId]
  );

  return rows[0] || null;
}

async function getTodayServiceReportForDoctor(userId) {
  const doctor = await getDoctorProfileByUserId(userId);

  if (!doctor) {
    throw Object.assign(new Error('Doctor profile not found.'), { statusCode: 404 });
  }

  const today = new Date();
  const serviceDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [rows] = await pool.query(
    `
      SELECT dsr.id, dsr.service_date, dsr.submitted_at, dsr.notes, dsr.facility_id,
             f.name AS facility_name
      FROM daily_service_reports dsr
      INNER JOIN facilities f ON f.id = dsr.facility_id
      WHERE dsr.doctor_id = ? AND dsr.service_date = ?
      ORDER BY dsr.submitted_at DESC
      LIMIT 1
    `,
    [doctor.id, serviceDate]
  );

  return rows[0] || null;
}

async function getMyServiceReports(userId, month, year) {
  const doctor = await getDoctorProfileByUserId(userId);

  if (!doctor) {
    throw Object.assign(new Error('Doctor profile not found.'), { statusCode: 404 });
  }

  let query = `
    SELECT dsr.id, dsr.doctor_id, dsr.facility_id, dsr.service_date, dsr.value,
           dsr.notes, dsr.submitted_at, st.name AS service_type_name,
           f.name AS facility_name
    FROM daily_service_reports dsr
    INNER JOIN service_types st ON st.id = dsr.service_type_id
    INNER JOIN facilities f ON f.id = dsr.facility_id
    WHERE dsr.doctor_id = ?
  `;
  const params = [doctor.id];

  if (month) {
    query += ' AND MONTH(dsr.service_date) = ?';
    params.push(Number(month));
  }

  if (year) {
    query += ' AND YEAR(dsr.service_date) = ?';
    params.push(Number(year));
  }

  query += ' ORDER BY dsr.service_date DESC, dsr.service_type_id ASC';

  const [rows] = await pool.query(query, params);
  return rows;
}

async function getServiceSummaryForDoctor(userId, month, year) {
  const doctor = await getDoctorProfileByUserId(userId);

  if (!doctor) {
    throw Object.assign(new Error('Doctor profile not found.'), { statusCode: 404 });
  }

  const targetMonth = Number(month || new Date().getMonth() + 1);
  const targetYear = Number(year || new Date().getFullYear());

  const [rows] = await pool.query(
    `
      SELECT st.name AS service_type_name, SUM(dsr.value) AS total
      FROM daily_service_reports dsr
      INNER JOIN service_types st ON st.id = dsr.service_type_id
      WHERE dsr.doctor_id = ?
        AND MONTH(dsr.service_date) = ?
        AND YEAR(dsr.service_date) = ?
      GROUP BY st.id, st.name
      ORDER BY st.id ASC
    `,
    [doctor.id, targetMonth, targetYear]
  );

  return rows;
}

function groupMonthlyServiceTotals(rows) {
  const grouped = new Map();

  rows.forEach((row) => {
    const name = row.service_type_name || row.serviceType;
    const total = Number(row.total ?? row.value ?? 0) || 0;

    if (!grouped.has(name)) {
      grouped.set(name, total);
      return;
    }

    grouped.set(name, grouped.get(name) + total);
  });

  return Array.from(grouped.entries()).map(([serviceType, total]) => ({
    serviceType,
    total,
  }));
}

async function submitDoctorServices(userId, payload) {
  if (!payload || !Array.isArray(payload.services) || payload.services.length === 0) {
    throw Object.assign(new Error('At least one service entry is required.'), { statusCode: 400 });
  }

  const doctor = await getDoctorProfileByUserId(userId);

  if (!doctor) {
    throw Object.assign(new Error('Doctor profile not found.'), { statusCode: 404 });
  }

  const facility = await getActiveDoctorFacility(doctor.id);

  if (!facility) {
    throw Object.assign(new Error('No active facility assignment found for this doctor.'), { statusCode: 403 });
  }

  const serviceDate = normalizeServiceDate(payload.serviceDate);
  const activeTypes = await getActiveServiceTypes();
  const typeMap = new Map(activeTypes.map((type) => [type.id, type]));
  const rowsToInsert = [];

  for (const item of payload.services) {
    if (!item || !item.serviceTypeId) {
      throw Object.assign(new Error('Each service entry must include a valid service type.'), { statusCode: 400 });
    }

    const type = typeMap.get(Number(item.serviceTypeId));

    if (!type) {
      throw Object.assign(new Error('Invalid service type selected.'), { statusCode: 400 });
    }

    const value = normalizeServiceValue(type.name, item.value);

    const [duplicateRows] = await pool.query(
      `
        SELECT id
        FROM daily_service_reports
        WHERE doctor_id = ? AND facility_id = ? AND service_date = ? AND service_type_id = ?
        LIMIT 1
      `,
      [doctor.id, facility.facility_id, serviceDate, type.id]
    );

    if (duplicateRows.length > 0) {
      throw Object.assign(new Error("Today's service report has already been submitted."), { statusCode: 409 });
    }

    rowsToInsert.push({
      doctor_id: doctor.id,
      facility_id: facility.facility_id,
      service_date: serviceDate,
      service_type_id: type.id,
      value,
      notes: payload.notes || null,
      submitted_at: new Date(),
    });
  }

  const insertedRecordIds = [];

  for (const row of rowsToInsert) {
    const [result] = await pool.query(
      `
        INSERT INTO daily_service_reports (doctor_id, facility_id, service_date, service_type_id, value, notes, submitted_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `,
      [row.doctor_id, row.facility_id, row.service_date, row.service_type_id, row.value, row.notes]
    );

    insertedRecordIds.push(result.insertId);
  }

  const [firstInsert] = await pool.query(
    `
      SELECT id
      FROM daily_service_reports
      WHERE doctor_id = ? AND facility_id = ? AND service_date = ?
      ORDER BY id ASC
      LIMIT 1
    `,
    [doctor.id, facility.facility_id, serviceDate]
  );

  await pool.query(
    `
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
      VALUES (?, 'SERVICE_REPORT_SUBMITTED', 'daily_service_reports', ?, ?)
    `,
    [userId, firstInsert[0]?.id || insertedRecordIds[0] || null, JSON.stringify({
      doctorId: doctor.id,
      facilityId: facility.facility_id,
      serviceDate,
      submittedAt: new Date().toISOString(),
      serviceCount: rowsToInsert.length,
    })]
  );

  return {
    message: 'Report submitted successfully and is available for DDHS monitoring.',
    serviceDate,
    facility: {
      id: facility.facility_id,
      name: facility.facility_name,
      type: facility.facility_type,
    },
    recordsInserted: rowsToInsert.length,
  };
}

module.exports = {
  normalizeServiceDate,
  normalizeServiceValue,
  getActiveServiceTypes,
  getMyServiceReports,
  groupMonthlyServiceTotals,
  getDoctorProfileByUserId,
  getActiveDoctorFacility,
  getTodayServiceReportForDoctor,
  submitDoctorServices,
  getServiceSummaryForDoctor,
  getServiceTypeById,
};
