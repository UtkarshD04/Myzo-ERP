import {
  Attendance,
  createAttendanceRecord,
  updateAttendanceRecord
} from '../models/attendanceModel.js';
import { addNotification } from '../models/notificationModel.js';
import { Employee } from '../models/employeeModel.js';
import { buildId, getCurrentTimeLabel, getTodayDate } from './timeService.js';

export async function checkIn({ employeeId, location } = {}) {
  const date = getTodayDate();
  const time = getCurrentTimeLabel();
  const now = new Date();

  const existing = await Attendance.findOne({ employeeId, date }).lean();
  if (existing) {
    const error = new Error(
      existing.checkOut
        ? 'You have already completed your attendance for today.'
        : 'You have already checked in today.'
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
    message: `Checked in successfully today at ${time}. Roster active.`,
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
    const error = new Error('You have not checked in today.');
    error.statusCode = 400;
    throw error;
  }
  if (existing.checkOut) {
    const error = new Error('You have already checked out today.');
    error.statusCode = 409;
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
      overtime
    };
  });

  const notifications = await addNotification({
    id: buildId('NOT'),
    title: 'Shift Logged: Out',
    message: `Checked out successfully today at ${time}. Overtime logged.`,
    time: 'Just now',
    read: false,
    category: 'Attendance'
  });

  const attendance = await Attendance.find({}).lean();
  return { notifications, attendance };
}
