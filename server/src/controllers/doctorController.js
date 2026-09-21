const { pool } = require('../config/db');

async function getDoctorDashboard(req, res) {
  try {
    const user = req.user;

    const [doctorRows] = await pool.query(
      `
        SELECT d.id, d.doctor_id, d.full_name, d.designation, d.specialization,
               u.username, u.is_active,
               a.facility_id, f.name AS facility_name, f.facility_type,
               t.name AS taluk_name, dist.name AS district_name
        FROM doctors d
        INNER JOIN users u ON u.id = d.user_id
        INNER JOIN doctor_facility_assignments a ON a.doctor_id = d.id AND a.is_active = TRUE
        INNER JOIN facilities f ON f.id = a.facility_id
        INNER JOIN taluks t ON t.id = f.taluk_id
        INNER JOIN districts dist ON dist.id = f.district_id
        WHERE d.user_id = ?
        LIMIT 1
      `,
      [user.id]
    );

    if (!doctorRows.length) {
      return res.status(404).json({ message: 'Doctor profile not found.' });
    }

    const doctor = doctorRows[0];

    return res.status(200).json({
      doctor: {
        doctorId: doctor.doctor_id,
        name: doctor.full_name,
        designation: doctor.designation,
        specialization: doctor.specialization,
      },
      facility: {
        id: doctor.facility_id,
        name: doctor.facility_name,
        type: doctor.facility_type,
        taluk: doctor.taluk_name,
        district: doctor.district_name,
      },
      attendance: {
        status: 'NOT_MARKED',
      },
      dailyReport: {
        status: 'NOT_SUBMITTED',
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load doctor dashboard.' });
  }
}

async function getDoctorProfile(req, res) {
  try {
    const user = req.user;

    const [rows] = await pool.query(
      `
        SELECT d.id, d.doctor_id, d.full_name, d.designation, d.specialization,
               d.phone, u.username, u.is_active,
               f.id AS facility_id, f.name AS facility_name, f.facility_type,
               t.name AS taluk_name, dist.name AS district_name, r.name AS role_name
        FROM doctors d
        INNER JOIN users u ON u.id = d.user_id
        INNER JOIN roles r ON r.id = u.role_id
        INNER JOIN doctor_facility_assignments a ON a.doctor_id = d.id AND a.is_active = TRUE
        INNER JOIN facilities f ON f.id = a.facility_id
        INNER JOIN taluks t ON t.id = f.taluk_id
        INNER JOIN districts dist ON dist.id = f.district_id
        WHERE d.user_id = ?
        LIMIT 1
      `,
      [user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Doctor profile not found.' });
    }

    const doctor = rows[0];

    return res.status(200).json({
      doctorId: doctor.doctor_id,
      fullName: doctor.full_name,
      designation: doctor.designation,
      specialization: doctor.specialization,
      phone: doctor.phone,
      username: doctor.username,
      role: doctor.role_name,
      accountStatus: doctor.is_active ? 'ACTIVE' : 'INACTIVE',
      facility: {
        id: doctor.facility_id,
        name: doctor.facility_name,
        type: doctor.facility_type,
        taluk: doctor.taluk_name,
        district: doctor.district_name,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load doctor profile.' });
  }
}

async function validateDoctorFacilityAccess(userId, facilityId) {
  if (!facilityId) {
    return false;
  }

  const [rows] = await pool.query(
    `
      SELECT a.id
      FROM doctors d
      INNER JOIN doctor_facility_assignments a ON a.doctor_id = d.id
      WHERE d.user_id = ? AND a.facility_id = ? AND a.is_active = TRUE
      LIMIT 1
    `,
    [userId, facilityId]
  );

  return rows.length > 0;
}

async function getDoctorFacility(req, res) {
  try {
    const user = req.user;
    const requestedFacilityId = req.params.facilityId ? Number(req.params.facilityId) : null;

    const query = requestedFacilityId
      ? `
          SELECT f.id, f.name, f.facility_type, f.address, f.status,
                 t.name AS taluk_name, d.name AS district_name
          FROM doctor_facility_assignments a
          INNER JOIN facilities f ON f.id = a.facility_id
          INNER JOIN taluks t ON t.id = f.taluk_id
          INNER JOIN districts d ON d.id = f.district_id
          INNER JOIN doctors doc ON doc.id = a.doctor_id
          WHERE doc.user_id = ? AND a.facility_id = ? AND a.is_active = TRUE
          LIMIT 1
        `
      : `
          SELECT f.id, f.name, f.facility_type, f.address, f.status,
                 t.name AS taluk_name, d.name AS district_name
          FROM doctor_facility_assignments a
          INNER JOIN facilities f ON f.id = a.facility_id
          INNER JOIN taluks t ON t.id = f.taluk_id
          INNER JOIN districts d ON d.id = f.district_id
          INNER JOIN doctors doc ON doc.id = a.doctor_id
          WHERE doc.user_id = ? AND a.is_active = TRUE
          LIMIT 1
        `;

    const params = requestedFacilityId ? [user.id, requestedFacilityId] : [user.id];
    const [rows] = await pool.query(query, params);

    if (!rows.length) {
      return res.status(403).json({ message: 'Access denied. This facility is not assigned to your account.' });
    }

    const facility = rows[0];

    return res.status(200).json({
      id: facility.id,
      name: facility.name,
      facilityType: facility.facility_type,
      district: facility.district_name,
      taluk: facility.taluk_name,
      address: facility.address,
      status: facility.status,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load facility information.' });
  }
}

module.exports = {
  getDoctorDashboard,
  getDoctorProfile,
  getDoctorFacility,
  validateDoctorFacilityAccess,
};
