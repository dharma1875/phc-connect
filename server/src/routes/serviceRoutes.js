const express = require('express');
const { authenticateUser, requireRole } = require('../middleware/authMiddleware');
const { getServiceTypes, submitServiceReport, getMyServiceReports, getTodayServiceReport, getServiceSummary } = require('../controllers/serviceController');

const router = express.Router();

router.use(authenticateUser, requireRole('DOCTOR'));

router.get('/types', getServiceTypes);
router.post('/submit', submitServiceReport);
router.get('/my', getMyServiceReports);
router.get('/today', getTodayServiceReport);
router.get('/summary', getServiceSummary);

module.exports = router;
