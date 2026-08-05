import { autoPunchOutOpenRecords } from './attendanceService.js';
import { getTodayDate } from './timeService.js';

let lastAutoPunchOutDateKey = null;

// Fires once per day once the clock hits 23:59, closing out anyone still
// punched in. Checked every minute (see server.js) so it triggers promptly
// after the cutoff without needing a dedicated cron dependency.
export async function runDailyAutoPunchOut() {
  const now = new Date();
  if (now.getHours() !== 23 || now.getMinutes() < 59) return;

  const dateKey = getTodayDate();
  if (lastAutoPunchOutDateKey === dateKey) return;
  lastAutoPunchOutDateKey = dateKey;

  await autoPunchOutOpenRecords();
}
