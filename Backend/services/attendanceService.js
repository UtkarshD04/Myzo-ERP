import {
  Attendance,
  createAttendanceRecord,
  updateAttendanceRecord
} from '../models/attendanceModel.js';
import { addNotification } from '../models/notificationModel.js';
import { Employee } from '../models/employeeModel.js';
import { buildId, getCurrentTimeLabel, getTodayDate } from './timeService.js';
import { sendLateCheckoutEmail } from './mailService.js';

// Admins run the org, not a shift — neither the 6:30 PM late-checkout mail
// gate nor the 11:59 PM auto punch-out applies to them.
function isExemptFromAttendanceRules(emp) {
  return emp?.role === 'Admin' || !!emp?.isSuperAdmin;
}

export async function checkIn({ employeeId, location } = {}) {
  const date = getTodayDate();
  const time = getCurrentTimeLabel();
  const now = new Date();

  const existing = await Attendance.findOne({ employeeId, date }).lean();
  if (existing) {
    const error = new Error(
      existing.checkOut
        ? 'You have already completed your attendance for today.'
        : 'You have already punched in today.'
    );
    error.statusCode = 409;
    throw error;
  }

  const emp = await Employee.findOne({ id: employeeId }).lean();

  await createAttendanceRecord({
    employeeId,
    name:       emp?.name       || null,
    role:       emp?.role       || null,
    department: emp?.department || null,
    date,
    checkIn: time,
    checkInAt: now,
    checkInLocation: location || null,
    checkOut: null,
    checkOutAt: null,
    checkOutLocation: null,
    workingHours: 0,
    overtime: 0,
    status: 'Present',
    lateMark: false
  });

  const notifications = await addNotification({
    id: buildId('NOT'),
    title: 'Shift Logged: In',
    message: `Punched in successfully today at ${time}. Roster active.`,
    time: 'Just now',
    read: false,
    category: 'Attendance'
  });

  const attendance = await Attendance.find({}).lean();
  return { notifications, attendance };
}

const STANDARD_WORK_HOURS = 8;
const AUTO_PUNCH_OUT_TIME_LABEL = '11:59 PM';

// Only Field Employees get force-closed at day's end — office staff go
// through the 6:30 PM late-checkout mail gate instead (see checkOut below),
// and Admins/Super Admins are exempt from both. Reuses the punch-in location
// since there's no live GPS to sample from a server-side job. Hours beyond
// the standard 8 still count as overtime, same as a manual punch-out.
export async function autoPunchOutOpenRecords() {
  const date = getTodayDate();
  const cutoff = new Date();
  cutoff.setHours(23, 59, 0, 0);

  const fieldEmployees = await Employee.find(
    { isField: true, role: { $ne: 'Admin' }, isSuperAdmin: { $ne: true } },
    { id: 1 }
  ).lean();
  const fieldEmployeeIds = fieldEmployees.map(e => e.id);

  const openRecords = await Attendance.find({
    date,
    checkOut: null,
    employeeId: { $in: fieldEmployeeIds }
  }).lean();

  for (const record of openRecords) {
    const checkInTime = record.checkInAt ? new Date(record.checkInAt) : null;
    const workingHours = checkInTime
      ? Math.max(+((cutoff - checkInTime) / (1000 * 60 * 60)).toFixed(2), 0)
      : 0;
    const overtime = workingHours > STANDARD_WORK_HOURS ? +(workingHours - STANDARD_WORK_HOURS).toFixed(2) : 0;

    await updateAttendanceRecord(record.employeeId, date, (r) => ({
      ...r,
      checkOut: AUTO_PUNCH_OUT_TIME_LABEL,
      checkOutAt: cutoff,
      checkOutLocation: r.checkInLocation || null,
      workingHours,
      overtime,
      autoCheckOut: true
    }));

    await addNotification({
      id: buildId('NOT'),
      title: 'Shift Logged: Auto Punch-Out',
      message: `You were automatically punched out at ${AUTO_PUNCH_OUT_TIME_LABEL} since no punch-out was recorded. Overtime logged.`,
      time: 'Just now',
      read: false,
      category: 'Attendance'
    });
  }

  return openRecords.length;
}

const LATE_CHECKOUT_HOUR = 18;
const LATE_CHECKOUT_MINUTE = 30;

export async function checkOut({ employeeId, location, reason } = {}) {
  const date = getTodayDate();
  const time = getCurrentTimeLabel();
  const now = new Date();

  const existing = await Attendance.findOne({ employeeId, date }).lean();
  if (!existing) {
    const error = new Error('You have not punched in today.');
    error.statusCode = 400;
    throw error;
  }
  if (existing.checkOut) {
    const error = new Error('You have already punched out today.');
    error.statusCode = 409;
    throw error;
  }

  const emp = await Employee.findOne({ id: employeeId }).lean();

  // Office (non-Field) employees who haven't punched out by 6:30 PM must give
  // a reason before the punch-out goes through; it's then emailed to HR/Admin.
  // Field Employees skip this — they run past 6:30 PM as a matter of course
  // and get force-closed at 11:59 PM instead (see autoPunchOutOpenRecords).
  const isLateCheckoutGated = !isExemptFromAttendanceRules(emp) && !emp?.isField
    && (now.getHours() > LATE_CHECKOUT_HOUR || (now.getHours() === LATE_CHECKOUT_HOUR && now.getMinutes() >= LATE_CHECKOUT_MINUTE));

  if (isLateCheckoutGated && !reason?.trim()) {
    const error = new Error('It\'s past 6:30 PM. Please provide a reason to punch out — it will be emailed to HR/Admin.');
    error.statusCode = 428;
    error.requiresReason = true;
    throw error;
  }

  await updateAttendanceRecord(employeeId, date, (record) => {
    const checkInTime = record.checkInAt ? new Date(record.checkInAt) : null;
    const workingHours = checkInTime
      ? Math.max(+((now - checkInTime) / (1000 * 60 * 60)).toFixed(2), 0)
      : 0;
    const overtime = workingHours > 8 ? +(workingHours - 8).toFixed(2) : 0;

    return {
      ...record,
      checkOut: time,
      checkOutAt: now,
      checkOutLocation: location || null,
      workingHours,
      overtime,
      lateCheckoutReason: isLateCheckoutGated ? reason.trim() : null
    };
  });

  if (isLateCheckoutGated) {
    const hrAdmins = await Employee.find({ role: { $in: ['HR', 'Admin'] } }, { officialEmail: 1, email: 1 }).lean();
    const recipients = hrAdmins.map(e => e.officialEmail || e.email).filter(Boolean);
    // Best-effort: SMTP may be unconfigured, never let that block the punch-out itself.
    sendLateCheckoutEmail(emp, reason.trim(), time, recipients).catch(() => {});
  }

  const notifications = await addNotification({
    id: buildId('NOT'),
    title: 'Shift Logged: Out',
    message: `Punched out successfully today at ${time}. Overtime logged.`,
    time: 'Just now',
    read: false,
    category: 'Attendance'
  });

  const attendance = await Attendance.find({}).lean();
  return { notifications, attendance };
}
