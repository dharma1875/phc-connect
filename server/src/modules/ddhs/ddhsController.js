const {
  getDashboardSummary,
  getDistricts,
  getTaluksByDistrict,
  getFacilities,
  getFacilityById,
  getFacilityDoctors,
  getFacilityServiceStatus,
  getAttendanceRecords,
  getAttendanceSummary,
  getServiceReports,
  getServiceSummary,
} = require('./ddhsService');

async function getDDHSDashboard(req, res) {
  try {
    const summary = await getDashboardSummary();
    return res.status(200).json(summary);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load DDHS dashboard summary.' });
  }
}

async function getDDHSDistricts(req, res) {
  try {
    const districts = await getDistricts();
    return res.status(200).json(districts);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load districts.' });
  }
}

async function getDDHSDistrictTaluks(req, res) {
  try {
    const districtId = Number(req.params.districtId);
    const taluks = await getTaluksByDistrict(districtId);
    return res.status(200).json(taluks);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load taluks.' });
  }
}

async function getDDHSFacilities(req, res) {
  try {
    const filters = {
      districtId: req.query.districtId,
      talukId: req.query.talukId,
      facilityType: req.query.facilityType,
      status: req.query.status,
      search: req.query.search,
    };

    const facilities = await getFacilities(filters);
    return res.status(200).json({ facilities });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load facilities.' });
  }
}

async function getDDHSFacilityDetails(req, res) {
  try {
    const facilityId = Number(req.params.facilityId);
    const facility = await getFacilityById(facilityId);

    if (!facility) {
      return res.status(404).json({ message: 'Facility not found.' });
    }

    const doctors = await getFacilityDoctors(facilityId);
    const serviceStatus = await getFacilityServiceStatus(facilityId);

    return res.status(200).json({
      facility,
      doctors,
      serviceStatus,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load facility details.' });
  }
}

async function getDDHSFacilityDoctors(req, res) {
  try {
    const facilityId = Number(req.params.facilityId);
    const facility = await getFacilityById(facilityId);

    if (!facility) {
      return res.status(404).json({ message: 'Facility not found.' });
    }

    const doctors = await getFacilityDoctors(facilityId);
    return res.status(200).json({ doctors });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load facility doctors.' });
  }
}

async function getDDHSAttendance(req, res) {
  try {
    const filters = {
      districtId: req.query.districtId,
      talukId: req.query.talukId,
      facilityId: req.query.facilityId,
      facilityType: req.query.facilityType,
      date: req.query.date,
      status: req.query.status,
    };

    const records = await getAttendanceRecords(filters);
    return res.status(200).json({ attendance: records });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load attendance records.' });
  }
}

async function getDDHSAttendanceSummary(req, res) {
  try {
    const filters = {
      districtId: req.query.districtId,
      talukId: req.query.talukId,
      facilityId: req.query.facilityId,
      facilityType: req.query.facilityType,
      date: req.query.date,
      status: req.query.status,
    };

    const summary = await getAttendanceSummary(filters);
    return res.status(200).json(summary);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load attendance summary.' });
  }
}

async function getDDHSServices(req, res) {
  try {
    const filters = {
      districtId: req.query.districtId,
      talukId: req.query.talukId,
      facilityId: req.query.facilityId,
      facilityType: req.query.facilityType,
      date: req.query.date,
      serviceTypeId: req.query.serviceTypeId,
    };

    const records = await getServiceReports(filters);
    return res.status(200).json({ services: records });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load service reports.' });
  }
}

async function getDDHSServicesSummary(req, res) {
  try {
    const filters = {
      districtId: req.query.districtId,
      talukId: req.query.talukId,
      facilityId: req.query.facilityId,
      facilityType: req.query.facilityType,
      date: req.query.date,
      serviceTypeId: req.query.serviceTypeId,
    };

    const summary = await getServiceSummary(filters);
    return res.status(200).json({ services: summary });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load service summary.' });
  }
}

module.exports = {
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
};
