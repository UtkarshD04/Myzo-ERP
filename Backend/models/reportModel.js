import { readDb, updateDb } from '../db/fileDb.js';

export async function findAllReports() {
  const db = await readDb();
  return db.reports;
}

export async function createReport(report) {
  return updateDb((db) => ({
    ...db,
    reports: [report, ...db.reports]
  }));
}
