const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');
const { findUserById, getDoctorProfileByUserId, buildSafeUserPayload } = require('../services/authService');

async function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(decoded.id);

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'User account is inactive or invalid.' });
    }

    const doctorProfile = user.role_id === 2 ? await getDoctorProfileByUserId(user.id) : null;
    req.user = buildSafeUserPayload(user, doctorProfile);

    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Insufficient role permissions.' });
    }

    return next();
  };
}

module.exports = {
  authenticateUser,
  requireRole,
};
