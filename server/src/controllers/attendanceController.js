const { pool } = require('../config/db');
const { calculateAttendanceStatus, buildAttendanceSummary } = require('../services/attendanceService');

function getCurrentAttendanceDateInKolkata() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  return `${year}-${month}-${day}`;
}

function getCurrentAttendanceTimeInKolkata() {
  return new Date().toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
  });
}

async function getActiveDoctorFacility(userId) {
  const [rows] = await pool.query(
    `
      SELECT a.id, a.facility_id, a.doctor_id
      FROM doctor_facility_assignments a
      INNER JOIN doctors d ON d.id = a.doctor_id
      WHERE d.user_id = ? AND a.is_active = TRUE
      ORDER BY a.created_at DESC
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}

async function getAttendanceRecord(doctorId, facilityId, attendanceDate) {
  const [rows] = await pool.query(
    `
      SELECT *
      FROM attendance_records
      WHERE doctor_id = ? AND facility_id = ? AND attendance_date = ?
      LIMIT 1
    `,
    [doctorId, facilityId, attendanceDate]
  );

  return rows[0] || null;
}

async function logAttendanceAction(userId, action, entityId, details) {
  await pool.query(
    `
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
      VALUES (?, ?, 'attendance_records', ?, JSON_OBJECT('details', ?))
    `,
    [userId, action, entityId, JSON.stringify(details)]
  );
}

async function markAttendance(req, res) {
  try {
    const user = req.user;
    const facility = await getActiveDoctorFacility(user.id);

    if (!facility) {
      return res.status(403).json({ message: 'No active facility assignment is available for this doctor.' });
    }

    const attendanceDate = getCurrentAttendanceDateInKolkata();
    const existingRecord = await getAttendanceRecord(facility.doctor_id, facility.facility_id, attendanceDate);

    if (existingRecord && existingRecord.check_in_time) {
      return res.status(409).json({ message: 'Attendance already marked for today.' });
    }

    const checkInTime = getCurrentAttendanceTimeInKolkata();
    const status = calculateAttendanceStatus(checkInTime);

    let attendance;
    if (existingRecord) {
      await pool.query(
        `
          UPDATE attendance_records
          SET check_in_time = ?, status = ?, marked_by = ?, source = 'DOCTOR_PORTAL', updated_at = NOW()
          WHERE id = ?
        `,
        [checkInTime, status, user.id, existingRecord.id]
      );

      attendance = { ...existingRecord, check_in_time: checkInTime, status, marked_by: user.id, source: 'DOCTOR_PORTAL' };
    } else {
      const [result] = await pool.query(
        `
          INSERT INTO attendance_records (doctor_id, facility_id, attendance_date, check_in_time, status, marked_by, source)
          VALUES (?, ?, ?, ?, ?, ?, 'DOCTOR_PORTAL')
        `,
        [facility.doctor_id, facility.facility_id, attendanceDate, checkInTime, status, user.id]
      );

      attendance = {
        id: result.insertId,
        doctor_id: facility.doctor_id,
        facility_id: facility.facility_id,
        attendance_date: attendanceDate,
        check_in_time: checkInTime,
        check_out_time: null,
        status,
        marked_by: user.id,
        source: 'DOCTOR_PORTAL',
      };
    }

    await logAttendanceAction(user.id, 'ATTENDANCE_MARKED', attendance.id, {
      doctorId: facility.doctor_id,
      facilityId: facility.facility_id,
      attendanceDate,
      checkInTime,
      status,
      source: 'DOCTOR_PORTAL',
    });

    return res.status(200).json({
      message: 'Attendance marked successfully.',
      attendance: {
        id: attendance.id,
        date: attendance.attendance_date || attendanceDate,
        checkInTime: attendance.check_in_time || checkInTime,
        checkOutTime: attendance.check_out_time || null,
        status: attendance.status || status,
        facilityId: attendance.facility_id || facility.facility_id,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to mark attendance.' });
  }
}

async function checkOutAttendance(req, res) {
  try {
    const user = req.user;
    const facility = await getActiveDoctorFacility(user.id);

    if (!facility) {
      return res.status(403).json({ message: 'No active facility assignment is available for this doctor.' });
    }

    const attendanceDate = getCurrentAttendanceDateInKolkata();
    const record = await getAttendanceRecord(facility.doctor_id, facility.facility_id, attendanceDate);

    if (!record) {
      return res.status(404).json({ message: 'Attendance has not been marked for today yet.' });
    }

    if (record.check_out_time) {
      return res.status(409).json({ message: 'Attendance already checked out for today.' });
    }

    if (!record.check_in_time) {
      return res.status(400).json({ message: 'Check-in is required before check-out.' });
    }

    const checkOutTime = getCurrentAttendanceTimeInKolkata();

    await pool.query(
      `
        UPDATE attendance_records
        SET check_out_time = ?, updated_at = NOW()
        WHERE id = ?
      `,
      [checkOutTime, record.id]
    );

    await logAttendanceAction(user.id, 'ATTENDANCE_CHECKED_OUT', record.id, {
      doctorId: facility.doctor_id,
      facilityId: facility.facility_id,
      attendanceDate,
      checkOutTime,
    });

    return res.status(200).json({
      message: 'Check-out recorded successfully.',
      attendance: {
        id: record.id,
        date: attendanceDate,
        checkInTime: record.check_in_time,
        checkOutTime,
        status: record.status,
        facilityId: facility.facility_id,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to check out.' });
  }
}

async function getMyAttendance(req, res) {
  try {
    const user = req.user;
    const doctorId = user.doctorId;

    if (!doctorId) {
      return res.status(404).json({ message: 'Doctor profile is not linked to this account.' });
    }

    const [rows] = await pool.query(
      `
        SELECT ar.*, f.name AS facility_name
        FROM attendance_records ar
        INNER JOIN facilities f ON f.id = ar.facility_id
        WHERE ar.doctor_id = ?
        ORDER BY ar.attendance_date DESC, ar.created_at DESC
        LIMIT 10
      `,
      [doctorId]
    );

    return res.status(200).json({ attendance: rows });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load attendance history.' });
  }
}

async function getTodayAttendance(req, res) {
  try {
    const user = req.user;
    const facility = await getActiveDoctorFacility(user.id);

    if (!facility) {
      return res.status(404).json({ message: 'No active facility assignment found.' });
    }

    const attendanceDate = getCurrentAttendanceDateInKolkata();
    const record = await getAttendanceRecord(facility.doctor_id, facility.facility_id, attendanceDate);

    return res.status(200).json({
      attendance: record || null,
      facility: {
        id: facility.facility_id,
      },
      date: attendanceDate,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load today\'s attendance.' });
  }
}

async function getAttendanceSummary(req, res) {
  try {
    const user = req.user;
    const doctorId = user.doctorId;

    if (!doctorId) {
      return res.status(404).json({ message: 'Doctor profile is not linked to this account.' });
    }

    const [rows] = await pool.query(
      `
        SELECT *
        FROM attendance_records
        WHERE doctor_id = ?
        ORDER BY attendance_date DESC
        LIMIT 30
      `,
      [doctorId]
    );

    const summary = buildAttendanceSummary(rows);
    return res.status(200).json({ summary });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load attendance summary.' });
  }
}

module.exports = {
  markAttendance,
  checkOutAttendance,
  getMyAttendance,
  getTodayAttendance,
  getAttendanceSummary,
};
