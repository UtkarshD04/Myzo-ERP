import mongoose from 'mongoose';

const expenseClaimSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, sparse: true },
  employeeId: { type: String, required: true },
  employeeName: String,
  department: String,
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  expenseDate: { type: String, required: true },
  description: String,
  receiptImage: String,
  status: { type: String, default: 'Pending' },
  reviewedBy: { type: String, default: null },
  reviewerRole: { type: String, default: null },
  reviewedAt: { type: Date, default: null },
  reviewComments: { type: String, default: null }
}, { timestamps: true });

expenseClaimSchema.index({ employeeId: 1, createdAt: -1 });

export const ExpenseClaim = mongoose.model('ExpenseClaim', expenseClaimSchema);

export async function findAllExpenseClaims() {
  return ExpenseClaim.find({}).sort({ createdAt: -1 }).lean();
}

export async function createExpenseClaimRecord(record) {
  return ExpenseClaim.create(record);
}

export async function updateExpenseClaimById(id, updates) {
  await ExpenseClaim.findOneAndUpdate({ id }, updates);
  return findAllExpenseClaims();
}

// Approvers (Manager/HR/Admin) need visibility into everyone's claims to
// review them; everyone else only ever sees their own — same shape as
// leaveModel.filterLeavesForViewer.
export function filterExpenseClaimsForViewer(claims, viewer) {
  if (['Admin', 'HR', 'Manager'].includes(viewer.role)) return claims;
  return claims.filter(c => c.employeeId === viewer.id);
}
