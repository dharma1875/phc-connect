const express = require('express');
const { authenticateUser, requireRole } = require('../middleware/authMiddleware');
const { markAttendance, checkOutAttendance, getMyAttendance, getTodayAttendance, getAttendanceSummary } = require('../controllers/attendanceController');

const router = express.Router();

router.use(authenticateUser, requireRole('DOCTOR'));
router.post('/mark', markAttendance);
router.post('/check-out', checkOutAttendance);
router.get('/my', getMyAttendance);
router.get('/today', getTodayAttendance);
router.get('/summary', getAttendanceSummary);

module.exports = router;
