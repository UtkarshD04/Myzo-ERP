import React from 'react';
import { Laptop, CheckSquare, Award, Clock, FileCheck2, Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const EMPTY_DEV_KPIS = {
  tasksTotal: 0, tasksCompleted: 0, tasksInProgress: 0, tasksInReview: 0, tasksToDo: 0,
  completionRate: 0, reportsThisMonth: 0, hoursLoggedThisMonth: 0,
  presentDaysThisMonth: 0, workingDaysThisMonth: 0, attendanceRateThisMonth: 0
};

const EMPTY_FIN_KPIS = {
  month: '',
  invoices: { totalCount: 0, outstandingAmount: 0, overdueCount: 0, overdueAmount: 0, paidTotalAmount: 0, paidTotalCount: 0 },
  payroll: { totalNetPayoutThisMonth: 0, totalCommissionThisMonth: 0, paidCount: 0, pendingCount: 0 },
  purchaseOrders: { openCount: 0, spendThisMonth: 0 }
};

export default function GeneralDashboard({ employee, kpis = {} }) {
  const dept = employee.department?.toLowerCase() || '';

  // Real numbers from GET /api/performance-summary (see Backend/controllers/
  // performanceController.js) — computed from this employee's own tasks,
  // work reports and attendance, never hardcoded demo figures.
  const devKPIs = kpis.developer || EMPTY_DEV_KPIS;
  const finKPIs = kpis.finance || EMPTY_FIN_KPIS;

  const taskBreakdown = [
    { name: 'Completed', value: devKPIs.tasksCompleted, color: '#059669' },
    { name: 'In Review', value: devKPIs.tasksInReview, color: '#d97706' },
    { name: 'In Progress', value: devKPIs.tasksInProgress, color: '#2563eb' },
    { name: 'To Do', value: devKPIs.tasksToDo, color: '#94a3b8' },
  ];

  const renderDeveloperDashboard = () => (
    <div className="space-y-6">
      {/* 3 cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Task Completion</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">
              {devKPIs.tasksCompleted}/{devKPIs.tasksTotal} Tasks
            </h3>
            <span className="text-[10px] text-blue-500 font-bold block mt-1.5">
              {devKPIs.completionRate}% completed
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Work</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">
              {devKPIs.tasksInProgress + devKPIs.tasksInReview} Tasks
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1.5">
              {devKPIs.tasksInProgress} in progress · {devKPIs.tasksInReview} in review
            </span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Laptop className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Attendance This Month</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{devKPIs.attendanceRateThisMonth}%</h3>
            <span className="text-[10px] text-emerald-500 font-bold block mt-1.5">
              {devKPIs.presentDaysThisMonth}/{devKPIs.workingDaysThisMonth} working days so far
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid: Pie chart and work-report summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">Task Board Breakdown</h3>
          {devKPIs.tasksTotal === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400 font-semibold">
              No tasks assigned yet.
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {taskBreakdown.map((slice) => <Cell key={slice.name} fill={slice.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-black text-slate-800">{devKPIs.completionRate}%</span>
                <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Completed</span>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">Work Reports This Month</h3>
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-xs font-bold text-slate-600">Daily logs submitted</span>
                <span className="text-sm font-black text-slate-800 tabular-nums">{devKPIs.reportsThisMonth}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-xs font-bold text-slate-600">Hours logged</span>
                <span className="text-sm font-black text-slate-800 tabular-nums">{devKPIs.hoursLoggedThisMonth}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-50 pt-3.5 mt-4 flex items-start gap-1.5 text-[10px] text-slate-400 font-medium">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-px" />
            <span>Reflects your own Task Board, Work Reports and Attendance for this month.</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinanceDashboard = () => {
    const inv = finKPIs.invoices;
    const pay = finKPIs.payroll;
    const po = finKPIs.purchaseOrders;
    const invoiceBookTotal = inv.paidTotalAmount + inv.outstandingAmount;
    const collectedShare = invoiceBookTotal > 0 ? Math.round((inv.paidTotalAmount / invoiceBookTotal) * 100) : 0;
    const overdueShare = inv.outstandingAmount > 0 ? Math.round((inv.overdueAmount / inv.outstandingAmount) * 100) : 0;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Outstanding Invoices</span>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{money(inv.outstandingAmount)}</h3>
              <span className={`text-[10px] font-bold mt-1.5 flex items-center gap-1 ${inv.overdueCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {inv.overdueCount > 0 && <AlertTriangle className="w-3 h-3" />}
                {inv.overdueCount > 0 ? `${inv.overdueCount} overdue (${money(inv.overdueAmount)})` : 'None overdue'}
              </span>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Collected (All Time)</span>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{money(inv.paidTotalAmount)}</h3>
              <span className="text-[10px] text-emerald-500 font-bold block mt-1.5">{inv.paidTotalCount} invoices paid</span>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Payroll This Month</span>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{money(pay.totalNetPayoutThisMonth)}</h3>
              <span className="text-[10px] text-slate-400 font-semibold block mt-1.5">{pay.paidCount} paid · {pay.pendingCount} pending</span>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">Invoice Book</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                  <span>Collected vs Total Billed</span>
                  <span className="text-blue-600">{collectedShare}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${collectedShare}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                  <span>Overdue Share of Outstanding</span>
                  <span className={overdueShare > 0 ? 'text-red-500' : 'text-emerald-500'}>{overdueShare}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${overdueShare > 0 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${overdueShare}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">This Month at a Glance</h3>
            <div className="p-4 bg-slate-50 rounded-xl space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Commission Payable:</span>
                <span className="font-bold text-slate-800">{money(pay.totalCommissionThisMonth)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Purchase Orders Open:</span>
                <span className="font-bold text-slate-800">{po.openCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Purchase Spend (Received):</span>
                <span className="font-bold text-slate-800">{money(po.spendThisMonth)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (dept === 'web developer') return renderDeveloperDashboard();
  if (dept === 'finance') return renderFinanceDashboard();

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-sm">
      <h3 className="text-lg font-bold text-slate-800">Workspace Dashboard</h3>
      <p className="text-xs text-slate-500 mt-1">Select sub-tabs from side menu panel to log attendance or track tasks.</p>
    </div>
  );
}
