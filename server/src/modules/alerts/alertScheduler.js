const { checkAbsenteeism } = require('./alertService');

let schedulerStarted = false;

function startAlertScheduler() {
  if (schedulerStarted) {
    return null;
  }

  schedulerStarted = true;
  const intervalMinutes = Number(process.env.ALERT_CHECK_INTERVAL_MINUTES || 5);
  const intervalMs = Math.max(intervalMinutes, 1) * 60 * 1000;
  const run = () => checkAbsenteeism().catch((error) => console.error('Absenteeism check failed:', error.message));
  const timer = setInterval(run, intervalMs);
  run();
  return timer;
}

module.exports = { startAlertScheduler };