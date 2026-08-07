// Relative '/api' keeps the vite dev proxy (vite.config.js) working
// unchanged; in production, set VITE_API_BASE_URL at build time to the
// backend service's public URL (e.g. https://erp-api.yourdomain.com/api) so
// the two containers don't need to share a domain.
const BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY = 'myzo_auth_token';

const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = res.status;
    Object.assign(error, data);
    throw error;
  }
  return data;
}

export const api = {
  // Bootstrap & Auth
  bootstrap: () => request('/bootstrap'),
  getPerformanceSummary: () => request('/performance-summary'),

  login: async (email, password) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return data;
  },

  logout: () => clearToken(),
  hasSession: () => Boolean(getToken()),

  forgotPassword: (email) => request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),

  resetPassword: (token, newPassword) => request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  }),

  // Attendance
  checkIn: (employeeId, location) => request('/attendance/check-in', {
    method: 'POST',
    body: JSON.stringify({ employeeId, location }),
  }),

  checkOut: (employeeId, location) => request('/attendance/check-out', {
    method: 'POST',
    body: JSON.stringify({ employeeId, location }),
  }),

  getLateCheckoutRequests: () => request('/attendance/late-checkout-requests'),
  requestLateCheckout: (employeeId, location, reason) => request('/attendance/late-checkout-requests', {
    method: 'POST',
    body: JSON.stringify({ employeeId, location, reason }),
  }),
  updateLateCheckoutRequest: (id, updates) => request(`/attendance/late-checkout-requests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),

  // Employees
  getEmployees: () => request('/employees'),
  addEmployee: (payload) => request('/employees', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateEmployee: (id, updates) => request(`/employees/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
  deleteEmployee: (id) => request(`/employees/${id}`, { method: 'DELETE' }),

  // Tasks
  getTasks: () => request('/tasks'),
  addTask: (payload) => request('/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  modifyTask: (id, updates) => request(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),

  // Reports
  getReports: () => request('/reports'),
  addReport: (payload) => request('/reports', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  modifyReport: (id, updates) => request(`/reports/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),

  // Products
  getProducts: () => request('/products'),
  getManageProducts: () => request('/products/manage'),
  addProduct: (payload) => request('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateProduct: (id, updates) => request(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Quotations
  getQuotations: () => request('/quotations'),
  addQuotation: (payload) => request('/quotations', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateQuotation: (id, updates) => request(`/quotations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
  sendQuotationFollowUp: (id) => request(`/quotations/${id}/follow-up`, {
    method: 'POST',
  }),

  // Invoices
  getInvoices: () => request('/invoices'),
  convertQuotationToInvoice: (quotationId) => request(`/invoices/from-quotation/${quotationId}`, {
    method: 'POST',
  }),
  updateInvoice: (id, updates) => request(`/invoices/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),

  // Customers
  getCustomers: () => request('/customers'),
  addCustomer: (payload) => request('/customers', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  setCustomerBlocked: (id, isBlocked) => request(`/customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ isBlocked }),
  }),
  updateCustomer: (id, updates) => request(`/customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: 'DELETE' }),

  // Payroll
  getPayrolls: () => request('/payroll'),
  generatePayroll: (month, requesterRole, generatedByName) => request('/payroll/generate', {
    method: 'POST',
    body: JSON.stringify({ month, generatedBy: requesterRole, generatedByName }),
  }),
  updatePayroll: (id, updates) => request(`/payroll/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),

  // Leave Management
  getLeaves: () => request('/leaves'),
  requestLeave: (payload) => request('/leaves', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateLeaveStatus: (id, updates) => request(`/leaves/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),

  // Recruitment (Candidates)
  getCandidates: () => request('/candidates'),
  addCandidate: (payload) => request('/candidates', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateCandidate: (id, updates) => request(`/candidates/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),

  // Onboarding
  getOnboarding: () => request('/onboarding'),
  updateOnboarding: (id, updates) => request(`/onboarding/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),

  // Inventory: Purchase Orders
  getPurchaseOrders: () => request('/purchase-orders'),
  addPurchaseOrder: (payload) => request('/purchase-orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updatePurchaseOrder: (id, updates) => request(`/purchase-orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),

  // Inventory: Stock Ledger
  getStockMovements: () => request('/stock-movements'),

  // Expense Claims
  getExpenseClaims: () => request('/expense-claims'),
  addExpenseClaim: (payload) => request('/expense-claims', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateExpenseClaimStatus: (id, updates) => request(`/expense-claims/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),

  // Asset Tracking
  getAssets: () => request('/assets'),
  addAsset: (payload) => request('/assets', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateAsset: (id, updates) => request(`/assets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),

  // Vendor Directory
  getVendors: () => request('/vendors'),
  addVendor: (payload) => request('/vendors', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateVendor: (id, updates) => request(`/vendors/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  }),

  // Website Activity (read views onto the public website's shared DB)
  getWebsiteUsers: () => request('/website-users'),
  getProductEnquiries: () => request('/product-enquiries'),
  updateProductEnquiryStatus: (id, status) => request(`/product-enquiries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  getAfterSalesServices: () => request('/after-sales-services'),
  updateAfterSalesServiceStatus: (id, status) => request(`/after-sales-services/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  getBecomePartners: () => request('/become-partners'),
  updateBecomePartnerStatus: (id, status) => request(`/become-partners/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  updateCareerApplicationStatus: (id, status) => request(`/career-applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
};
