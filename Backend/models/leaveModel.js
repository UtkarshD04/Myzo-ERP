import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, sparse: true },
  employeeId: { type: String, required: true },
  employeeName: String,
  employeeRole: String,
  department: String,
  designation: String,
  leaveType: { type: String, default: 'Casual' },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  days: { type: Number, default: 0 },
  reason: String,
  status: { type: String, default: 'Pending' },
  reviewedBy: { type: String, default: null },
  reviewerRole: { type: String, default: null },
  reviewedAt: { type: Date, default: null },
  reviewComments: { type: String, default: null }
}, { timestamps: true });

leaveSchema.index({ employeeId: 1, startDate: 1 });

export const Leave = mongoose.model('Leave', leaveSchema);

export async function findAllLeaves() {
  return Leave.find({}).sort({ createdAt: -1 }).lean();
}

export async function createLeaveRecord(record) {
  return Leave.create(record);
}

export async function updateLeaveById(id, updates) {
  await Leave.findOneAndUpdate({ id }, updates);
  return findAllLeaves();
}

// Only HR/Admin (the approver roles — see leaveService.requiredApproverRole)
// need visibility into everyone's leave; everyone else should only ever see
// their own requests, matching what LeaveManagementView already renders
// client-side (isApprover-gated pendingApprovals/teamHistory sections).
export function filterLeavesForViewer(leaves, viewer) {
  if (viewer.role === 'Admin' || viewer.role === 'HR') return leaves;
  return leaves.filter(l => l.employeeId === viewer.id);
}
