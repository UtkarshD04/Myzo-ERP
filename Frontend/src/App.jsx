import React, { useState, useEffect } from 'react';
import { api } from './api';

// Layout Components
import LoginScreen from './components/auth/LoginScreen';
import ForgotPasswordScreen from './components/auth/ForgotPasswordScreen';
import ResetPasswordScreen from './components/auth/ResetPasswordScreen';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';

// View Components
import DashboardView from './components/views/DashboardView';
import TargetsView from './components/views/TargetsView';
import AttendanceView from './components/views/AttendanceView';
import TasksView from './components/views/TasksView';
import HolidaysView from './components/views/HolidaysView';
import WorkReportView from './components/views/WorkReportView';
import DocumentsView from './components/views/DocumentsView';
import ProfileView from './components/views/ProfileView';
import SettingsView from './components/views/SettingsView';
import EmployeeManagementView from './components/views/EmployeeManagementView';
import QuotationsView from './components/views/QuotationsView';
import CustomersView from './components/views/CustomersView';
import InvoicesView from './components/views/InvoicesView';
import ProductsManagementView from './components/views/ProductsManagementView';
import PayrollView from './components/views/PayrollView';
import LeaveManagementView from './components/views/LeaveManagementView';
import RecruitmentView from './components/views/RecruitmentView';
import OnboardingView from './components/views/OnboardingView';
import InventoryView from './components/views/InventoryView';
import ExpenseClaimsView from './components/views/ExpenseClaimsView';
import AssetTrackingView from './components/views/AssetTrackingView';
import VendorDirectoryView from './components/views/VendorDirectoryView';
import WebsiteActivityView from './components/views/WebsiteActivityView';

