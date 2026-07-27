import React from 'react';
import { Laptop, Bug, CheckSquare, Award, Clock, FileCheck2, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function GeneralDashboard({ employee, kpis = {} }) {
  const dept = employee.department?.toLowerCase() || '';

  // Setup Developer metrics
  const devKPIs = kpis.developer || {
    sprintTasksCompleted: 8,
    sprintTasksTotal: 12,
    bugsFixed: 14,
    bugsTotal: 16,
    featuresDelivered: 5,
    codeReviewStatus: 'Approved',
    deploymentProgress: 88
  };

  const devBugRatio = [
    { name: 'Resolved Bugs', value: devKPIs.bugsFixed },
    { name: 'Open Bugs', value: Math.max(0, devKPIs.bugsTotal - devKPIs.bugsFixed) }
  ];

  // Setup Finance metrics
  const finKPIs = kpis.finance || {
    invoicesProcessed: 42,
    invoicesTotal: 50,
    paymentVerifications: 18,
    monthlyClosingProgress: 75,
    budgetProgress: 65,
    financialAccuracy: 99.8
  };

  const renderDeveloperDashboard = () => (
    <div className="space-y-6">
      {/* 3 cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Sprint Velocity</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">
              {devKPIs.sprintTasksCompleted}/{devKPIs.sprintTasksTotal} Tasks
            </h3>
            <span className="text-[10px] text-blue-500 font-bold block mt-1.5">
              {Math.round((devKPIs.sprintTasksCompleted / devKPIs.sprintTasksTotal) * 100)}% delivery index
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Laptop className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Bugs Resolved</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">
              {devKPIs.bugsFixed}/{devKPIs.bugsTotal} Fixed
            </h3>
            <span className="text-[10px] text-emerald-500 font-bold block mt-1.5">
              {Math.round((devKPIs.bugsFixed / devKPIs.bugsTotal) * 100)}% bug squash rate
            </span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Bug className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Deployment pipelines</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{devKPIs.deploymentProgress}%</h3>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1.5">
              Code Review: <span className="text-[#2563EB] font-bold">{devKPIs.codeReviewStatus}</span>
            </span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid: Pie chart and pipelines progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">Sprint Bug Resolution Summary</h3>
          <div className="h-64 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={devBugRatio}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10B981" />
                  <Cell fill="#EF4444" />
                </Pie>
                <Tooltip contentStyle={{ background: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-black text-slate-800">
                {Math.round((devKPIs.bugsFixed / devKPIs.bugsTotal) * 100)}%
              </span>
              <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Resolved</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">System compilation tests</h3>
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                  <span>Production Vite compilation</span>
                  <span className="text-emerald-500 font-mono">Build Passed</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                  <span>Code Coverage threshold</span>
                  <span className="text-amber-500 font-mono">82.4% Unit tests</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '82.4%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-50 pt-3.5 mt-4 text-[10px] text-slate-400 font-medium">
            💡 Make commits to developer branch. Telemetry is gathered automatically.
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinanceDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Invoices Audited</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">
              {finKPIs.invoicesProcessed}/{finKPIs.invoicesTotal} Processed
            </h3>
            <span className="text-[10px] text-blue-500 font-bold block mt-1.5">
              {Math.round((finKPIs.invoicesProcessed / finKPIs.invoicesTotal) * 100)}% progress rate
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <FileCheck2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Verified Compliance</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{finKPIs.paymentVerifications} Audited</h3>
            <span className="text-[10px] text-emerald-500 font-bold block mt-1.5">100% verified payroll</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Financial Accuracy</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{finKPIs.financialAccuracy}%</h3>
            <span className="text-[10px] text-emerald-600 font-bold block mt-1.5">Excellent compliance status</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">Operations Target Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>Monthly Audits Schedule</span>
                <span className="text-blue-600">{finKPIs.monthlyClosingProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${finKPIs.monthlyClosingProgress}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>Operational Budget Allocation</span>
                <span className="text-emerald-500">{finKPIs.budgetProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${finKPIs.budgetProgress}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">Statutory Disbursals Status</h3>
          <div className="p-4 bg-slate-50 rounded-xl space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">TDS Filings (Q2):</span>
              <span className="font-bold text-emerald-600">Disbursed & Signed</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Provident Fund Deductions:</span>
              <span className="font-bold text-emerald-600">Settled (100%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Internal Audit Report:</span>
              <span className="font-bold text-amber-500">Under Review</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (dept === 'web developer') return renderDeveloperDashboard();
  if (dept === 'finance') return renderFinanceDashboard();

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-sm">
      <h3 className="text-lg font-bold text-slate-800">Workspace Dashboard</h3>
      <p className="text-xs text-slate-500 mt-1">Select sub-tabs from side menu panel to log attendance or track tasks.</p>
    </div>
  );
}
