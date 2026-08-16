import { autoPunchOutOpenRecords, flagUnresolvedCheckouts } from './attendanceService.js';
import { getTodayDate, getISTHourMinute } from './timeService.js';

let lastAutoPunchOutDateKey = null;

// Fires once per day once the clock hits 23:59 *IST* (not the server's own
// local time — see timeService.js), closing out anyone still punched in.
// Checked every minute (see server.js) so it triggers promptly after the
// cutoff without needing a dedicated cron dependency.
export async function runDailyAutoPunchOut() {
  const now = new Date();
  const { hour, minute } = getISTHourMinute(now);
  if (hour !== 23 || minute < 59) return;

  const dateKey = getTodayDate();
  if (lastAutoPunchOutDateKey === dateKey) return;
  lastAutoPunchOutDateKey = dateKey;

  // Field Employees first: force-close today's still-open records so they
  // don't also get swept up as "unresolved" below.
  await autoPunchOutOpenRecords();
  // Then Office Employees (plus any stale backlog): file a Pending
  // late-checkout request instead of closing the record outright.
  await flagUnresolvedCheckouts();
}
