const express = require('express');
const { authenticateUser, requireRole } = require('../../middleware/authMiddleware');
const controller = require('./alertController');

const router = express.Router();
router.use(authenticateUser, requireRole('DDHS'));
router.post('/check-absenteeism', controller.checkAbsenteeism);
router.get('/summary', controller.alertSummary);
router.get('/', controller.listAlerts);
router.get('/:id', controller.alertDetails);
router.post('/:id/acknowledge', controller.acknowledgeAlert);
router.post('/:id/resolve', controller.resolveAlert);

module.exports = router;