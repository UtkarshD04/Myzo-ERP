import { createReport, findAllReports, updateReport } from '../models/reportModel.js';
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
  const reports = await createReport(report);
  res.status(201).json({ reports });
}

export async function modifyReport(req, res) {
  const { id } = req.params;
  const reports = await updateReport(id, req.body);
  res.json({ reports });
}

