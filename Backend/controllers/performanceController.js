import { Task } from '../models/taskModel.js';
import { Report } from '../models/reportModel.js';
import { Attendance } from '../models/attendanceModel.js';
import { Quotation } from '../models/quotationModel.js';
import { Invoice } from '../models/invoiceModel.js';
import { Payroll } from '../models/payrollModel.js';
import { PurchaseOrder } from '../models/purchaseOrderModel.js';
import { getTodayDate } from '../services/timeService.js';

// Roles/departments allowed to see company-wide financial aggregates (as
// opposed to the developer/BDE blocks below, which only ever compute the
// caller's own records and so need no extra gate). Kept separate from the
// formal role enum because "Finance" is a free-text department, not a role.
const FINANCE_VIEWER_ROLES = ['Admin', 'HR', 'Manager'];

function isFinanceViewer(user) {
  return FINANCE_VIEWER_ROLES.includes(user.role) || (user.department || '').toLowerCase() === 'finance';
}

// Working days elapsed so far this month (excluding Sundays), capped at today
// when `month` is the current month — otherwise a mid-month attendance rate
// would be measured against days that haven't happened yet.
function workingDaysElapsed(month) {
  const [year, monthNum] = month.split('-').map(Number);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === monthNum;
  const lastDay = isCurrentMonth ? today.getDate() : new Date(year, monthNum, 0).getDate();
  let workingDays = 0;
  for (let day = 1; day <= lastDay; day++) {
    if (new Date(year, monthNum - 1, day).getDay() !== 0) workingDays++;
  }
  return workingDays;
}

async function getDeveloperMetrics(userId, month) {
  const tasks = await Task.find({ $or: [{ assignedTo: userId }, { assignedBy: userId }] }).lean();
  const tasksCompleted = tasks.filter(t => t.status === 'Completed').length;
  const tasksInProgress = tasks.filter(t => t.status === 'In Progress').length;
  const tasksInReview = tasks.filter(t => t.status === 'In Review').length;
  const tasksToDo = tasks.filter(t => t.status === 'To Do').length;

  const monthReports = await Report.find({ employeeId: userId, date: { $regex: `^${month}` } }).lean();
  const hoursLoggedThisMonth = monthReports.reduce((sum, r) => sum + (Number(r.hoursSpent) || 0), 0);

  const presentDaysThisMonth = await Attendance.countDocuments({ employeeId: userId, date: { $regex: `^${month}` } });
  const workingDaysThisMonth = workingDaysElapsed(month);

  return {
    tasksTotal: tasks.length,
    tasksCompleted,
    tasksInProgress,
    tasksInReview,
    tasksToDo,
    completionRate: tasks.length > 0 ? Math.round((tasksCompleted / tasks.length) * 100) : 0,
    reportsThisMonth: monthReports.length,
    hoursLoggedThisMonth,
    presentDaysThisMonth,
    workingDaysThisMonth,
    attendanceRateThisMonth: workingDaysThisMonth > 0 ? Math.round((presentDaysThisMonth / workingDaysThisMonth) * 100) : 0
  };
}

async function getFinanceMetrics(month) {
  const today = getTodayDate();
  const invoices = await Invoice.find({}).lean();

  let outstandingAmount = 0, overdueCount = 0, overdueAmount = 0, paidTotalAmount = 0, paidTotalCount = 0;
  for (const inv of invoices) {
    if (inv.status === 'Cancelled') continue;
    const amount = Number(inv.totalAmount) || 0;
    if (inv.status === 'Paid') {
      paidTotalAmount += amount;
      paidTotalCount++;
      continue;
    }
    // Unpaid or Overdue (whatever label was manually set) both still owe money.
    outstandingAmount += amount;
    if (inv.dueDate && inv.dueDate < today) {
      overdueCount++;
      overdueAmount += amount;
    }
  }

  const payrolls = await Payroll.find({ month }).lean();
  const purchaseOrders = await PurchaseOrder.find({}).lean();

  return {
    month,
    invoices: {
      totalCount: invoices.length,
      outstandingAmount,
      overdueCount,
      overdueAmount,
      paidTotalAmount,
      paidTotalCount
    },
    payroll: {
      totalNetPayoutThisMonth: payrolls.reduce((sum, p) => sum + (Number(p.netPay) || 0), 0),
      totalCommissionThisMonth: payrolls.reduce((sum, p) => sum + (Number(p.commission) || 0), 0),
      paidCount: payrolls.filter(p => p.status === 'Paid').length,
      pendingCount: payrolls.filter(p => p.status !== 'Paid').length
    },
    purchaseOrders: {
      openCount: purchaseOrders.filter(po => po.status === 'Draft' || po.status === 'Ordered').length,
      // receivedDate is stamped server-side exactly when a PO transitions to
      // Received (see purchaseOrderService), so it's a reliable "this month" key.
      spendThisMonth: purchaseOrders
        .filter(po => po.status === 'Received' && (po.receivedDate || '').startsWith(month))
        .reduce((sum, po) => sum + (Number(po.totalAmount) || 0), 0)
    }
  };
}

async function getBdeMetrics(userId, month) {
  const quotations = await Quotation.find({ salesperson: userId }).lean();

  const funnel = { Draft: 0, Sent: 0, Accepted: 0, Rejected: 0 };
  const clientKeys = new Set();
  let pipelineValue = 0;
  let businessGeneratedThisMonth = 0;
  let closeDurationDaysSum = 0;
  let closedWithDatesCount = 0;

  for (const q of quotations) {
    if (funnel[q.status] !== undefined) funnel[q.status]++;
    if (q.status === 'Draft' || q.status === 'Sent') pipelineValue += Number(q.totalAmount) || 0;

    const clientKey = (q.customerEmail || q.customerName || '').toLowerCase().trim();
    if (clientKey) clientKeys.add(clientKey);

    if (q.status === 'Accepted' && q.acceptedAt) {
      if (new Date(q.acceptedAt).toISOString().slice(0, 7) === month) {
        businessGeneratedThisMonth += Number(q.totalAmount) || 0;
      }
      if (q.sentAt) {
        closeDurationDaysSum += (new Date(q.acceptedAt) - new Date(q.sentAt)) / 86400000;
        closedWithDatesCount++;
      }
    }
  }

  const recentQuotations = [...quotations]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(q => ({ id: q.id, customerName: q.customerName, status: q.status, totalAmount: q.totalAmount, quoteDate: q.quoteDate }));

  return {
    totalQuotations: quotations.length,
    pipelineValue,
    businessGeneratedThisMonth,
    clientsEngaged: clientKeys.size,
    conversionRate: quotations.length > 0 ? Math.round((funnel.Accepted / quotations.length) * 100) : 0,
    avgCloseTimeDays: closedWithDatesCount > 0 ? Math.round((closeDurationDaysSum / closedWithDatesCount) * 10) / 10 : null,
    funnel,
    recentQuotations
  };
}

// One real-data source for the dashboards that used to render hardcoded demo
// numbers (Developer/Finance/BDE — see GeneralDashboard/BDEDashboard). The
// frontend already knows which block(s) to display for the viewer's
// department/designation; this endpoint just computes them for real instead
// of leaving `kpis` as an empty object.
export async function getPerformanceSummary(req, res) {
  const month = getTodayDate().slice(0, 7);

  const [developer, bde, finance] = await Promise.all([
    getDeveloperMetrics(req.user.id, month),
    getBdeMetrics(req.user.id, month),
    isFinanceViewer(req.user) ? getFinanceMetrics(month) : Promise.resolve(null)
  ]);

  res.json({ developer, bde, finance });
}
