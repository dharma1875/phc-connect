const service = require('./reportService');

function handle(method, key) {
  return async (req, res) => {
    try {
      const result = await service[method](req.query);
      try { await service.recordReportView(req.user.id, method, req.query); } catch (auditError) { }
      return res.json({ [key]: result });
    }
    catch (error) { return res.status(400).json({ message: error.message.startsWith('Invalid ') || error.message.includes('future') ? error.message : 'Unable to load report.' }); }
  };
}

module.exports = {
  attendance: handle('getAttendance', 'attendance'),
  attendanceTrend: handle('getAttendanceTrend', 'trend'),
  services: handle('getServices', 'services'),
  servicesTrend: handle('getServiceTrend', 'trend'),
  absenteeism: handle('getAbsenteeism', 'absenteeism'),
  absenteeismTrend: handle('getAbsenteeismTrend', 'trend'),
  facilities: handle('getFacilities', 'facilities'),
  taluks: handle('getTaluks', 'taluks'),
  facilityTypes: handle('getFacilityTypes', 'facilityTypes'),
  summary: handle('getSummary', 'summary'),
};