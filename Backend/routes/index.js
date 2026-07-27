import { checkInEmployee, checkOutEmployee } from '../controllers/attendanceController.js';
import { loginEmployee } from '../controllers/authController.js';
import { getBootstrapData } from '../controllers/bootstrapController.js';
import { addCustomer, getCustomers, modifyCustomer, removeCustomer } from '../controllers/customerController.js';
import { addEmployee, getEmployees, modifyEmployee, removeEmployee } from '../controllers/employeeController.js';
import { deleteOne, markAllRead, markOneRead } from '../controllers/notificationController.js';
import { addProduct, getManageProducts, getProducts, modifyProduct, removeProduct } from '../controllers/productController.js';
import { addQuotation, getQuotations, modifyQuotation, sendQuotationFollowUp } from '../controllers/quotationController.js';
import { convertQuotationToInvoice, getInvoices, modifyInvoice } from '../controllers/invoiceController.js';
import { addReport, getReports, modifyReport } from '../controllers/reportController.js';
import { addTask, getTasks, modifyTask } from '../controllers/taskController.js';
import { getPayrolls, generatePayroll, modifyPayroll } from '../controllers/payrollController.js';
import { getLeaves, requestLeave, modifyLeaveStatus } from '../controllers/leaveController.js';
import { getCandidates, addCandidate, modifyCandidate } from '../controllers/candidateController.js';
import { getOnboarding, modifyOnboarding } from '../controllers/onboardingController.js';
import { getPurchaseOrders, addPurchaseOrder, modifyPurchaseOrder } from '../controllers/purchaseOrderController.js';
import { getStockMovements } from '../controllers/stockMovementController.js';

export const routes = [
  { method: 'GET', path: '/api/bootstrap', handler: getBootstrapData },
  { method: 'POST', path: '/api/auth/login', handler: loginEmployee },
  { method: 'POST', path: '/api/attendance/check-in', handler: checkInEmployee },
  { method: 'POST', path: '/api/attendance/check-out', handler: checkOutEmployee },
  { method: 'GET', path: '/api/employees', handler: getEmployees },
  { method: 'POST', path: '/api/employees', handler: addEmployee },
  { method: 'PATCH', path: '/api/employees/:id', handler: modifyEmployee },
  { method: 'DELETE', path: '/api/employees/:id', handler: removeEmployee },
  { method: 'PATCH', path: '/api/notifications/read-all', handler: markAllRead },
  { method: 'PATCH', path: '/api/notifications/:id/read', handler: markOneRead },
  { method: 'DELETE', path: '/api/notifications/:id', handler: deleteOne },
  { method: 'GET', path: '/api/tasks', handler: getTasks },
  { method: 'POST', path: '/api/tasks', handler: addTask },
  { method: 'PATCH', path: '/api/tasks/:id', handler: modifyTask },
  { method: 'GET', path: '/api/reports', handler: getReports },
  { method: 'POST', path: '/api/reports', handler: addReport },
  { method: 'PATCH', path: '/api/reports/:id', handler: modifyReport },
  { method: 'GET', path: '/api/products', handler: getProducts },
  { method: 'GET', path: '/api/products/manage', handler: getManageProducts },
  { method: 'POST', path: '/api/products', handler: addProduct },
  { method: 'PATCH', path: '/api/products/:id', handler: modifyProduct },
  { method: 'DELETE', path: '/api/products/:id', handler: removeProduct },
  { method: 'GET', path: '/api/quotations', handler: getQuotations },
  { method: 'POST', path: '/api/quotations', handler: addQuotation },
  { method: 'PATCH', path: '/api/quotations/:id', handler: modifyQuotation },
  { method: 'POST', path: '/api/quotations/:id/follow-up', handler: sendQuotationFollowUp },
  { method: 'GET', path: '/api/invoices', handler: getInvoices },
  { method: 'POST', path: '/api/invoices/from-quotation/:quotationId', handler: convertQuotationToInvoice },
  { method: 'PATCH', path: '/api/invoices/:id', handler: modifyInvoice },
  { method: 'GET', path: '/api/customers', handler: getCustomers },
  { method: 'POST', path: '/api/customers', handler: addCustomer },
  { method: 'PATCH', path: '/api/customers/:id', handler: modifyCustomer },
  { method: 'DELETE', path: '/api/customers/:id', handler: removeCustomer },
  { method: 'GET', path: '/api/payroll', handler: getPayrolls },
  { method: 'POST', path: '/api/payroll/generate', handler: generatePayroll },
  { method: 'PATCH', path: '/api/payroll/:id', handler: modifyPayroll },
  { method: 'GET', path: '/api/leaves', handler: getLeaves },
  { method: 'POST', path: '/api/leaves', handler: requestLeave },
  { method: 'PATCH', path: '/api/leaves/:id', handler: modifyLeaveStatus },
  { method: 'GET', path: '/api/candidates', handler: getCandidates },
  { method: 'POST', path: '/api/candidates', handler: addCandidate },
  { method: 'PATCH', path: '/api/candidates/:id', handler: modifyCandidate },
  { method: 'GET', path: '/api/onboarding', handler: getOnboarding },
  { method: 'PATCH', path: '/api/onboarding/:id', handler: modifyOnboarding },
  { method: 'GET', path: '/api/purchase-orders', handler: getPurchaseOrders },
  { method: 'POST', path: '/api/purchase-orders', handler: addPurchaseOrder },
  { method: 'PATCH', path: '/api/purchase-orders/:id', handler: modifyPurchaseOrder },
  { method: 'GET', path: '/api/stock-movements', handler: getStockMovements }
];

