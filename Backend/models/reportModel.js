import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, sparse: true },
  date: String,
  employeeId: String,
  employeeName: String,
  department: String,
  tasksCompleted: String,
  challengesFaced: String,
  nextDayPlan: String,
  hoursSpent: Number,
  status: { type: String, default: 'Submitted' },
  reviewComments: String
}, { timestamps: true });

export const Report = mongoose.model('Report', reportSchema);

export async function findAllReports() {
  return Report.find({}).sort({ createdAt: -1 }).lean();
}

export async function findReportById(id) {
  return Report.findOne({ id }).lean();
}

export async function createReport(report) {
  await Report.create(report);
  return findAllReports();
}

export async function updateReport(reportId, updates) {
  await Report.findOneAndUpdate({ id: reportId }, updates);
  return findAllReports();
}

// Mirrors WorkReportView's client-side myReports/teamReports split: Admin
// sees everything, everyone else sees their own logs plus their direct
// reports' (org-chart based via employee.reportsTo, not a fixed role list).
export function filterReportsForViewer(reports, viewer, employees = []) {
  if (viewer.role === 'Admin') return reports;
  const employeeById = new Map(employees.map(e => [e.id, e]));
  return reports.filter(r =>
    r.employeeId === viewer.id || employeeById.get(r.employeeId)?.reportsTo === viewer.id
  );
}
