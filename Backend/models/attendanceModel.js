import { readDb, updateDb } from '../db/fileDb.js';

export async function findAttendanceHistory() {
  const db = await readDb();
  return db.attendance;
}

export async function createAttendanceRecord(record) {
  return updateDb((db) => ({
    ...db,
    attendance: [...db.attendance, record]
  }));
}

export async function updateAttendanceRecord(date, updater) {
  return updateDb((db) => ({
    ...db,
    attendance: db.attendance.map((record) => (
      record.date === date ? updater(record) : record
    ))
  }));
}
