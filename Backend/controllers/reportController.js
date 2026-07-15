import { createReport, findAllReports } from '../models/reportModel.js';
import { buildId, getTodayDate } from '../services/timeService.js';

export async function getReports(req, res) {
  const reports = await findAllReports();
  res.json({ reports });
}

export async function addReport(req, res) {
  const report = {
    id: buildId('REP'),
    date: getTodayDate(),
    status: 'Submitted',
    ...req.body
  };
  const db = await createReport(report);
  res.status(201).json(db);
}
