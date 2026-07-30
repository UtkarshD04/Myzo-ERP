import React from 'react';
import { Clock, Calendar, CheckSquare, Users, ArrowRight } from 'lucide-react';
import SalesAssociateDashboard from '../dashboards/SalesAssociateDashboard';
import SalesManagerDashboard from '../dashboards/SalesManagerDashboard';
import BDEDashboard from '../dashboards/BDEDashboard';
import HRDashboard from '../dashboards/HRDashboard';
import GeneralDashboard from '../dashboards/GeneralDashboard';

const TONE = {
  blue: { chip: 'bg-blue-50 text-blue-600', bar: 'bg-blue-600' },
  slate: { chip: 'bg-slate-100 text-slate-500', bar: 'bg-slate-400' },
  emerald: { chip: 'bg-emerald-50 text-emerald-600', bar: 'bg-emerald-500' },
};

function StatTile({ icon: Icon, label, value, meta, progress, tone = 'slate' }) {
  const t = TONE[tone] || TONE.slate;
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-36 min-w-0">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <div className={`p-1.5 rounded-lg shrink-0 ${t.chip}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <h3 className="text-xl font-black text-slate-900 tabular-nums truncate">{value}</h3>
        {typeof progress === 'number' && (
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div className={`h-1.5 rounded-full ${t.bar}`} style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
        )}
        <p className="text-[10px] text-slate-400 mt-1.5 font-medium truncate">{meta}</p>
      </div>
    </div>
  );
}

export default function DashboardView({
  employee,
  employees,
  tasks,
  holidays,
  attendanceHistory,
  allAttendance,
  quotations = [],
  payrolls = [],
  reports,
  kpis = {},
  setActiveTab,
  onCheckIn,
  onCheckOut,
}) {
  const role = employee.role?.toLowerCase() || '';
  const dept = employee.department?.toLowerCase() || '';

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

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

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
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">Sales Team Overview</h4>
            <SalesManagerDashboard employee={employee} employees={employees} quotations={quotations} payrolls={payrolls} scope="company" />
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">HR Overview</h4>
            <HRDashboard employee={employee} employees={employees} attendanceHistory={allAttendance || []} />
          </div>
        </div>
      );
    }
    if (isHR) return <HRDashboard employee={employee} employees={employees} attendanceHistory={allAttendance || []} />;
    if (isSalesManager) return <SalesManagerDashboard employee={employee} employees={employees} quotations={quotations} payrolls={payrolls} />;
    if (isBDE) return <BDEDashboard employee={employee} kpis={kpis} payrolls={payrolls} />;
    if (isSalesAssociate) return <SalesAssociateDashboard employee={employee} quotations={quotations} payrolls={payrolls} />;
    return <GeneralDashboard employee={employee} kpis={kpis} />;
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">

      {/* Command Header */}
      <div className="bg-white border border-slate-200 rounded-2xl px-6 py-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <span>{formattedDate}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0" />
            <span className="truncate">{employee.department} · {employee.post}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight truncate">
            {greeting}, {employee.name.split(' ')[0]}
          </h1>
          <p className="text-xs text-slate-500 font-medium truncate">
            {employee.designation} &nbsp;·&nbsp; Reporting to{' '}
            <span className="font-semibold text-slate-700">{employee.reportsTo?.split(' (')[0] || 'Admin'}</span>
          </p>
        </div>

        {/* Check In / Out Action */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className={`w-2 h-2 rounded-full ${isCheckedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">
              {isCheckedIn ? 'Checked In' : isCompletedToday ? 'Shift Complete' : 'Not Checked In'}
            </span>
          </div>

          {isCheckedIn ? (
            <button
              onClick={onCheckOut}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-95 whitespace-nowrap"
            >
              Check Out
            </button>
          ) : isCompletedToday ? (
            <span className="px-5 py-2.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed whitespace-nowrap">
              Completed
            </span>
          ) : (
            <button
              onClick={onCheckIn}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
            >
              Check In
            </button>
          )}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          icon={Clock}
          label="Today's Check-In"
          value={todayRecord?.checkIn || '--:--'}
          meta={`Out: ${todayRecord?.checkOut || 'Active'}`}
          tone="blue"
        />

        <StatTile
          icon={CheckSquare}
          label="Today's Tasks"
          value={`${completedToday}/${todayTasks.length}`}
          meta={`${todayPct}% complete`}
          progress={todayPct}
          tone={todayPct === 100 && todayTasks.length > 0 ? 'emerald' : 'slate'}
        />

        <StatTile
          icon={Calendar}
          label="Next Holiday"
          value={nextHoliday?.name || 'None upcoming'}
          meta={nextHoliday ? new Date(nextHoliday.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
          tone="slate"
        />

        {/* Reporting Manager (bespoke — not a numeric stat) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-36 min-w-0">
          <div className="flex items-start justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reports To</p>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500 shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {(() => {
              const mgr = employees.find(e => employee.reportsTo && e.name && e.name.includes(employee.reportsTo.split(' (')[0]));
              return mgr ? (
                <>
                  <img src={mgr.photo} alt={mgr.name} className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0" referrerPolicy="no-referrer" />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-800 truncate">{mgr.name.split(' ')[0]}</p>
                    <p className="text-[10px] text-slate-400 truncate font-medium">{mgr.designation}</p>
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
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Performance
            </span>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
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

      {/* Recent Tasks Feed */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <h4 className="font-black text-xs text-slate-700 uppercase tracking-wider">Task Queue</h4>
          <button
            onClick={() => setActiveTab('tasks')}
            className="text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center space-x-1 cursor-pointer"
          >
            <span>Full board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
          {tasks.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-10 font-medium md:col-span-2">No tasks on record yet.</p>
          )}
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
                  <span className="text-[10px] font-bold text-slate-600 tabular-nums">{t.progress}%</span>
                  <div className="w-14 bg-slate-200 rounded-full h-1.5 mt-1">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${t.progress}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
