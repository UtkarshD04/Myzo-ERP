import { findAllEmployees } from '../models/employeeModel.js';
import { Attendance } from '../models/attendanceModel.js';
import { Quotation } from '../models/quotationModel.js';
import {
  findAllPayrolls,
  upsertPayrollForMonth,
  updatePayrollById,
  markPayrollsSentToBank,
  filterPayrollsForViewer
} from '../models/payrollModel.js';
import { getOrCreateCompanyBank, consumeChequeNumber } from '../models/companyBankModel.js';
import { sendPayrollToBankEmail } from '../services/mailService.js';
import { buildId } from '../services/timeService.js';

function requireAdminOrHR(req) {
  const role = req.user.role;
  if (role !== 'Admin' && role !== 'HR') {
    const error = new Error('Access denied. Only Admins or HR can process payroll.');
    error.statusCode = 403;
    throw error;
  }
}

function workingDaysInMonth(month) {
  const [year, monthNum] = month.split('-').map(Number);
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  let workingDays = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const isSunday = new Date(year, monthNum - 1, day).getDay() === 0;
    if (!isSunday) workingDays++;
  }
  return workingDays;
}

function monthDateRange(month) {
  const [year, monthNum] = month.split('-').map(Number);
  return {
    start: new Date(year, monthNum - 1, 1),
    end: new Date(year, monthNum, 1)
  };
}

