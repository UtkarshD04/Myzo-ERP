import { Employee, sanitizeEmployeeForViewer } from '../models/employeeModel.js';
import { Attendance, filterAttendanceForViewer } from '../models/attendanceModel.js';
import { findAllTasks, filterTasksForViewer } from '../models/taskModel.js';
import { findAllReports, filterReportsForViewer } from '../models/reportModel.js';
import { findAllNotifications } from '../models/notificationModel.js';
import { findAllProducts, findAllProductsForManagement } from '../models/productModel.js';
import { findAllQuotations } from '../models/quotationModel.js';
import { findAllInvoices } from '../models/invoiceModel.js';
import { findAllCustomers } from '../models/customerModel.js';
import { findAllPayrolls, filterPayrollsForViewer } from '../models/payrollModel.js';
import { findAllLeaves, filterLeavesForViewer } from '../models/leaveModel.js';
import { findAllCandidates, filterCandidatesForViewer } from '../models/candidateModel.js';
import { findAllOnboarding, filterOnboardingForViewer } from '../models/onboardingModel.js';
import { findAllPurchaseOrders, filterPurchaseOrdersForViewer } from '../models/purchaseOrderModel.js';
import { findAllStockMovements, filterStockMovementsForViewer } from '../models/stockMovementModel.js';
import { getHolidays } from '../services/holidayService.js';

export async function getBootstrapData(req, res) {
  const rawEmployees = await Employee.find({}, { password: 0 }).lean();

  const employees = rawEmployees.map(e => sanitizeEmployeeForViewer({
    ...e,
    id: e.id || e.empId || e._id.toString(),
    officialEmail: e.officialEmail || e.email,
  }, req.user));

  const attendance = filterAttendanceForViewer(await Attendance.find({}).lean(), req.user);
  const tasks = filterTasksForViewer(await findAllTasks(), req.user);
  const reports = filterReportsForViewer(await findAllReports(), req.user, employees);
  const notifications = await findAllNotifications();
  const products = await findAllProducts();
  const manageProducts = await findAllProductsForManagement();
  const quotations = await findAllQuotations();
  const invoices = await findAllInvoices();
  const customers = await findAllCustomers();
  const payrolls = filterPayrollsForViewer(await findAllPayrolls(), req.user);
  const leaves = filterLeavesForViewer(await findAllLeaves(), req.user);
  const candidates = filterCandidatesForViewer(await findAllCandidates(), req.user);
  const onboarding = filterOnboardingForViewer(await findAllOnboarding(), req.user);
  const purchaseOrders = filterPurchaseOrdersForViewer(await findAllPurchaseOrders(), req.user);
  const stockMovements = filterStockMovementsForViewer(await findAllStockMovements(), req.user);

  // Try to get real holidays from Calendarific, fallback to an empty list
  const liveHolidays = await getHolidays(
    process.env.HOLIDAY_COUNTRY || 'IN',
    new Date().getFullYear()
  );

  res.json({
    employees,
    attendance,
    tasks,
    reports,
    notifications,
    products,
    manageProducts,
    quotations,
    invoices,
    customers,
    payrolls,
    leaves,
    candidates,
    onboarding,
    purchaseOrders,
    stockMovements,
    holidays: liveHolidays || [],
  });
}
