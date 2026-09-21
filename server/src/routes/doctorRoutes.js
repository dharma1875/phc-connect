const express = require('express');
const { authenticateUser, requireRole } = require('../middleware/authMiddleware');
const { getDoctorDashboard, getDoctorProfile, getDoctorFacility } = require('../controllers/doctorController');

const router = express.Router();

router.use(authenticateUser, requireRole('DOCTOR'));

router.get('/dashboard', getDoctorDashboard);
router.get('/profile', getDoctorProfile);
router.get('/facility', getDoctorFacility);
router.get('/facility/:facilityId', getDoctorFacility);

module.exports = router;
