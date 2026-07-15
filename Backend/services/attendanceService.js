import {
  createAttendanceRecord,
  findAttendanceHistory,
  updateAttendanceRecord
} from '../models/attendanceModel.js';
import { addNotification } from '../models/notificationModel.js';
import { buildId, getCurrentTimeLabel, getTodayDate } from './timeService.js';

export async function checkIn() {
  const date = getTodayDate();
  const time = getCurrentTimeLabel();
  const history = await findAttendanceHistory();
  const existing = history.find((record) => record.date === date);

  if (existing) {
    const error = new Error('You have already initiated a clock-in record for today.');
    error.statusCode = 409;
    throw error;
  }

  await createAttendanceRecord({
    date,
    checkIn: time,
    checkOut: null,
    workingHours: 0,
    overtime: 0,
    status: 'Present',
    lateMark: false
  });

  const db = await addNotification({
    id: buildId('NOT'),
    title: 'Shift Logged: In',
    message: `Checked in successfully today at ${time}. Roster active.`,
    time: 'Just now',
    read: false,
    category: 'Attendance'
  });

  return db;
}

export async function checkOut() {
  const date = getTodayDate();
  const time = getCurrentTimeLabel();
  const history = await findAttendanceHistory();
  const existing = history.find((record) => record.date === date);

  if (!existing || !existing.checkIn) {
    const error = new Error('Please check in before checking out.');
    error.statusCode = 400;
    throw error;
  }

  if (existing.checkOut) {
    const error = new Error('You have already checked out today.');
    error.statusCode = 409;
    throw error;
  }

  await updateAttendanceRecord(date, (record) => {
    const mockHours = +(7.5 + Math.random() * 1.75).toFixed(2);
    const overtime = mockHours > 8 ? +(mockHours - 8).toFixed(2) : 0;

    return {
      ...record,
      checkOut: time,
      workingHours: mockHours,
      overtime
    };
  });

  const db = await addNotification({
    id: buildId('NOT'),
    title: 'Shift Logged: Out',
    message: `Checked out successfully today at ${time}. Overtime logged.`,
    time: 'Just now',
    read: false,
    category: 'Attendance'
  });

  return db;
}
