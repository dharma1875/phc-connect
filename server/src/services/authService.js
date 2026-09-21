const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt');

async function findUserByUsername(username) {
  const [rows] = await pool.query(
    `
      SELECT u.id, u.username, u.password_hash, u.is_active, u.role_id,
             r.name AS role_name
      FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE u.username = ?
    `,
    [username]
  );

  return rows[0] || null;
}

async function findUserById(userId) {
  const [rows] = await pool.query(
    `
      SELECT u.id, u.username, u.is_active, u.role_id,
             r.name AS role_name
      FROM users u
      INNER JOIN roles r ON r.id = u.role_id
      WHERE u.id = ?
    `,
    [userId]
  );

  return rows[0] || null;
}

async function getDoctorProfileByUserId(userId) {
  const [rows] = await pool.query(
    `
      SELECT d.id AS doctor_id, d.full_name, d.designation,
             a.facility_id AS assigned_facility_id
      FROM doctors d
      LEFT JOIN doctor_facility_assignments a
        ON a.doctor_id = d.id AND a.is_active = TRUE
      WHERE d.user_id = ?
      ORDER BY a.created_at DESC
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}

function signToken(userPayload) {
  return jwt.sign(userPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

async function authenticateUser(username, password) {
  const user = await findUserByUsername(username);

  if (!user) {
    return null;
  }

  if (!user.is_active) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    return null;
  }

  return user;
}

function buildSafeUserPayload(user, doctorProfile = null) {
  const basePayload = {
    id: user.id,
    username: user.username,
    role: user.role_name,
  };

  if (user.role_name === 'DOCTOR') {
    return {
      ...basePayload,
      doctorId: doctorProfile?.doctor_id || null,
      name: doctorProfile?.full_name || null,
      designation: doctorProfile?.designation || null,
      assignedFacilityId: doctorProfile?.assigned_facility_id || null,
    };
  }

  return basePayload;
}

module.exports = {
  findUserByUsername,
  findUserById,
  getDoctorProfileByUserId,
  signToken,
  authenticateUser,
  buildSafeUserPayload,
};
