import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  employeeName: String,
  department: String,
  designation: String,
  month: { type: String, required: true }, // 'YYYY-MM'

  // Snapshot of the structure used at generation time, so later edits to an
  // employee's config don't retroactively change historical payslips.
  salary: { type: Number, default: 0 },
  basicPercent: { type: Number, default: 50 },
  hraPercent: { type: Number, default: 40 },
  medicalAllowance: { type: Number, default: 2000 },
  pfPercent: { type: Number, default: 12 },
  commissionPercent: { type: Number, default: 0 },

  basicPay: { type: Number, default: 0 },
  hra: { type: Number, default: 0 },
  medical: { type: Number, default: 0 },
  grossEarnings: { type: Number, default: 0 },

  workingDays: { type: Number, default: 0 },
  presentDays: { type: Number, default: 0 },
  lopDays: { type: Number, default: 0 },
  lopAmount: { type: Number, default: 0 },

  // Value of quotations this employee closed ("Accepted") during the month,
  // and the commission earned on it at commissionPercent.
  commissionSales: { type: Number, default: 0 },
  commission: { type: Number, default: 0 },

  pf: { type: Number, default: 0 },
  otherDeductions: { type: Number, default: 0 },
  totalDeductions: { type: Number, default: 0 },
  netPay: { type: Number, default: 0 },

  status: { type: String, default: 'Generated' }, // 'Generated' | 'Paid'
  generatedBy: String,
  generatedByName: String,
  paidAt: { type: Date, default: null },

  // A payslip is auto-generated every month but stays hidden from the
  // employee until HR/Admin explicitly approves it from the employee's
  // profile in the directory.
  approved: { type: Boolean, default: false },
  approvedAt: { type: Date, default: null },
  approvedBy: String,
  approvedByName: String,

  // Stamped across every record in a month's batch once HR sends that
  // month's cheque + disbursement sheet to the bank manager (see
  // payrollController.sendPayrollToBank).
  sentToBankAt: { type: Date, default: null },
  sentToBankBy: String,
  sentToBankByName: String,
  chequeNumber: String
}, { timestamps: true });

payrollSchema.index({ employeeId: 1, month: 1 }, { unique: true });

export const Payroll = mongoose.model('Payroll', payrollSchema);

export async function findAllPayrolls() {
  return Payroll.find({}).sort({ month: -1, employeeName: 1 }).lean();
}

export async function findPayrollsByMonth(month) {
  return Payroll.find({ month }).lean();
}

export async function upsertPayrollForMonth(employeeId, month, data) {
  await Payroll.findOneAndUpdate(
    { employeeId, month },
    { $set: { employeeId, month, ...data } },
    { upsert: true, setDefaultsOnInsert: true }
  );
}

export async function updatePayrollById(id, updates) {
  await Payroll.findOneAndUpdate({ id }, updates);
  return findAllPayrolls();
}

export async function markPayrollsSentToBank(month, patch) {
  await Payroll.updateMany({ month }, { $set: patch });
  return findAllPayrolls();
}

// Every field on a payroll record is compensation data (unlike the employee
// record's mix of general + sensitive fields), so there's no partial view —
// Admin/HR see all records (including unapproved ones, so they can approve
// them), everyone else only their own *approved* records (for Payslips & Docs).
export function filterPayrollsForViewer(payrolls, viewer) {
  if (viewer.role === 'Admin' || viewer.role === 'HR') return payrolls;
  return payrolls.filter(p => p.employeeId === viewer.id && p.approved);
}
