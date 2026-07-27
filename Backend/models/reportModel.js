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

export async function createReport(report) {
  await Report.create(report);
  return findAllReports();
}

export async function updateReport(reportId, updates) {
  await Report.findOneAndUpdate({ id: reportId }, updates);
  return findAllReports();
}
