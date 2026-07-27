import { findAllEmployees } from '../models/employeeModel.js';
import { Attendance } from '../models/attendanceModel.js';
import {
  findAllPayrolls,
  upsertPayrollForMonth,
  updatePayrollById
} from '../models/payrollModel.js';
import { buildId } from '../services/timeService.js';

function requireAdminOrHR(req) {
  const role = req.headers['x-user-role'];
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

export async function getPayrolls(req, res) {
  const payrolls = await findAllPayrolls();
  res.json({ payrolls });
}

export async function generatePayroll(req, res) {
  requireAdminOrHR(req);

  const { month, generatedBy, generatedByName } = req.body;
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    const error = new Error('A valid month (YYYY-MM) is required.');
    error.statusCode = 400;
    throw error;
  }

  const employees = (await findAllEmployees()).filter(e => e.employmentStatus !== 'Inactive');
  const workingDays = workingDaysInMonth(month);

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

    const pf = Math.round(basicPay * pfPercent / 100);
    const otherDeductions = 0;
    const totalDeductions = lopAmount + pf + otherDeductions;
    const netPay = grossEarnings - totalDeductions;

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
      basicPay,
      hra,
      medical,
      grossEarnings,
      workingDays,
      presentDays,
      lopDays,
      lopAmount,
      pf,
      otherDeductions,
      totalDeductions,
      netPay,
      status: 'Generated',
      generatedBy,
      generatedByName
    });
  }

  const payrolls = await findAllPayrolls();
  res.status(201).json({ payrolls });
}

export async function modifyPayroll(req, res) {
  requireAdminOrHR(req);

  const { id } = req.params;
  const updates = { ...req.body };

  if (updates.status === 'Paid') {
    updates.paidAt = new Date();
  }

  const payrolls = await updatePayrollById(id, updates);
  res.json({ payrolls });
}
