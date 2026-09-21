const express = require('express');
const { login, logout, getCurrentUser } = require('../controllers/authController');
const { authenticateUser, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.post('/logout', authenticateUser, logout);
router.get('/me', authenticateUser, getCurrentUser);
router.get('/ddhs-test', authenticateUser, requireRole('DDHS'), (req, res) => {
  return res.json({ role: 'DDHS', message: 'DDHS access verified.' });
});
router.get('/doctor-test', authenticateUser, requireRole('DOCTOR'), (req, res) => {
  return res.json({ role: 'DOCTOR', message: 'Doctor access verified.' });
});

module.exports = router;
