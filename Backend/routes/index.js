import {
  checkInEmployee,
  checkOutEmployee,
  getLateCheckoutRequests,
  submitLateCheckoutRequest,
  modifyLateCheckoutRequest
} from '../controllers/attendanceController.js';
import { loginEmployee, forgotPassword, resetPasswordWithToken } from '../controllers/authController.js';
import { getBootstrapData } from '../controllers/bootstrapController.js';
import { addCustomer, getCustomers, modifyCustomer, removeCustomer } from '../controllers/customerController.js';
import { addEmployee, getEmployees, modifyEmployee, removeEmployee } from '../controllers/employeeController.js';
import { deleteOne, markAllRead, markOneRead } from '../controllers/notificationController.js';
import { addProduct, getManageProducts, getProducts, modifyProduct, removeProduct } from '../controllers/productController.js';
import { addQuotation, getQuotations, modifyQuotation, sendQuotationFollowUp } from '../controllers/quotationController.js';
import { convertSalesOrderToInvoice, getInvoices, modifyInvoice } from '../controllers/invoiceController.js';
import { addSalesOrderFromQuotation, getSalesOrders, modifySalesOrder } from '../controllers/salesOrderController.js';
import { addReport, getReports, modifyReport } from '../controllers/reportController.js';
import { addTask, getTasks, modifyTask } from '../controllers/taskController.js';
import { getPayrolls, generatePayroll, modifyPayroll, sendPayrollToBank } from '../controllers/payrollController.js';
import { getCompanyBankSettings, updateCompanyBankSettings } from '../controllers/companyBankController.js';
import { getLeaves, requestLeave, modifyLeaveStatus } from '../controllers/leaveController.js';
import { getCandidates, addCandidate, modifyCandidate } from '../controllers/candidateController.js';
import { getOnboarding, modifyOnboarding } from '../controllers/onboardingController.js';
import { getPurchaseOrders, addPurchaseOrder, modifyPurchaseOrder } from '../controllers/purchaseOrderController.js';
import { getStockMovements } from '../controllers/stockMovementController.js';
import { getPerformanceSummary } from '../controllers/performanceController.js';
import { getExpenseClaims, addExpenseClaim, modifyExpenseClaimStatus } from '../controllers/expenseClaimController.js';
import { getAssets, addAsset, modifyAsset } from '../controllers/assetController.js';
import { getVendors, addVendor, modifyVendor } from '../controllers/vendorController.js';
import { getWebsiteUsers } from '../controllers/websiteUserController.js';
import { getProductEnquiries, modifyProductEnquiryStatus } from '../controllers/productEnquiryController.js';
import { getAfterSalesServices, modifyAfterSalesServiceStatus } from '../controllers/afterSalesServiceController.js';
import { getBecomePartners, modifyBecomePartnerStatus } from '../controllers/becomePartnerController.js';
import { getCareerApplications, modifyCareerApplicationStatus } from '../controllers/careerApplicationController.js';

export const routes = [
  // Only the login route is reachable without a valid session token — every
  // other route (including bootstrap, which returns the full company
  // dataset) requires authentication. See services/router.js.
  { method: 'POST', path: '/api/auth/login', handler: loginEmployee, public: true },
  { method: 'POST', path: '/api/auth/forgot-password', handler: forgotPassword, public: true },
  { method: 'POST', path: '/api/auth/reset-password', handler: resetPasswordWithToken, public: true },
  { method: 'GET', path: '/api/bootstrap', handler: getBootstrapData },
  { method: 'POST', path: '/api/attendance/check-in', handler: checkInEmployee },
  { method: 'POST', path: '/api/attendance/check-out', handler: checkOutEmployee },
  { method: 'GET', path: '/api/attendance/late-checkout-requests', handler: getLateCheckoutRequests },
  { method: 'POST', path: '/api/attendance/late-checkout-requests', handler: submitLateCheckoutRequest },
  { method: 'PATCH', path: '/api/attendance/late-checkout-requests/:id', handler: modifyLateCheckoutRequest },
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
  { method: 'GET', path: '/api/sales-orders', handler: getSalesOrders },
  { method: 'POST', path: '/api/sales-orders/from-quotation/:quotationId', handler: addSalesOrderFromQuotation },
  { method: 'PATCH', path: '/api/sales-orders/:id', handler: modifySalesOrder },
  { method: 'GET', path: '/api/invoices', handler: getInvoices },
  { method: 'POST', path: '/api/invoices/from-sales-order/:salesOrderId', handler: convertSalesOrderToInvoice },
  { method: 'PATCH', path: '/api/invoices/:id', handler: modifyInvoice },
  { method: 'GET', path: '/api/customers', handler: getCustomers },
  { method: 'POST', path: '/api/customers', handler: addCustomer },
  { method: 'PATCH', path: '/api/customers/:id', handler: modifyCustomer },
  { method: 'DELETE', path: '/api/customers/:id', handler: removeCustomer },
  { method: 'GET', path: '/api/payroll', handler: getPayrolls },
  { method: 'POST', path: '/api/payroll/generate', handler: generatePayroll },
  { method: 'PATCH', path: '/api/payroll/:id', handler: modifyPayroll },
  { method: 'POST', path: '/api/payroll/:month/send-to-bank', handler: sendPayrollToBank },
  { method: 'GET', path: '/api/company-bank', handler: getCompanyBankSettings },
  { method: 'PATCH', path: '/api/company-bank', handler: updateCompanyBankSettings },
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
  { method: 'GET', path: '/api/stock-movements', handler: getStockMovements },
  { method: 'GET', path: '/api/performance-summary', handler: getPerformanceSummary },
  { method: 'GET', path: '/api/expense-claims', handler: getExpenseClaims },
  { method: 'POST', path: '/api/expense-claims', handler: addExpenseClaim },
  { method: 'PATCH', path: '/api/expense-claims/:id', handler: modifyExpenseClaimStatus },
  { method: 'GET', path: '/api/assets', handler: getAssets },
  { method: 'POST', path: '/api/assets', handler: addAsset },
  { method: 'PATCH', path: '/api/assets/:id', handler: modifyAsset },
  { method: 'GET', path: '/api/vendors', handler: getVendors },
  { method: 'POST', path: '/api/vendors', handler: addVendor },
  { method: 'PATCH', path: '/api/vendors/:id', handler: modifyVendor },
  // Read-mostly views onto the public website's shared MongoDB collections
  // (see models/websiteUserModel.js and friends) — website visitor activity
  // surfaced for the sales/support team without a second app to log into.
  { method: 'GET', path: '/api/website-users', handler: getWebsiteUsers },
  { method: 'GET', path: '/api/product-enquiries', handler: getProductEnquiries },
  { method: 'PATCH', path: '/api/product-enquiries/:id', handler: modifyProductEnquiryStatus },
  { method: 'GET', path: '/api/after-sales-services', handler: getAfterSalesServices },
  { method: 'PATCH', path: '/api/after-sales-services/:id', handler: modifyAfterSalesServiceStatus },
  { method: 'GET', path: '/api/become-partners', handler: getBecomePartners },
  { method: 'PATCH', path: '/api/become-partners/:id', handler: modifyBecomePartnerStatus },
  // HR-only, unlike the routes above — see careerApplicationController.js.
  { method: 'GET', path: '/api/career-applications', handler: getCareerApplications },
  { method: 'PATCH', path: '/api/career-applications/:id', handler: modifyCareerApplicationStatus }
];