function monthLabel(month) {
  const [year, monthNum] = month.split('-').map(Number);
  return new Date(year, monthNum - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export async function getPayrolls(req, res) {
  const payrolls = filterPayrollsForViewer(await findAllPayrolls(), req.user);
  res.json({ payrolls });
}

// Shared by the HTTP handler (HR/Admin clicking "Generate Payroll") and the
// monthly auto-generation cron in services/payrollAutoGenService.js — both
// just need a month string and who/what triggered it.
export async function generatePayrollForMonth(month, { generatedBy, generatedByName } = {}) {
  const employees = (await findAllEmployees()).filter(e => e.employmentStatus !== 'Inactive');
  const workingDays = workingDaysInMonth(month);
  const { start: monthStart, end: monthEnd } = monthDateRange(month);

  const existing = await findAllPayrolls();
  const paidKeys = new Set(
    existing.filter(p => p.month === month && p.status === 'Paid').map(p => p.employeeId)
  );

  for (const employee of employees) {
    if (paidKeys.has(employee.id)) continue; // never overwrite a paid payslip

    const salary = Number(employee.salary) || 0;
    const basicPercent = employee.basicPercent ?? 50;
    const hraPercent = employee.hraPercent ?? 40;
    const medicalAllowance = employee.medicalAllowance ?? 2000;
    const pfPercent = employee.pfPercent ?? 12;
    const commissionPercent = employee.commissionPercent ?? 0;

    const basicPay = Math.round(salary * basicPercent / 100);
    const hra = Math.round(basicPay * hraPercent / 100);
    const medical = medicalAllowance;
    const grossEarnings = basicPay + hra + medical;

    const presentDays = await Attendance.countDocuments({
      employeeId: employee.id,
      date: { $regex: `^${month}` }
    });
    const lopDays = Math.max(workingDays - presentDays, 0);
    const perDayGross = workingDays > 0 ? grossEarnings / workingDays : 0;
    const lopAmount = Math.round(perDayGross * lopDays);

    // Commission is earned on quotations this employee closed ("Accepted")
    // during the month, attributed by acceptedAt rather than quoteDate so a
    // deal counts towards the month it actually closed in.
    const acceptedQuotations = await Quotation.find({
      salesperson: employee.id,
      status: 'Accepted',
      acceptedAt: { $gte: monthStart, $lt: monthEnd }
    }).lean();
    const commissionSales = acceptedQuotations.reduce((sum, q) => sum + (Number(q.totalAmount) || 0), 0);
    const commission = Math.round(commissionSales * commissionPercent / 100);

    const pf = Math.round(basicPay * pfPercent / 100);
    const otherDeductions = 0;
    const totalDeductions = lopAmount + pf + otherDeductions;
    const netPay = grossEarnings + commission - totalDeductions;

    await upsertPayrollForMonth(employee.id, month, {
      id: buildId('PAY'),
      employeeName: employee.name,
      department: employee.department,
      designation: employee.designation,
      salary,
      basicPercent,
      hraPercent,
      medicalAllowance,
      pfPercent,
      commissionPercent,
      basicPay,
      hra,
      medical,
      grossEarnings,
      workingDays,
      presentDays,
      lopDays,
      lopAmount,
      commissionSales,
      commission,
      pf,
      otherDeductions,
      totalDeductions,
      netPay,
      status: 'Generated',
      generatedBy,
      generatedByName
    });
  }

  return findAllPayrolls();
}

export async function generatePayroll(req, res) {
  requireAdminOrHR(req);

  const { month, generatedBy, generatedByName } = req.body;
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    const error = new Error('A valid month (YYYY-MM) is required.');
    error.statusCode = 400;
    throw error;
  }

  const payrolls = await generatePayrollForMonth(month, { generatedBy, generatedByName });
  res.status(201).json({ payrolls });
}

export async function modifyPayroll(req, res) {
  requireAdminOrHR(req);

  const { id } = req.params;
  const updates = { ...req.body };

  if (updates.status === 'Paid') {
    updates.paidAt = new Date();
  }

  // Approving a payslip is what makes it visible to the employee in
  // Payslips & Docs — stamp who/when server-side rather than trusting the client.
  if (updates.approved === true) {
    updates.approvedAt = new Date();
    updates.approvedBy = req.user.id;
    updates.approvedByName = req.user.name;
  } else if (updates.approved === false) {
    updates.approvedAt = null;
    updates.approvedBy = null;
    updates.approvedByName = null;
  }

  const payrolls = await updatePayrollById(id, updates);
  res.json({ payrolls });
}

export async function sendPayrollToBank(req, res) {
  requireAdminOrHR(req);

  const { month, chequeNumber } = req.body;
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    const error = new Error('A valid month (YYYY-MM) is required.');
    error.statusCode = 400;
    throw error;
  }

  const monthRows = (await findAllPayrolls()).filter(p => p.month === month);
  if (monthRows.length === 0) {
    const error = new Error('Generate payroll for this month before sending it to the bank.');
    error.statusCode = 400;
    throw error;
  }

  const companyBank = await getOrCreateCompanyBank();
  if (!companyBank.bankManagerEmail) {
    const error = new Error("Configure the bank manager's email in Settings → Company Bank first.");
    error.statusCode = 400;
    throw error;
  }

  const consumed = await consumeChequeNumber(Number(chequeNumber));
  if (!consumed) {
    const error = new Error('This cheque number was already used — refresh and try again.');
    error.statusCode = 409;
    throw error;
  }

  const totalAmount = monthRows.reduce((sum, p) => sum + (Number(p.netPay) || 0), 0);

  await sendPayrollToBankEmail({
    bankManagerName: companyBank.bankManagerName,
    bankManagerEmail: companyBank.bankManagerEmail,
    monthLabel: monthLabel(month),
    totalAmount,
    chequeNumber,
    attachments: [
      { filename: `Cheque-${month}.pdf`, content: req.body.chequePdfBase64, encoding: 'base64' },
      { filename: `Annexure-A-${month}.pdf`, content: req.body.disbursementPdfBase64, encoding: 'base64' }
    ]
  });

  const payrolls = await markPayrollsSentToBank(month, {
    sentToBankAt: new Date(),
    sentToBankBy: req.user.id,
    sentToBankByName: req.user.name,
    chequeNumber
  });

  res.json({ payrolls, companyBank: await getOrCreateCompanyBank() });
}
