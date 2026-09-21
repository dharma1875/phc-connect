const express = require('express');
const { authenticateUser, requireRole } = require('../../middleware/authMiddleware');
const controller = require('./reportController');

const router = express.Router();
router.use(authenticateUser, requireRole('DDHS'));
router.get('/attendance', controller.attendance);
router.get('/attendance/trend', controller.attendanceTrend);
router.get('/services', controller.services);
router.get('/services/trend', controller.servicesTrend);
router.get('/absenteeism', controller.absenteeism);
router.get('/absenteeism/trend', controller.absenteeismTrend);
router.get('/facilities', controller.facilities);
router.get('/taluks', controller.taluks);
router.get('/facility-types', controller.facilityTypes);
router.get('/summary', controller.summary);

module.exports = router;