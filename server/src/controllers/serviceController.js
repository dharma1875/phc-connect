const {
  getActiveServiceTypes,
  getMyServiceReports: getDoctorServiceHistory,
  getServiceSummaryForDoctor,
  getTodayServiceReportForDoctor,
  submitDoctorServices,
  groupMonthlyServiceTotals,
} = require('../services/serviceService');

async function getServiceTypes(req, res) {
  try {
    const types = await getActiveServiceTypes();
    return res.status(200).json(types);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Unable to load service types.' });
  }
}

async function submitServiceReport(req, res) {
  try {
    const result = await submitDoctorServices(req.user.id, req.body || {});
    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Unable to submit daily service report.' });
  }
}

async function getMyServiceReports(req, res) {
  try {
    const month = req.query.month;
    const year = req.query.year;
    const records = await getDoctorServiceHistory(req.user.id, month, year);
    return res.status(200).json({ reports: records });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Unable to load service history.' });
  }
}

async function getTodayServiceReport(req, res) {
  try {
    const report = await getTodayServiceReportForDoctor(req.user.id);

    if (!report) {
      return res.status(200).json({ status: 'NOT_SUBMITTED', serviceDate: new Date().toISOString().slice(0, 10) });
    }

    return res.status(200).json({
      status: 'SUBMITTED',
      serviceDate: report.service_date,
      submittedAt: report.submitted_at,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Unable to load today\'s report.' });
  }
}

async function getServiceSummary(req, res) {
  try {
    const month = Number(req.query.month || new Date().getMonth() + 1);
    const year = Number(req.query.year || new Date().getFullYear());
    const records = await getServiceSummaryForDoctor(req.user.id, month, year);

    return res.status(200).json({
      month,
      year,
      services: groupMonthlyServiceTotals(records),
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Unable to load service summary.' });
  }
}

module.exports = {
  getServiceTypes,
  submitServiceReport,
  getMyServiceReports,
  getTodayServiceReport,
  getServiceSummary,
};
