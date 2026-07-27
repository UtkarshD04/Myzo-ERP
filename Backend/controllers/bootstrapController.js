import { Employee } from '../models/employeeModel.js';
import { Attendance } from '../models/attendanceModel.js';
import { findAllTasks } from '../models/taskModel.js';
import { findAllReports } from '../models/reportModel.js';
import { findAllNotifications } from '../models/notificationModel.js';
import { findAllProducts, findAllProductsForManagement } from '../models/productModel.js';
import { findAllQuotations } from '../models/quotationModel.js';
import { findAllInvoices } from '../models/invoiceModel.js';
import { findAllCustomers } from '../models/customerModel.js';
import { findAllPayrolls } from '../models/payrollModel.js';
import { findAllLeaves } from '../models/leaveModel.js';
import { findAllCandidates } from '../models/candidateModel.js';
import { findAllOnboarding } from '../models/onboardingModel.js';
import { findAllPurchaseOrders } from '../models/purchaseOrderModel.js';
import { findAllStockMovements } from '../models/stockMovementModel.js';
import { getHolidays } from '../services/holidayService.js';

export async function getBootstrapData(req, res) {
  const rawEmployees = await Employee.find({}, { password: 0 }).lean();

  const employees = rawEmployees.map(e => ({
    ...e,
    id: e.id || e.empId || e._id.toString(),
    officialEmail: e.officialEmail || e.email,
  }));

  const attendance = await Attendance.find({}).lean();
  const tasks = await findAllTasks();
  const reports = await findAllReports();
  const notifications = await findAllNotifications();
  const products = await findAllProducts();
  const manageProducts = await findAllProductsForManagement();
  const quotations = await findAllQuotations();
  const invoices = await findAllInvoices();
  const customers = await findAllCustomers();
  const payrolls = await findAllPayrolls();
  const leaves = await findAllLeaves();
  const candidates = await findAllCandidates();
  const onboarding = await findAllOnboarding();
  const purchaseOrders = await findAllPurchaseOrders();
  const stockMovements = await findAllStockMovements();

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
