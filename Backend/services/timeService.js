// Every attendance/payroll rule in this app (6:30 PM late-checkout cutoff,
// 11:59 PM auto punch-out, "today"'s date) is defined in India Standard
// Time — but the server process can run in any OS timezone (most cloud
// hosts default to UTC), so reading wall-clock values off a plain `new
// Date()` would silently compute those cutoffs against the wrong clock.
// Every wall-clock read/construction below is pinned to Asia/Kolkata
// explicitly instead of relying on the process's local timezone.
const TIME_ZONE = 'Asia/Kolkata';

export function getTodayDate() {
  // en-CA formats as YYYY-MM-DD, so this doubles as the ISO date string
  // already used as the `date` key on Attendance/Leave/Payroll records.
  return new Date().toLocaleDateString('en-CA', { timeZone: TIME_ZONE });
}

export function getCurrentTimeLabel() {
  return new Date().toLocaleTimeString('en-US', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// Reads the IST wall-clock hour/minute of a given instant (defaults to
// now) — for cutoff checks like "is it past 6:30 PM IST", never `.getHours()`
// on a raw Date, which reflects the server's own timezone.
export function getISTHourMinute(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(date);
  const hour = Number(parts.find(p => p.type === 'hour').value) % 24; // midnight can format as "24"
  const minute = Number(parts.find(p => p.type === 'minute').value);
  return { hour, minute };
}

// Returns the actual UTC instant corresponding to hour:minute:second on
// *today's IST date* — e.g. getISTInstantToday(23, 59) for the 11:59 PM
// India-time auto punch-out cutoff. IST has a fixed +05:30 offset (no DST),
// so encoding that offset explicitly in the ISO string lets Date parse the
// correct absolute instant regardless of the server's own timezone.
export function getISTInstantToday(hour, minute, second = 0) {
  const pad = (n) => String(n).padStart(2, '0');
  const todayIST = getTodayDate(); // YYYY-MM-DD in IST
  return new Date(`${todayIST}T${pad(hour)}:${pad(minute)}:${pad(second)}+05:30`);
}

export function buildId(prefix) {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}
