import { createReport, findAllReports, findReportById, updateReport, filterReportsForViewer } from '../models/reportModel.js';
import { findAllEmployees } from '../models/employeeModel.js';
import { buildId, getTodayDate } from '../services/timeService.js';

export async function getReports(req, res) {
  const employees = await findAllEmployees();
  const reports = filterReportsForViewer(await findAllReports(), req.user, employees);
  res.json({ reports });
}

export async function addReport(req, res) {
  const { department, tasksCompleted, challengesFaced, nextDayPlan, hoursSpent } = req.body;
  // employeeId/employeeName/status come from the verified session, not the
  // body — otherwise anyone could submit a report as someone else, already
  // marked "Reviewed".
  const report = {
    id: buildId('REP'),
    date: getTodayDate(),
    status: 'Submitted',
    employeeId: req.user.id,
    employeeName: req.user.name,
    department,
    tasksCompleted,
    challengesFaced,
    nextDayPlan,
    hoursSpent
  };
  const allReports = await createReport(report);
  const employees = await findAllEmployees();
  res.status(201).json({ reports: filterReportsForViewer(allReports, req.user, employees) });
}

export async function modifyReport(req, res) {
  const { id } = req.params;
  const existing = await findReportById(id);
  if (!existing) {
    const error = new Error('Report not found.');
    error.statusCode = 404;
    throw error;
  }

  const employees = await findAllEmployees();
  const isOwnReport = existing.employeeId === req.user.id;
  const isTheirManager = employees.find(e => e.id === existing.employeeId)?.reportsTo === req.user.id;
  const isAdmin = req.user.role === 'Admin';

  if (!isOwnReport && !isTheirManager && !isAdmin) {
    const error = new Error('Access denied. You do not have permission to modify this report.');
    error.statusCode = 403;
    throw error;
  }

  const isReviewChange = req.body.status !== undefined || req.body.reviewComments !== undefined;
  if (isReviewChange && !isTheirManager && !isAdmin) {
    const error = new Error('Only your reporting manager or an Admin can review this report.');
    error.statusCode = 403;
    throw error;
  }

  const reports = await updateReport(id, req.body);
  res.json({ reports: filterReportsForViewer(reports, req.user, employees) });
}

