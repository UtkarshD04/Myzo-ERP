const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  // Bootstrap & Auth
  bootstrap: () => request('/bootstrap'),

  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
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

  // Employees
  getEmployees: () => request('/employees'),
  addEmployee: (payload) => request('/employees', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateEmployee: (id, updates, requesterRole) => request(`/employees/${id}`, {
    method: 'PATCH',
    headers: requesterRole ? { 'X-User-Role': requesterRole } : {},
    body: JSON.stringify(updates),
  }),
  deleteEmployee: (id) => request(`/employees/${id}`, { method: 'DELETE' }),

  // Notifications
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PATCH' }),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  deleteNotification: (id) => request(`/notifications/${id}`, { method: 'DELETE' }),

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
    headers: requesterRole ? { 'X-User-Role': requesterRole } : {},
    body: JSON.stringify({ month, generatedBy: requesterRole, generatedByName }),
  }),
  updatePayroll: (id, updates, requesterRole) => request(`/payroll/${id}`, {
    method: 'PATCH',
    headers: requesterRole ? { 'X-User-Role': requesterRole } : {},
    body: JSON.stringify(updates),
  }),

  // Leave Management
  getLeaves: () => request('/leaves'),
  requestLeave: (payload) => request('/leaves', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  updateLeaveStatus: (id, updates, requesterRole) => request(`/leaves/${id}`, {
    method: 'PATCH',
    headers: requesterRole ? { 'X-User-Role': requesterRole } : {},
    body: JSON.stringify(updates),
  }),

  // Recruitment (Candidates)
  getCandidates: () => request('/candidates'),
  addCandidate: (payload, requesterRole) => request('/candidates', {
    method: 'POST',
    headers: requesterRole ? { 'X-User-Role': requesterRole } : {},
    body: JSON.stringify(payload),
  }),
  updateCandidate: (id, updates, requesterRole) => request(`/candidates/${id}`, {
    method: 'PATCH',
    headers: requesterRole ? { 'X-User-Role': requesterRole } : {},
    body: JSON.stringify(updates),
  }),

  // Onboarding
  getOnboarding: () => request('/onboarding'),
  updateOnboarding: (id, updates, requesterRole) => request(`/onboarding/${id}`, {
    method: 'PATCH',
    headers: requesterRole ? { 'X-User-Role': requesterRole } : {},
    body: JSON.stringify(updates),
  }),

  // Inventory: Purchase Orders
  getPurchaseOrders: () => request('/purchase-orders'),
  addPurchaseOrder: (payload, requesterRole) => request('/purchase-orders', {
    method: 'POST',
    headers: requesterRole ? { 'X-User-Role': requesterRole } : {},
    body: JSON.stringify(payload),
  }),
  updatePurchaseOrder: (id, updates, requesterRole) => request(`/purchase-orders/${id}`, {
    method: 'PATCH',
    headers: requesterRole ? { 'X-User-Role': requesterRole } : {},
    body: JSON.stringify(updates),
  }),

  // Inventory: Stock Ledger
  getStockMovements: () => request('/stock-movements'),
};
