import {
  Attendance,
  createAttendanceRecord,
  updateAttendanceRecord
} from '../models/attendanceModel.js';
import {
  LateCheckoutRequest,
  createLateCheckoutRequestRecord,
  findAllLateCheckoutRequests,
  updateLateCheckoutRequestById
} from '../models/lateCheckoutRequestModel.js';
import { addNotification } from '../models/notificationModel.js';
import { Employee } from '../models/employeeModel.js';
import { buildId, getCurrentTimeLabel, getTodayDate, getISTHourMinute, getISTInstantToday } from './timeService.js';
import { sendLateCheckoutRequestReviewedEmail, sendLateCheckoutRequestSubmittedEmail } from './mailService.js';

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
  // Real UTC instant of 11:59 PM *IST*, not the server's own local 23:59 —
  // see timeService.js's header comment for why this can't be `new Date()`
  // + `.setHours()`.
  const cutoff = getISTInstantToday(23, 59, 0);

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

function isPastLateCheckoutCutoff(now) {
  const { hour, minute } = getISTHourMinute(now);
  return hour > LATE_CHECKOUT_HOUR
    || (hour === LATE_CHECKOUT_HOUR && minute >= LATE_CHECKOUT_MINUTE);
}

// Shared by a normal checkout and by an approved late-checkout request being
// actioned (reviewLateCheckoutRequest) — both end up writing the same
// Attendance record shape.
async function finalizeCheckoutRecord({ employeeId, date, location, time, now, lateCheckoutReason }) {
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
      lateCheckoutReason: lateCheckoutReason || null
    };
  });

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

export async function checkOut({ employeeId, location } = {}) {
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
  const exempt = isExemptFromAttendanceRules(emp);
  const isPastCutoff = isPastLateCheckoutCutoff(now);

  // Office (non-Field) employees past 6:30 PM can't self-serve a reason —
  // their punch-out only records once their reporting manager approves a
  // late-checkout request (see requestLateCheckout/reviewLateCheckoutRequest
  // below). Field Employees are exempt from this gate entirely: they run
  // past 6:30 PM as a matter of course and, if they never manually punch
  // out, get force-closed at 11:59 PM instead using their check-in location
  // (see autoPunchOutOpenRecords above).
  if (!exempt && !emp?.isField && isPastCutoff) {
    const approved = await LateCheckoutRequest.findOne({ employeeId, date, status: 'Approved' }).lean();
    if (!approved) {
      const error = new Error('It\'s past 6:30 PM. Please submit a punch-out request to your reporting manager for approval.');
      error.statusCode = 428;
      error.requiresApproval = true;
      throw error;
    }
    return finalizeCheckoutRecord({ employeeId, date, location, time, now, lateCheckoutReason: approved.reason });
  }

  return finalizeCheckoutRecord({ employeeId, date, location, time, now, lateCheckoutReason: null });
}

// Office (non-Field) employee submits a reason once past the 6:30 PM cutoff;
// it's routed to their direct reporting manager (employee.reportsTo),
// mirroring the direct-manager review pattern in reportController.modifyReport
// rather than leave's role-based approver — the spec here is "goes to their
// manager," not a role class. Field Employees don't use this at all — they're
// exempt from the 6:30 PM gate and instead force-closed at 11:59 PM if they
// never manually punch out (see autoPunchOutOpenRecords/checkOut above).
export async function requestLateCheckout({ employeeId, location, reason } = {}) {
  if (!reason?.trim()) {
    const error = new Error('Please provide a reason for the late punch-out request.');
    error.statusCode = 400;
    throw error;
  }

  const date = getTodayDate();
  const now = new Date();

  const existing = await Attendance.findOne({ employeeId, date }).lean();
  if (!existing || existing.checkOut) {
    const error = new Error(existing?.checkOut ? 'You have already punched out today.' : 'You have not punched in today.');
    error.statusCode = 400;
    throw error;
  }

  const emp = await Employee.findOne({ id: employeeId }).lean();
  if (emp?.isField) {
    const error = new Error('Late punch-out approval requests are only for Office Employees. Field Employees are auto punched-out at 11:59 PM.');
    error.statusCode = 400;
    throw error;
  }
  if (!isPastLateCheckoutCutoff(now)) {
    const error = new Error('Late punch-out requests can only be submitted after 6:30 PM.');
    error.statusCode = 400;
    throw error;
  }

  const alreadyPending = await LateCheckoutRequest.findOne({ employeeId, date, status: { $in: ['Pending', 'Approved'] } }).lean();
  if (alreadyPending) {
    const error = new Error(`You already have a ${alreadyPending.status.toLowerCase()} punch-out request for today.`);
    error.statusCode = 409;
    throw error;
  }

  await createLateCheckoutRequestRecord({
    id: buildId('LCR'),
    employeeId,
    employeeName: emp?.name || null,
    managerId: emp?.reportsTo || null,
    date,
    reason: reason.trim(),
    location: location || null,
    status: 'Pending'
  });

  const notifications = await addNotification({
    id: buildId('NOT'),
    title: 'Late Punch-Out Request Submitted',
    message: `${emp?.name || employeeId} requested approval to punch out late today, awaiting manager review.`,
    time: 'Just now',
    read: false,
    category: 'Attendance'
  });

  const lateCheckoutRequests = await findAllLateCheckoutRequests();

  if (emp?.reportsTo) {
    const manager = await Employee.findOne({ id: emp.reportsTo }).lean();
    sendLateCheckoutRequestSubmittedEmail(
      { employeeId, employeeName: emp?.name, date, reason: reason.trim() },
      manager
    ).catch(() => {});
  }

  return { notifications, lateCheckoutRequests };
}

