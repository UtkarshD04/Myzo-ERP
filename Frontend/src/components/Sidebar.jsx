import React from 'react';
import {
  LayoutDashboard, User, Clock, Calendar, CheckSquare,
  Target, FileText, Bell, FolderOpen, Settings, LogOut,
  ChevronLeft, ChevronRight, Activity, Users
} from 'lucide-react';

export default function Sidebar({
  activeTab, setActiveTab, collapsed, setCollapsed,
  employee, employees = [], onLogout, unreadNotifications
}) {
  const hasSubordinates = employees.some(e => {
    if (e.id === employee.id) return false;
    if (e.reportsTo?.toLowerCase().includes(employee.name.toLowerCase())) return true;
    if (employee.directReportingEmployees?.includes(e.id) || employee.directReportingEmployees?.includes(e.name)) return true;
    if (employee.role === 'Admin' || employee.role === 'HR') return true;
    return false;
  });

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', name: 'My Profile', icon: User },
    { id: 'attendance', name: 'Attendance', icon: Clock },
    { id: 'holidays', name: 'Holidays', icon: Calendar },
    { id: 'tasks', name: 'Tasks', icon: CheckSquare },
    { id: 'targets', name: 'Targets', icon: Target },
    { id: 'workreport', name: 'Work Report', icon: FileText },
    ...(hasSubordinates ? [{ id: 'employeereport', name: 'Team Reports', icon: Users }] : []),
    { id: 'notifications', name: 'Notifications', icon: Bell, badge: unreadNotifications },
    { id: 'documents', name: 'Documents', icon: FolderOpen },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`bg-white border-r border-slate-100 flex flex-col justify-between transition-all duration-300 select-none shrink-0 ${collapsed ? 'w-16' : 'w-56'}`}>
      <div>
        {/* Logo */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-slate-100">
          <div className="flex items-center space-x-2 overflow-hidden">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            {!collapsed && <span className="font-bold text-sm text-slate-800 whitespace-nowrap">MYZO ERP</span>}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-slate-50 text-slate-400 rounded-lg hidden md:block"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="p-2 space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all group relative ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                {!collapsed && <span className="ml-3 text-sm truncate">{item.name}</span>}

                {item.badge > 0 && (
                  collapsed
                    ? <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                    : <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span>
                )}

                {collapsed && (
                  <div className="absolute left-14 scale-0 group-hover:scale-100 bg-slate-800 text-white text-xs py-1 px-2 rounded-md shadow transition-all whitespace-nowrap z-50 pointer-events-none">
                    {item.name}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-slate-100">
        {!collapsed && (
          <div className="flex items-center space-x-2 p-2 bg-slate-50 rounded-xl mb-1">
            <img src={employee.photo} alt={employee.name} className="w-8 h-8 rounded-lg object-cover border border-slate-200" referrerPolicy="no-referrer" />
            <div className="overflow-hidden">
              <p className="font-semibold text-xs text-slate-800 truncate">{employee.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{employee.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all group relative"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="ml-3 text-sm">Logout</span>}
          {collapsed && (
            <div className="absolute left-14 scale-0 group-hover:scale-100 bg-red-600 text-white text-xs py-1 px-2 rounded-md shadow transition-all whitespace-nowrap z-50 pointer-events-none">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
