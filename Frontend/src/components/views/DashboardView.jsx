import React from 'react';
import { Clock, Calendar, CheckSquare, Users, ArrowRight } from 'lucide-react';
import SalesAssociateDashboard from '../dashboards/SalesAssociateDashboard';
import SalesManagerDashboard from '../dashboards/SalesManagerDashboard';
import BDEDashboard from '../dashboards/BDEDashboard';
import HRDashboard from '../dashboards/HRDashboard';
import GeneralDashboard from '../dashboards/GeneralDashboard';

export default function DashboardView({
  employee,
  employees,
  tasks,
  holidays,
  notifications,
  attendanceHistory,
  allAttendance,
  quotations = [],
  payrolls = [],
  reports,
  setActiveTab,
  onCheckIn,
  onCheckOut,
}) {
  const role = employee.role?.toLowerCase() || '';
  const dept = employee.department?.toLowerCase() || '';
  const currentKPIs = {};

  // Today attendance check
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendanceHistory.find(a => a.date === todayStr);
  const isCheckedIn = todayRecord && todayRecord.checkIn && !todayRecord.checkOut;
  const isCompletedToday = todayRecord && todayRecord.checkIn && todayRecord.checkOut;

  const nextHoliday = holidays
    .filter(h => new Date(h.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const todayTasks = tasks.filter(t => t.type === 'Today');
  const completedToday = todayTasks.filter(t => t.status === 'Completed').length;
  const todayPct = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0;

  const unreadNotif = notifications.filter(n => !n.read).length;

  // Determine which dashboard to show based on role/designation.
  // isHR/isAdmin are authoritative (from `role`) and must win over the
  // designation-substring heuristics below — an "HR Executive" or
  // "HR Associate" designation would otherwise false-positive into the
  // sales dashboards.
  const isHR = role === 'hr';
  const isAdmin = role === 'admin';
  const isSalesManager = !isHR && !isAdmin && role === 'manager' && dept === 'sales';
  const isSalesAssociate = !isHR && !isAdmin && !isSalesManager && ((dept === 'sales' && role !== 'manager') || employee.designation?.toLowerCase().includes('associate') || employee.designation?.toLowerCase().includes('executive'));
  const isBDE = !isHR && !isAdmin && (employee.designation?.toLowerCase().includes('bde') || employee.designation?.toLowerCase().includes('business development'));

  const renderRoleDashboard = () => {
    if (isAdmin) {
      return (
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">Sales Team Overview</h4>
            <SalesManagerDashboard employee={employee} employees={employees} quotations={quotations} payrolls={payrolls} scope="company" />
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">HR Overview</h4>
            <HRDashboard employee={employee} employees={employees} attendanceHistory={allAttendance || []} />
          </div>
        </div>
      );
    }
    if (isHR) return <HRDashboard employee={employee} employees={employees} attendanceHistory={allAttendance || []} />;
    if (isSalesManager) return <SalesManagerDashboard employee={employee} employees={employees} quotations={quotations} payrolls={payrolls} />;
    if (isBDE) return <BDEDashboard employee={employee} kpis={currentKPIs} payrolls={payrolls} />;
    if (isSalesAssociate) return <SalesAssociateDashboard employee={employee} quotations={quotations} payrolls={payrolls} />;
    return <GeneralDashboard employee={employee} kpis={currentKPIs} />;
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">

      {/* Welcome Banner with Quick Actions */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-blue-600/10 text-blue-600 rounded-full border border-blue-100">
            {employee.department} · {employee.post}
          </span>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Welcome back, {employee.name.split(' ')[0]}! 👋
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {employee.designation} &nbsp;·&nbsp; Reporting to{' '}
            <span className="font-semibold text-slate-700">{employee.reportsTo?.split(' (')[0] || 'Admin'}</span>
          </p>
        </div>

        {/* Check In / Out Action */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-[9px] uppercase font-extrabold text-slate-400 block tracking-wider">Attendance</span>
            <span className={`text-xs font-bold ${isCheckedIn ? 'text-emerald-500' : 'text-amber-500'}`}>
              {isCheckedIn ? '🟢 Checked In' : '🟡 Checked Out'}
            </span>
          </div>

          {isCheckedIn ? (
            <button
              onClick={onCheckOut}
              className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 transition-all cursor-pointer active:scale-95"
            >
              Check Out
            </button>
          ) : isCompletedToday ? (
            <span className="px-5 py-2.5 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-xl border border-emerald-200 cursor-not-allowed">
              Completed
            </span>
          ) : (
            <button
              onClick={onCheckIn}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 transition-all cursor-pointer active:scale-95"
            >
              Check In Today
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today Check-in time */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-start justify-between">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Today's Check-In</p>
            <Clock className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 font-mono">{todayRecord?.checkIn || '--:--'}</h3>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">
              Out: <span className="font-semibold text-slate-600">{todayRecord?.checkOut || 'Active'}</span>
            </p>
          </div>
        </div>

        {/* Next Holiday */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-start justify-between">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Next Holiday</p>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 leading-snug">{nextHoliday?.name || 'None upcoming'}</h3>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">
              {nextHoliday ? new Date(nextHoliday.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
            </p>
          </div>
        </div>

        {/* Tasks Today */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-start justify-between">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Today's Tasks</p>
            <CheckSquare className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">{completedToday}/{todayTasks.length}</h3>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div className="bg-purple-500 h-1.5 rounded-full transition-all" style={{ width: `${todayPct}%` }} />
            </div>
          </div>
        </div>

        {/* Reporting Manager */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-36">
          <div className="flex items-start justify-between">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reports To</p>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex items-center space-x-2.5 mt-1">
            {(() => {
              const mgr = employees.find(e => employee.reportsTo && e.name && e.name.includes(employee.reportsTo.split(' (')[0]));
              return mgr ? (
                <>
                  <img src={mgr.photo} alt={mgr.name} className="w-9 h-9 rounded-xl object-cover border border-slate-100" referrerPolicy="no-referrer" />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-800 truncate">{mgr.name.split(' ')[0]}</p>
                    <p className="text-[9px] text-slate-400 truncate font-medium">{mgr.designation}</p>
                  </div>
                </>
              ) : (
                <span className="text-xs text-slate-400 font-semibold">Top of hierarchy</span>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Role-specific Dashboard Section */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5 border-b border-slate-50 pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
              Role Dashboard
            </span>
            <h3 className="text-base font-black text-slate-800 mt-2 tracking-tight">
              {isAdmin ? 'Enterprise Command Center' :
               isSalesManager ? 'Sales Operations' :
               isBDE ? 'Business Development Hub' :
               isSalesAssociate ? 'Sales Performance Board' :
               isHR ? 'Human Resources Center' :
               'Department Performance'}
            </h3>
          </div>
        </div>
        {renderRoleDashboard()}
      </div>

      {/* Bottom Row: Recent Tasks + Notifications Quick-view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Tasks Feed */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
            <h4 className="font-black text-xs text-slate-700 uppercase tracking-wider">Task Queue</h4>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center space-x-1 cursor-pointer"
            >
              <span>Full board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {tasks.slice(0, 4).map(t => {
              const prioClass = t.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' : t.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-100';
              return (
                <div key={t.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center space-x-1.5 mb-1">
                      <span className="font-mono text-[9px] font-bold text-blue-500 bg-blue-50/80 px-1.5 py-0.5 rounded border border-blue-100">{t.id}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${prioClass}`}>{t.priority}</span>
                    </div>
                    <p className="font-bold text-xs text-slate-800 truncate">{t.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate font-medium">{t.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] text-slate-400 block font-semibold">Due: {t.dueDate}</span>
                    <span className="text-[10px] font-bold text-slate-600">{t.progress}%</span>
                    <div className="w-14 bg-slate-200 rounded-full h-1.5 mt-1">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${t.progress}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Notifications */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
            <h4 className="font-black text-xs text-slate-700 uppercase tracking-wider">Alerts</h4>
            <button
              onClick={() => setActiveTab('notifications')}
              className="text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center space-x-1 cursor-pointer"
            >
              <span>All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-64">
            {notifications.slice(0, 4).map(n => (
              <div key={n.id} className={`p-3 rounded-xl border text-xs ${n.read ? 'bg-white border-slate-100' : 'bg-blue-50/20 border-blue-100'}`}>
                <p className={`font-bold leading-snug ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</p>
                <p className="text-slate-400 mt-0.5 text-[10px] line-clamp-2 font-medium">{n.message}</p>
                <span className="text-[9px] text-slate-400 block mt-1 font-semibold">{n.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
