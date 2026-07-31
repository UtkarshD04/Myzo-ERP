import React from 'react';
import {
  LayoutDashboard,
  Clock,
  CheckSquare,
  TrendingUp,
  FileText,
  Calendar,
  User,
  Settings,
  Building,
  FileSpreadsheet,
  Menu,
  ChevronLeft,
  ChevronRight,
  Package,
  Receipt,
  Wallet,
  CalendarDays,
  UserPlus,
  ClipboardCheck,
  Boxes,
  Contact,
  CreditCard,
  Laptop,
  Truck,
  Globe
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  employee
}) {
  const role = employee.role?.toLowerCase() || '';
  const dept = employee.department?.toLowerCase() || '';

  // Role-based links configuration
  const getSidebarLinks = () => {
    const base = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'attendance', label: 'Attendance Tracker', icon: Clock },
      { id: 'leaves', label: 'Leave Management', icon: CalendarDays },
      { id: 'tasks', label: 'Task Board', icon: CheckSquare },
      { id: 'quotations', label: 'Quotations', icon: FileSpreadsheet },
      { id: 'customers', label: 'Customers', icon: Contact },
      { id: 'invoices', label: 'Invoices', icon: Receipt },
      { id: 'expenses', label: 'Expense Claims', icon: CreditCard },
      { id: 'assets', label: 'Asset Tracking', icon: Laptop },
    ];

    if (dept === 'sales' || role === 'manager') {
      base.push({ id: 'targets', label: 'Target Analytics', icon: TrendingUp });
    }

    if (role === 'admin' || (role === 'manager' && dept === 'sales')) {
      base.push({ id: 'products', label: 'Products', icon: Package });
      base.push({ id: 'inventory', label: 'Inventory & Stock', icon: Boxes });
      base.push({ id: 'vendors', label: 'Vendor Directory', icon: Truck });
    }

    if (role === 'admin' || role === 'manager' || dept === 'sales') {
      base.push({ id: 'website-activity', label: 'Website Activity', icon: Globe });
    }

    base.push({ id: 'workreport', label: 'Daily Work Logs', icon: FileText });

    if (role === 'admin' || role === 'hr') {
      base.push({ id: 'employees', label: 'Employee Directory', icon: Building });
      base.push({ id: 'recruitment', label: 'Recruitment Pipeline', icon: UserPlus });
      base.push({ id: 'onboarding', label: 'Onboarding Checklists', icon: ClipboardCheck });
      base.push({ id: 'payroll', label: 'Payroll Processing', icon: Wallet });
    }

    base.push(
      { id: 'documents', label: 'Payslips & Docs', icon: FileText },
      { id: 'holidays', label: 'Holidays List', icon: Calendar },
      { id: 'profile', label: 'My Profile', icon: User },
      { id: 'settings', label: 'System Settings', icon: Settings }
    );

    return base;
  };

  const links = getSidebarLinks();

  return (
    <aside
      className={`h-screen bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between transition-all duration-300 relative z-50 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand logo & collapse trigger */}
      <div>
        <div className={`h-16 flex items-center justify-between border-b border-slate-800/80 ${collapsed ? 'px-3' : 'px-4'}`}>
          <div className="flex items-center min-w-0">
            {collapsed ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shrink-0">
                <img src="/logo.png" alt="Myzo" className="w-full h-full object-cover object-left" />
              </div>
            ) : (
              <div className="bg-white rounded-xl px-3 py-2 shadow-lg">
                <img src="/logo.png" alt="Myzo" className="h-6 w-auto" />
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white cursor-pointer transition-colors active:scale-95"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-160px)]">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;

            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`w-full flex items-center rounded-xl transition-all duration-150 py-3 px-3.5 group cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/10'
                    : 'hover:bg-slate-800/60 hover:text-slate-100 text-slate-400 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                {!collapsed && <span className="ml-3.5 text-xs tracking-wide">{link.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer User Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/20">
        <div className="flex items-center space-x-3 min-w-0">
          <img
            src={employee.photo}
            alt={employee.name}
            className="w-9 h-9 rounded-xl object-cover border border-slate-800 shrink-0"
            referrerPolicy="no-referrer"
          />
          {!collapsed && (
            <div className="min-w-0 text-left flex-1">
              <p className="font-bold text-xs text-white truncate leading-none">{employee.name}</p>
              <span className="text-[10px] font-bold text-slate-500 block mt-1 uppercase tracking-wider truncate">
                {employee.role}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
