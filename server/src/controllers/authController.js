const { pool } = require('../config/db');
const { authenticateUser, signToken, getDoctorProfileByUserId, buildSafeUserPayload } = require('../services/authService');

async function writeAuditLog(userId, action, details = {}) {
  await pool.query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
     VALUES (?, ?, 'AUTH', NULL, ?)`,
    [userId || null, action, JSON.stringify(details)]
  );
}

async function login(req, res) {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password.trim() : '';

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  try {
    const user = await authenticateUser(username, password);

    if (!user) {
      await writeAuditLog(null, 'LOGIN_FAILED', { username, attemptedAt: new Date().toISOString() });
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const doctorProfile = user.role_id === 2 ? await getDoctorProfileByUserId(user.id) : null;
    const safeUser = buildSafeUserPayload(user, doctorProfile);
    const token = signToken({ id: user.id, username: user.username, role: user.role_name });

    await writeAuditLog(user.id, 'LOGIN_SUCCESS', { username: user.username, role: user.role_name, timestamp: new Date().toISOString() });

    return res.status(200).json({
      success: true,
      token,
      user: safeUser,
    });
  } catch (error) {
    await writeAuditLog(null, 'LOGIN_FAILED', { username, attemptedAt: new Date().toISOString() });
    return res.status(500).json({ success: false, message: 'Unable to process login request.' });
  }
}

async function logout(req, res) {
  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
}

async function getCurrentUser(req, res) {
  return res.status(200).json({ success: true, data: req.user });
}

module.exports = {
  login,
  logout,
  getCurrentUser,
};
