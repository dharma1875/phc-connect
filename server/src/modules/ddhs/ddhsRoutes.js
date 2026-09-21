const express = require('express');
const { authenticateUser, requireRole } = require('../../middleware/authMiddleware');
const {
  getDDHSDashboard,
  getDDHSDistricts,
  getDDHSDistrictTaluks,
  getDDHSFacilities,
  getDDHSFacilityDetails,
  getDDHSFacilityDoctors,
  getDDHSAttendance,
  getDDHSAttendanceSummary,
  getDDHSServices,
  getDDHSServicesSummary,
} = require('./ddhsController');

const router = express.Router();

router.use(authenticateUser, requireRole('DDHS'));

router.get('/dashboard', getDDHSDashboard);
router.get('/districts', getDDHSDistricts);
router.get('/districts/:districtId/taluks', getDDHSDistrictTaluks);
router.get('/facilities', getDDHSFacilities);
router.get('/facilities/:facilityId', getDDHSFacilityDetails);
router.get('/facilities/:facilityId/doctors', getDDHSFacilityDoctors);
router.get('/attendance', getDDHSAttendance);
router.get('/attendance/summary', getDDHSAttendanceSummary);
router.get('/services', getDDHSServices);
router.get('/services/summary', getDDHSServicesSummary);

module.exports = router;
