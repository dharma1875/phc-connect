const alertService = require('./alertService');

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function listAlerts(req, res) {
  try {
    return res.json({ alerts: await alertService.getAlerts(req.query) });
  } catch (error) {
    return res.status(400).json({ message: error.message.startsWith('Invalid ') ? error.message : 'Unable to load alerts.' });
  }
}

async function alertSummary(req, res) {
  try { return res.json(await alertService.getAlertSummary()); } catch (error) { return res.status(500).json({ message: 'Unable to load alert summary.' }); }
}

async function alertDetails(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: 'Invalid alert ID.' });
  try {
    const alert = await alertService.getAlertById(id);
    return alert ? res.json(alert) : res.status(404).json({ message: 'Alert not found.' });
  } catch (error) { return res.status(500).json({ message: 'Unable to load alert details.' }); }
}

async function changeStatus(status, req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: 'Invalid alert ID.' });
  try {
    const alert = await alertService.updateAlertStatus(id, status, req.user.id, req.body?.resolutionNote);
    return alert ? res.json(alert) : res.status(404).json({ message: 'Alert not found.' });
  } catch (error) { return res.status(409).json({ message: error.message || 'Unable to update alert.' }); }
}

async function checkAbsenteeism(req, res) {
  try { return res.json({ message: 'Absenteeism check completed.', ...(await alertService.checkAbsenteeism()) }); }
  catch (error) { return res.status(500).json({ message: 'Unable to complete absenteeism check.' }); }
}

module.exports = { listAlerts, alertSummary, alertDetails, acknowledgeAlert: (req, res) => changeStatus('ACKNOWLEDGED', req, res), resolveAlert: (req, res) => changeStatus('RESOLVED', req, res), checkAbsenteeism };