export default function App() {
  // ─── Persistent State ───────────────────────────────────────────────────────
  const [employee, setEmployee] = useState(() => {
    const cached = localStorage.getItem('myzo_logged_in_employee');
    return cached ? JSON.parse(cached) : null;
  });

  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [reports, setReports] = useState([]);
  const [products, setProducts] = useState([]);
  const [manageProducts, setManageProducts] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [onboarding, setOnboarding] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [expenseClaims, setExpenseClaims] = useState([]);
  const [assets, setAssets] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [websiteUsers, setWebsiteUsers] = useState([]);
  const [productEnquiries, setProductEnquiries] = useState([]);
  const [afterSalesServices, setAfterSalesServices] = useState([]);
  const [becomePartners, setBecomePartners] = useState([]);
  const [careerApplications, setCareerApplications] = useState([]);
  const [apiStatus, setApiStatus] = useState('connecting');
  const [kpis, setKpis] = useState({});

  // ─── UI State ────────────────────────────────────────────────────────────────
  // Pre-login screen switcher. Starts on 'reset' if the page was opened from
  // a forgot-password email link (?resetToken=...) — checked once on mount
  // since this app has no router to own that URL param.
  const [authScreen, setAuthScreen] = useState(() => (
    new URLSearchParams(window.location.search).get('resetToken') ? 'reset' : 'login'
  ));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ─── Apply server state ──────────────────────────────────────────────────────
  const applyServerState = (state) => {
    if (state.employees)    setEmployees(state.employees);
    if (state.tasks)        setTasks(state.tasks);
    if (state.holidays)     setHolidays(state.holidays);
    if (state.attendance)   setAttendanceHistory(state.attendance);
    if (state.reports)      setReports(state.reports);
    if (state.products)     setProducts(state.products);
    if (state.manageProducts) setManageProducts(state.manageProducts);
    if (state.quotations)   setQuotations(state.quotations);
    if (state.invoices)     setInvoices(state.invoices);
    if (state.customers)    setCustomers(state.customers);
    if (state.payrolls)     setPayrolls(state.payrolls);
    if (state.leaves)       setLeaves(state.leaves);
    if (state.candidates)   setCandidates(state.candidates);
    if (state.onboarding)   setOnboarding(state.onboarding);
    if (state.purchaseOrders) setPurchaseOrders(state.purchaseOrders);
    if (state.stockMovements) setStockMovements(state.stockMovements);
    if (state.expenseClaims) setExpenseClaims(state.expenseClaims);
    if (state.assets)        setAssets(state.assets);
    if (state.vendors)       setVendors(state.vendors);
    if (state.websiteUsers)      setWebsiteUsers(state.websiteUsers);
    if (state.productEnquiries)  setProductEnquiries(state.productEnquiries);
    if (state.afterSalesServices) setAfterSalesServices(state.afterSalesServices);
    if (state.becomePartners)    setBecomePartners(state.becomePartners);
    if (state.careerApplications) setCareerApplications(state.careerApplications);
  };

  // ─── Bootstrap from API on mount ────────────────────────────────────────────
  // Bootstrap returns the full company dataset, so it must never be called
  // before authentication — only attempt it when a session token exists.
  useEffect(() => {
    let mounted = true;
    if (!api.hasSession()) return;

    api.bootstrap()
      .then(state => {
        if (!mounted) return;
        applyServerState(state);
        setApiStatus('connected');

        const cached = localStorage.getItem('myzo_logged_in_employee');
        if (cached) {
          const current = JSON.parse(cached);
          const refreshed = state.employees?.find(e => e.id === current.id);
          if (refreshed) {
            setEmployee(refreshed);
          } else {
            // Cached employee no longer exists (e.g. data was reset) — don't keep
            // operating as a ghost identity, force back to login instead.
            setEmployee(null);
            localStorage.removeItem('myzo_logged_in_employee');
            api.logout();
          }
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setApiStatus('offline');
        // Only a rejected/expired token should force a fresh login — a plain
        // network hiccup shouldn't log an already-verified session out.
        if (err.status === 401) {
          setEmployee(null);
          localStorage.removeItem('myzo_logged_in_employee');
          api.logout();
        }
      });

    return () => { mounted = false; };
  }, []);

  // ─── Dashboard KPIs (Developer/Finance/BDE cards) ───────────────────────────
  // Refetched whenever the dashboard is opened (initial login lands here, and
  // `employee` changing on login also satisfies this) rather than only once on
  // mount, so numbers don't go stale while the user works elsewhere in the app.
  // A failure here should never block login or force a logout — it's a
  // dashboard nicety, not core app state — so it's fetched independently of
  // bootstrap and any error is swallowed.
  useEffect(() => {
    if (!employee || activeTab !== 'dashboard' || !api.hasSession()) return;
    let mounted = true;
    api.getPerformanceSummary()
      .then(summary => { if (mounted) setKpis(summary); })
      .catch(() => {});
    return () => { mounted = false; };
  }, [employee, activeTab]);

  // ─── Sync employee to localStorage ──────────────────────────────────────────
  useEffect(() => {
    if (employee) localStorage.setItem('myzo_logged_in_employee', JSON.stringify(employee));
    else          localStorage.removeItem('myzo_logged_in_employee');
  }, [employee]);

  // ─── Auth Handlers ───────────────────────────────────────────────────────────
  const handleLoginSuccess = async ({ employeeId: email, password }) => {
    // login() only returns the caller's own identity; the rest of the app's
    // data is fetched via the now-authenticated bootstrap call that follows.
    const { employee: loggedInEmployee } = await api.login(email, password);
    const state = await api.bootstrap();
    applyServerState(state);
    setEmployee(loggedInEmployee);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    api.logout();
    setEmployee(null);
    localStorage.removeItem('myzo_logged_in_employee');

    // Clear every piece of fetched company data from memory. This app runs on
    // shared/kiosk devices for GPS check-in, so leaving the last session's
    // data in state would let the next person at the device read it off the
    // login screen (e.g. the employee-directory-powered email match preview).
    setEmployees([]);
    setTasks([]);
    setHolidays([]);
    setAttendanceHistory([]);
    setReports([]);
    setProducts([]);
    setManageProducts([]);
    setQuotations([]);
    setInvoices([]);
    setCustomers([]);
    setPayrolls([]);
    setLeaves([]);
    setCandidates([]);
    setOnboarding([]);
    setPurchaseOrders([]);
    setStockMovements([]);
    setExpenseClaims([]);
    setAssets([]);
    setVendors([]);
    setWebsiteUsers([]);
    setProductEnquiries([]);
    setAfterSalesServices([]);
    setBecomePartners([]);
    setCareerApplications([]);
    setKpis({});
    setApiStatus('connecting');
    setActiveTab('dashboard');
  };

  // ─── Geo-location Helper ─────────────────────────────────────────────────────
  const getLocation = () => new Promise(resolve => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' }, signal: controller.signal }
          );
          clearTimeout(timeoutId);
          const data = await res.json();
          const a = data.address || {};
          const placeName = [
            a.road || a.neighbourhood || a.suburb,
            a.city || a.town || a.village || a.county,
            a.state
          ].filter(Boolean).join(', ');
          resolve({ lat, lng, placeName: placeName || data.display_name || `${lat}, ${lng}` });
        } catch {
          // Reverse-geocoding can hang or fail (rate limits, blocked network) —
          // never let that stall check-in/check-out; fall back to raw coordinates.
          resolve({ lat, lng, placeName: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
        }
      },
      () => resolve(null),
      { timeout: 8000 }
    );
  });

  // ─── Attendance Handlers ─────────────────────────────────────────────────────
  const handleCheckIn = async () => {
    try {
      const location = await getLocation();
      const state = await api.checkIn(employee.id, location);
      applyServerState(state);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCheckOut = async () => {
    try {
      const location = await getLocation();
      const state = await api.checkOut(employee.id, location);
      applyServerState(state);
    } catch (err) {
      alert(err.message);
    }
  };

  // ─── Employee Management Handlers ───────────────────────────────────────────
  const handleAddEmployee = async (payload) => {
    const { employee: created } = await api.addEmployee(payload);
    setEmployees(prev => [created, ...prev]);
  };

  const handleUpdateEmployee = async (id, updates) => {
    const { employee: updated } = await api.updateEmployee(id, updates);
    setEmployees(prev => prev.map(e => (e.id === id ? updated : e)));
    if (employee && employee.id === id) setEmployee(prev => ({ ...prev, ...updated }));
  };

  const handleDeleteEmployee = async (id) => {
    await api.deleteEmployee(id);
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  // ─── Quotation Handlers ─────────────────────────────────────────────────────
  // A quotation's status change nudges its linked customer's pipeline stage
  // forward on the backend, so the customer list is refetched to pick that up.
  const refreshCustomers = async () => {
    const { customers: updated } = await api.getCustomers();
    setCustomers(updated);
  };

  const handleAddQuotation = async (payload) => {
    const response = await api.addQuotation(payload);
    setQuotations(response.quotations);
    refreshCustomers();
    return response;
  };

  const handleUpdateQuotation = async (id, updates) => {
    const { quotations: updated } = await api.updateQuotation(id, updates);
    setQuotations(updated);
    if (updates.status) refreshCustomers();
  };

  const handleSendQuotationFollowUp = async (id) => {
    const response = await api.sendQuotationFollowUp(id);
    setQuotations(response.quotations);
    return response;
  };

  // ─── Invoice Handlers ────────────────────────────────────────────────────────
  const handleConvertQuotationToInvoice = async (quotationId) => {
    const response = await api.convertQuotationToInvoice(quotationId);
    setInvoices(response.invoices);
    setQuotations(response.quotations);
    if (response.products) setProducts(response.products);
    if (response.manageProducts) setManageProducts(response.manageProducts);
    return response.invoice;
  };

  const handleUpdateInvoice = async (id, updates) => {
    const { invoices: updated } = await api.updateInvoice(id, updates);
    setInvoices(updated);
  };

  // ─── Customer Handlers ───────────────────────────────────────────────────────
  const handleAddCustomer = async (payload) => {
    const { customers: updated } = await api.addCustomer(payload);
    setCustomers(updated);
    return updated;
  };

  const handleSetCustomerBlocked = async (id, isBlocked) => {
    const { customers: updated } = await api.setCustomerBlocked(id, isBlocked);
    setCustomers(updated);
  };

  const handleUpdateCustomer = async (id, updates) => {
    const { customers: updated } = await api.updateCustomer(id, updates);
    setCustomers(updated);
    return updated;
  };

  const handleDeleteCustomer = async (id) => {
    const { customers: updated } = await api.deleteCustomer(id);
    setCustomers(updated);
  };

  // ─── Product Handlers ───────────────────────────────────────────────────────
  const handleAddProduct = async (payload) => {
    const { products: updated } = await api.addProduct(payload);
    setManageProducts(updated);
  };

  const handleUpdateProduct = async (id, updates) => {
    const { products: updated } = await api.updateProduct(id, updates);
    setManageProducts(updated);
  };

  const handleDeleteProduct = async (id) => {
    const { products: updated } = await api.deleteProduct(id);
    setManageProducts(updated);
  };

  // ─── Payroll Handlers ────────────────────────────────────────────────────────
  const handleGeneratePayroll = async (month) => {
    const response = await api.generatePayroll(month, employee.role, employee.name);
    setPayrolls(response.payrolls);
    return response;
  };

  const handleUpdatePayroll = async (id, updates) => {
    const { payrolls: updated } = await api.updatePayroll(id, updates);
    setPayrolls(updated);
  };

  // ─── Leave Management Handlers ──────────────────────────────────────────────
  const handleRequestLeave = async (payload) => {
    const state = await api.requestLeave({ employeeId: employee.id, ...payload });
    applyServerState(state);
  };

  const handleUpdateLeaveStatus = async (id, updates) => {
    const state = await api.updateLeaveStatus(
      id,
      { ...updates, employeeId: employee.id, reviewerName: employee.name }
    );
    applyServerState(state);
  };

  // ─── Recruitment Handlers ────────────────────────────────────────────────────
  const handleAddCandidate = async (payload) => {
    const state = await api.addCandidate({ ...payload, addedBy: employee.name });
    applyServerState(state);
  };

  const handleUpdateCandidate = async (id, updates) => {
    const state = await api.updateCandidate(id, updates);
    applyServerState(state);
  };

  // ─── Onboarding Handlers ─────────────────────────────────────────────────────
  const handleUpdateOnboardingItem = async (id, itemId, done) => {
    const state = await api.updateOnboarding(id, { itemId, done, completedBy: employee.name });
    applyServerState(state);
  };

  const handleLinkOnboardingEmployee = async (id, employeeId) => {
    const state = await api.updateOnboarding(id, { employeeId });
    applyServerState(state);
  };

  // ─── Inventory Handlers ──────────────────────────────────────────────────────
  const handleAddPurchaseOrder = async (payload) => {
    const { purchaseOrders: updated } = await api.addPurchaseOrder(payload);
    setPurchaseOrders(updated);
  };

  const handleUpdatePurchaseOrder = async (id, updates) => {
    const state = await api.updatePurchaseOrder(id, updates);
    applyServerState(state);
  };

  // ─── Expense Claim Handlers ──────────────────────────────────────────────────
  const handleAddExpenseClaim = async (payload) => {
    const state = await api.addExpenseClaim(payload);
    applyServerState(state);
  };

  const handleUpdateExpenseClaimStatus = async (id, updates) => {
    const state = await api.updateExpenseClaimStatus(
      id,
      { ...updates, reviewerName: employee.name }
    );
    applyServerState(state);
  };

  // ─── Asset Tracking Handlers ─────────────────────────────────────────────────
  const handleAddAsset = async (payload) => {
    const state = await api.addAsset(payload);
    applyServerState(state);
  };

  const handleUpdateAsset = async (id, updates) => {
    const state = await api.updateAsset(id, updates);
    applyServerState(state);
  };

  // ─── Vendor Directory Handlers ───────────────────────────────────────────────
  const handleAddVendor = async (payload) => {
    const { vendors: updated } = await api.addVendor(payload);
    setVendors(updated);
  };

  const handleUpdateVendor = async (id, updates) => {
    const { vendors: updated } = await api.updateVendor(id, updates);
    setVendors(updated);
  };

  // ─── Website Activity Handlers ───────────────────────────────────────────────
  const handleUpdateProductEnquiryStatus = async (id, status) => {
    const { productEnquiries: updated } = await api.updateProductEnquiryStatus(id, status);
    setProductEnquiries(updated);
  };

  const handleUpdateAfterSalesServiceStatus = async (id, status) => {
    const { afterSalesServices: updated } = await api.updateAfterSalesServiceStatus(id, status);
    setAfterSalesServices(updated);
  };

  const handleUpdateBecomePartnerStatus = async (id, status) => {
    const { becomePartners: updated } = await api.updateBecomePartnerStatus(id, status);
    setBecomePartners(updated);
  };

  const handleUpdateCareerApplicationStatus = async (id, status) => {
    const { careerApplications: updated } = await api.updateCareerApplicationStatus(id, status);
    setCareerApplications(updated);
  };

  // ─── Auth Guard ──────────────────────────────────────────────────────────────
  if (!employee) {
    if (authScreen === 'forgot') {
      return <ForgotPasswordScreen onBackToLogin={() => setAuthScreen('login')} />;
    }
    if (authScreen === 'reset') {
      return <ResetPasswordScreen onBackToLogin={() => setAuthScreen('login')} />;
    }
    return (
      <LoginScreen
        employees={employees}
        onLoginSuccess={handleLoginSuccess}
        onForgotPassword={() => setAuthScreen('forgot')}
      />
    );
  }

  const myAttendance = attendanceHistory.filter(a => a.employeeId === employee.id);

  // ─── Main Layout ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-slate-50 font-sans antialiased text-slate-800">

      {/* Mobile Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Collapsible Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:static lg:z-auto transition-transform duration-300 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setMobileSidebarOpen(false);
          }}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          employee={employee}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Navbar */}
        <Navbar
          employee={employee}
          attendanceHistory={myAttendance}
          onLogout={handleLogout}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 pb-20 lg:pb-0">

          {activeTab === 'dashboard' && (
            <DashboardView
              employee={employee}
              employees={employees}
              tasks={tasks}
              holidays={holidays}
              attendanceHistory={myAttendance}
              allAttendance={attendanceHistory}
              quotations={quotations}
              payrolls={payrolls}
              reports={reports}
              kpis={kpis}
              setActiveTab={setActiveTab}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView
              employee={employee}
              attendanceHistory={myAttendance}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
            />
          )}

          {activeTab === 'leaves' && (
            <LeaveManagementView
              employee={employee}
              leaves={leaves}
              onRequestLeave={handleRequestLeave}
              onUpdateLeaveStatus={handleUpdateLeaveStatus}
            />
          )}

          {activeTab === 'recruitment' && (
            <RecruitmentView
              employee={employee}
              candidates={candidates}
              onAddCandidate={handleAddCandidate}
              onUpdateCandidate={handleUpdateCandidate}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'onboarding' && (
            <OnboardingView
              employee={employee}
              employees={employees}
              onboarding={onboarding}
              onUpdateOnboardingItem={handleUpdateOnboardingItem}
              onLinkEmployee={handleLinkOnboardingEmployee}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              employee={employee}
              employees={employees}
              tasks={tasks}
              setTasks={setTasks}
            />
          )}

          {activeTab === 'targets' && (
            <TargetsView
              employee={employee}
              employees={employees}
              quotations={quotations}
              payrolls={payrolls}
              kpis={kpis}
            />
          )}

          {activeTab === 'workreport' && (
            <WorkReportView
              employee={employee}
              employees={employees}
              reports={reports}
              setReports={setReports}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsView employee={employee} payrolls={payrolls} />
          )}

          {activeTab === 'holidays' && (
            <HolidaysView employee={employee} holidays={holidays} />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              employee={employee}
              employees={employees}
              onUpdatePhoto={(photo) => handleUpdateEmployee(employee.id, { photo })}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              employee={employee}
              onUpdateEmployee={handleUpdateEmployee}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeeManagementView
              employee={employee}
              employees={employees}
              attendanceHistory={attendanceHistory}
              quotations={quotations}
              payrolls={payrolls}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onUpdatePayroll={handleUpdatePayroll}
            />
          )}

          {activeTab === 'quotations' && (
            <QuotationsView
              employee={employee}
              employees={employees}
              quotations={quotations}
              products={products}
              customers={customers}
              onAddQuotation={handleAddQuotation}
              onUpdateQuotation={handleUpdateQuotation}
              onSendFollowUp={handleSendQuotationFollowUp}
              onAddCustomer={handleAddCustomer}
              onSetCustomerBlocked={handleSetCustomerBlocked}
              onDeleteCustomer={handleDeleteCustomer}
              onConvertToInvoice={handleConvertQuotationToInvoice}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView
              employee={employee}
              customers={customers}
              quotations={quotations}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onSetCustomerBlocked={handleSetCustomerBlocked}
              onDeleteCustomer={handleDeleteCustomer}
            />
          )}

          {activeTab === 'invoices' && (
            <InvoicesView
              employee={employee}
              invoices={invoices}
              onUpdateInvoice={handleUpdateInvoice}
            />
          )}

          {activeTab === 'products' && (
            <ProductsManagementView
              products={manageProducts}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              employee={employee}
              manageProducts={manageProducts}
              purchaseOrders={purchaseOrders}
              stockMovements={stockMovements}
              onAddPurchaseOrder={handleAddPurchaseOrder}
              onUpdatePurchaseOrder={handleUpdatePurchaseOrder}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpenseClaimsView
              employee={employee}
              expenseClaims={expenseClaims}
              onAddExpenseClaim={handleAddExpenseClaim}
              onUpdateExpenseClaimStatus={handleUpdateExpenseClaimStatus}
            />
          )}

          {activeTab === 'assets' && (
            <AssetTrackingView
              employee={employee}
              employees={employees}
              assets={assets}
              onAddAsset={handleAddAsset}
              onUpdateAsset={handleUpdateAsset}
            />
          )}

          {activeTab === 'vendors' && (
            <VendorDirectoryView
              employee={employee}
              vendors={vendors}
              onAddVendor={handleAddVendor}
              onUpdateVendor={handleUpdateVendor}
            />
          )}

          {activeTab === 'website-activity' && (
            <WebsiteActivityView
              employee={employee}
              productEnquiries={productEnquiries}
              afterSalesServices={afterSalesServices}
              becomePartners={becomePartners}
              websiteUsers={websiteUsers}
              careerApplications={careerApplications}
              onUpdateProductEnquiryStatus={handleUpdateProductEnquiryStatus}
              onUpdateAfterSalesServiceStatus={handleUpdateAfterSalesServiceStatus}
              onUpdateBecomePartnerStatus={handleUpdateBecomePartnerStatus}
              onUpdateCareerApplicationStatus={handleUpdateCareerApplicationStatus}
            />
          )}

          {activeTab === 'payroll' && (
            <PayrollView
              payrolls={payrolls}
              employees={employees}
              onGeneratePayroll={handleGeneratePayroll}
              onUpdatePayroll={handleUpdatePayroll}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-30 flex items-center justify-around px-2 py-2 safe-area-pb">
          {[
            { id: 'dashboard', icon: '⊞', label: 'Home' },
            { id: 'attendance', icon: '⏱', label: 'Attend' },
            { id: 'tasks', icon: '✓', label: 'Tasks' },
            { id: 'profile', icon: '👤', label: 'Profile' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center px-3 py-1 rounded-xl relative transition-all cursor-pointer ${
                activeTab === item.id ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[10px] font-semibold mt-0.5">{item.label}</span>
              {item.badge > 0 && (
                <span className="absolute top-0 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

      </div>
    </div>
  );
}