// Only the request's direct reporting manager (or Admin) may approve/reject —
// same authorization shape as reportController.modifyReport's isTheirManager
// check. Approval performs the actual punch-out write; rejection leaves the
// employee still punched in so they can raise it with their manager directly.
export async function reviewLateCheckoutRequest(id, { status, reviewComments } = {}, requester) {
  const request = await LateCheckoutRequest.findOne({ id }).lean();
  if (!request) {
    const error = new Error('Late punch-out request not found.');
    error.statusCode = 404;
    throw error;
  }
  if (request.status !== 'Pending') {
    const error = new Error('This request has already been reviewed.');
    error.statusCode = 409;
    throw error;
  }
  if (!['Approved', 'Rejected'].includes(status)) {
    const error = new Error('Status must be Approved or Rejected.');
    error.statusCode = 400;
    throw error;
  }

  const isTheirManager = request.managerId === requester.id;
  if (!isTheirManager && requester.role !== 'Admin') {
    const error = new Error('Only the requester\'s reporting manager (or Admin) can review this request.');
    error.statusCode = 403;
    throw error;
  }

  const lateCheckoutRequests = await updateLateCheckoutRequestById(id, {
    status,
    reviewComments: reviewComments || null,
    reviewedBy: requester.id,
    reviewedAt: new Date()
  });

  let notifications;
  if (status === 'Approved') {
    const emp = await Employee.findOne({ id: request.employeeId }).lean();
    const time = getCurrentTimeLabel();
    const now = new Date();
    await finalizeCheckoutRecord({
      employeeId: request.employeeId,
      date: request.date,
      location: request.location,
      time,
      now,
      lateCheckoutReason: request.reason
    });
    notifications = await addNotification({
      id: buildId('NOT'),
      title: 'Late Punch-Out Approved',
      message: `${request.employeeName || request.employeeId}'s late punch-out request was approved and their punch-out has been recorded.`,
      time: 'Just now',
      read: false,
      category: 'Attendance'
    });
    const recipientEmail = emp?.officialEmail || emp?.email;
    if (recipientEmail) {
      sendLateCheckoutRequestReviewedEmail({ ...request, status }, { ...emp, officialEmail: recipientEmail }).catch(() => {});
    }
  } else {
    notifications = await addNotification({
      id: buildId('NOT'),
      title: 'Late Punch-Out Rejected',
      message: `${request.employeeName || request.employeeId}'s late punch-out request was rejected.`,
      time: 'Just now',
      read: false,
      category: 'Attendance'
    });
    const emp = await Employee.findOne({ id: request.employeeId }).lean();
    const recipientEmail = emp?.officialEmail || emp?.email;
    if (recipientEmail) {
      sendLateCheckoutRequestReviewedEmail({ ...request, status }, { ...emp, officialEmail: recipientEmail }).catch(() => {});
    }
  }

  const attendance = await Attendance.find({}).lean();
  return { notifications, lateCheckoutRequests, attendance };
}
