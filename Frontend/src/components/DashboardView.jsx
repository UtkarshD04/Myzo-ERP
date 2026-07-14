import React from 'react';
import { 
  Clock, 
  Calendar, 
  CheckSquare, 
  TrendingUp, 
  Users, 
  Bell, 
  ChevronRight, 
  UserCheck, 
  AlertCircle,
  TrendingDown,
  ArrowRight,
  Code,
  Laptop,
  Bug,
  DollarSign,
  Briefcase,
  FileSpreadsheet,
  Award,
  ChevronUp,
  FileCheck2,
  Smile,
  Activity
} from 'lucide-react';
import { INITIAL_KPIS } from '../data';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  LineChart,
  Line
} from 'recharts';

export default function DashboardView({
  employee,
  employees,
  tasks,
  holidays,
  notifications,
  attendanceHistory,
  reports,
  setActiveTab,
  onCheckIn,
  onCheckOut
}) {

  // Fetch the KPIs for the current employee (or fallback)
  const currentKPIs = INITIAL_KPIS[employee.id] || {
    sales: {
      dailyTarget: 5000,
      dailyValue: 3000,
      monthlyTarget: 100000,
      monthlyValue: 70000,
      yearlyTarget: 1200000,
      yearlyValue: 900000,
      leads: [],
      collections: 50000
    }
  };

  // Standard stats calculation
  const todayTasks = tasks.filter(t => t.type === 'Today');
  const weeklyTasks = tasks.filter(t => t.type === 'Weekly');
  const monthlyTasks = tasks.filter(t => t.type === 'Monthly');
  const yearlyTasks = tasks.filter(t => t.type === 'Yearly');

  const todayCompletedTasks = todayTasks.filter(t => t.status === 'Completed').length;
  const todayProgress = todayTasks.length > 0 ? Math.round((todayCompletedTasks / todayTasks.length) * 100) : 0;

  const currentAttendance = attendanceHistory[attendanceHistory.length - 1];
  const isCheckedIn = currentAttendance && currentAttendance.date === new Date().toISOString().split('T')[0] && currentAttendance.checkIn !== null && currentAttendance.checkOut === null;

  // Next upcoming holiday
  const upcomingHolidays = holidays
    .filter(h => new Date(h.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextHoliday = upcomingHolidays[0];

  // Reporting Manager Information
  const manager = employees.find(e => e.name.includes(employee.reportsTo.split(' (')[0])) || employees.find(e => e.role === 'Admin');

  // Direct Reports (if any)
  const directReports = employees.filter(e => e.reportsTo.includes(employee.name));

  // Color constants for charts
  const BLUE_COLOR = '#2563EB';
  const GREEN_COLOR = '#22C55E';
  const AMBER_COLOR = '#F59E0B';
  const RED_COLOR = '#EF4444';

  // ----------------------------------------------------
  // DYNAMIC COMPONENT: SALES KPI VIEWS
  // ----------------------------------------------------
  const renderSalesKPIs = (kpiData) => {
    const monthlyTarget = employee.salary ? (employee.salary * 20) : kpiData.monthlyTarget;
    const targetProgressData = [
      { name: 'Daily', Progress: Math.round((kpiData.dailyValue / kpiData.dailyTarget) * 100), label: `₹${kpiData.dailyValue} / ₹${kpiData.dailyTarget}` },
      { name: 'Monthly', Progress: Math.round((kpiData.monthlyValue / monthlyTarget) * 100), label: `₹${kpiData.monthlyValue} / ₹${monthlyTarget}` },
      { name: 'Yearly', Progress: Math.round((kpiData.yearlyValue / kpiData.yearlyTarget) * 100), label: `₹${kpiData.yearlyValue} / ₹${kpiData.yearlyTarget}` },
    ];

    const pieData = [
      { name: 'Collected', value: kpiData.collections },
      { name: 'Outstanding', value: Math.max(0, monthlyTarget - kpiData.collections) },
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center">
          <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
          Role Metrics: Sales Analytics
        </h3>
        
        {employee.salary && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">📊 Salary-Based Sale Multiplier</span>
              <p className="text-slate-700 font-bold mt-0.5">Your monthly goal is to generate 20x of your salary in sales.</p>
              <p className="text-slate-400 font-medium">Salary: ₹{employee.salary.toLocaleString()} | Required Target: ₹{monthlyTarget.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-600 text-white font-extrabold px-3.5 py-2 rounded-xl text-center">
              Target Achieved: {Math.round((kpiData.monthlyValue / monthlyTarget) * 100)}%
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="erp-card p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold">Today's Sales</p>
              <h4 className="text-xl font-extrabold text-slate-800 mt-1">₹{kpiData.dailyValue.toLocaleString()}</h4>
              <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center">
                <ChevronUp className="w-3 h-3" />
                {Math.round((kpiData.dailyValue / kpiData.dailyTarget) * 100)}% of target
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="erp-card p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold">Monthly Collected</p>
              <h4 className="text-xl font-extrabold text-slate-800 mt-1">₹{kpiData.collections.toLocaleString()}</h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                Target: ₹{monthlyTarget.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>

          <div className="erp-card p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold">Yearly Forecast Status</p>
              <h4 className="text-xl font-extrabold text-slate-800 mt-1">${kpiData.yearlyValue.toLocaleString()}</h4>
              <p className="text-[10px] text-blue-600 font-bold mt-1">
                Progress: {Math.round((kpiData.yearlyValue / kpiData.yearlyTarget) * 100)}%
              </p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart target progress */}
          <div className="erp-card p-5">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-4">Target Achievement (%)</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={targetProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} domain={[0, 100]} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Progress']} contentStyle={{ background: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }} />
                  <Bar dataKey="Progress" radius={[8, 8, 0, 0]}>
                    {targetProgressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? BLUE_COLOR : index === 1 ? GREEN_COLOR : AMBER_COLOR} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leads CRM list */}
          <div className="erp-card p-5">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-4">Active Sales Pipeline</h4>
            <div className="divide-y divide-slate-100 overflow-y-auto max-h-64 pr-2">
              {kpiData.leads.map((lead, i) => {
                let statusColor = "bg-slate-100 text-slate-600";
                if (lead.status === 'Signed') statusColor = "bg-emerald-100 text-emerald-700";
                else if (lead.status === 'In Negotiation') statusColor = "bg-amber-100 text-amber-700";
                else if (lead.status === 'Proposal Sent') statusColor = "bg-blue-100 text-blue-700";

                return (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-xs text-slate-700 truncate">{lead.name}</p>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-1 inline-block ${statusColor}`}>
                        {lead.status}
                      </span>
                    </div>
                    <p className="font-extrabold text-xs text-slate-800 ml-4">${lead.value.toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // DYNAMIC COMPONENT: DEVELOPER KPI VIEWS
  // ----------------------------------------------------
  const renderDevKPIs = (kpiData) => {
    const taskRatioData = [
      { name: 'Completed', value: kpiData.sprintTasksCompleted },
      { name: 'In Progress', value: Math.max(1, kpiData.sprintTasksTotal - kpiData.sprintTasksCompleted) },
    ];

    const bugData = [
      { name: 'Resolved', value: kpiData.bugsFixed },
      { name: 'Open', value: Math.max(0, kpiData.bugsTotal - kpiData.bugsFixed) }
    ];

    return (
      <div className="space-y-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center">
          <Code className="w-4 h-4 text-blue-600 mr-2" />
          Role Metrics: Development Metrics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="erp-card p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold">Sprint Delivery</p>
              <h4 className="text-xl font-extrabold text-slate-800 mt-1">
                {kpiData.sprintTasksCompleted}/{kpiData.sprintTasksTotal} Tasks
              </h4>
              <p className="text-[10px] text-blue-600 font-bold mt-1">
                {Math.round((kpiData.sprintTasksCompleted / kpiData.sprintTasksTotal) * 100)}% delivery rate
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Laptop className="w-5 h-5" />
            </div>
          </div>

          <div className="erp-card p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold">Bugs Statistics</p>
              <h4 className="text-xl font-extrabold text-slate-800 mt-1">
                {kpiData.bugsFixed}/{kpiData.bugsTotal} Fixed
              </h4>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">
                {Math.round((kpiData.bugsFixed / kpiData.bugsTotal) * 100)}% bug squashed
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
              <Bug className="w-5 h-5" />
            </div>
          </div>

          <div className="erp-card p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold">Deployment Pipelines</p>
              <h4 className="text-xl font-extrabold text-slate-800 mt-1">{kpiData.deploymentProgress}%</h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                Code Review: <span className="font-bold text-blue-600">{kpiData.codeReviewStatus}</span>
              </p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Charts representation */}
          <div className="erp-card p-5">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-4">Sprint Bug Resolution</h4>
            <div className="h-60 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bugData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill={GREEN_COLOR} />
                    <Cell fill={RED_COLOR} />
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-lg font-extrabold text-slate-800">{Math.round((kpiData.bugsFixed / kpiData.bugsTotal)*100)}%</span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">Resolved</span>
              </div>
            </div>
          </div>

          {/* Dev pipeline indicators */}
          <div className="erp-card p-5">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-4">Development Environment Deployment Status</h4>
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                  <span>Dev-Server Pipeline (Live CI/CD)</span>
                  <span className="text-blue-600 font-mono">99.8% Availability</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-[#2563EB] h-2 rounded-full" style={{ width: '99.8%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                  <span>Production Compilation Test</span>
                  <span className="text-emerald-500 font-mono">Passed (Vite Build)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                  <span>Code Coverage threshold</span>
                  <span className="text-amber-500 font-mono">82.4% Unit Tests</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '82.4%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // DYNAMIC COMPONENT: FINANCE KPI VIEWS
  // ----------------------------------------------------
  const renderFinanceKPIs = (kpiData) => {
    return (
      <div className="space-y-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center">
          <FileSpreadsheet className="w-4 h-4 text-blue-600 mr-2" />
          Role Metrics: Finance KPIs
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="erp-card p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold">Invoice Processing</p>
              <h4 className="text-xl font-extrabold text-slate-800 mt-1">
                {kpiData.invoicesProcessed}/{kpiData.invoicesTotal} processed
              </h4>
              <p className="text-[10px] text-[#2563EB] font-bold mt-1">
                {Math.round((kpiData.invoicesProcessed / kpiData.invoicesTotal) * 100)}% processed
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>

          <div className="erp-card p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold">Payment Audits</p>
              <h4 className="text-xl font-extrabold text-slate-800 mt-1">
                {kpiData.paymentVerifications} verifications
              </h4>
              <p className="text-[10px] text-emerald-500 font-bold mt-1">
                100% verified compliance
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="erp-card p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold">Financial Accuracy</p>
              <h4 className="text-xl font-extrabold text-slate-800 mt-1">
                {kpiData.financialAccuracy}%
              </h4>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">
                Excellent performance
              </p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="erp-card p-5">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-4">Operations Progress KPI</h4>
            <div className="space-y-5 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Monthly Closing Schedule</span>
                  <span className="font-bold text-[#2563EB]">{kpiData.monthlyClosingProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-[#2563EB] h-2 rounded-full" style={{ width: `${kpiData.monthlyClosingProgress}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Operational Budget Auditing</span>
                  <span className="font-bold text-emerald-500">{kpiData.budgetProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${kpiData.budgetProgress}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="erp-card p-5">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-4">Regulatory Compliance Auditing</h4>
            <div className="p-4 bg-slate-50 rounded-xl space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-semibold">Tax Filings Q2:</span>
                <span className="font-bold text-emerald-600">Submitted</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-semibold">Payroll Distribution:</span>
                <span className="font-bold text-emerald-600">Disbursed (100%)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-semibold">External Audit Report:</span>
                <span className="font-bold text-amber-500">In Revision</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // DYNAMIC COMPONENT: HR KPI VIEWS
  // ----------------------------------------------------
  const renderHRKPIs = (kpiData) => {
    return (
      <div className="space-y-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center">
          <Briefcase className="w-4 h-4 text-blue-600 mr-2" />
          Role Metrics: Human Resources KPIs
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="erp-card p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold">Scheduled Interviews</p>
              <h4 className="text-xl font-extrabold text-slate-800 mt-1">
                {kpiData.interviewsScheduled} Candidates
              </h4>
              <p className="text-[10px] text-blue-600 font-bold mt-1">
                For technical & sales posts
              </p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="erp-card p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold">Onboarding Pipeline</p>
              <h4 className="text-xl font-extrabold text-slate-800 mt-1">
                {kpiData.onboardingCount} Employees
              </h4>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">
                Active this month
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="erp-card p-5 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold">Engagement Score</p>
              <h4 className="text-xl font-extrabold text-slate-800 mt-1">
                {kpiData.employeeEngagement}/10
              </h4>
              <p className="text-[10px] text-amber-500 font-bold mt-1 flex items-center">
                <Smile className="w-3.5 h-3.5 mr-1" /> Satisfied rating
              </p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl">
              <Smile className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="erp-card p-5">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-4">Hiring Target Progress</h4>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Target', Value: kpiData.hiringTarget },
                  { name: 'Filled', Value: kpiData.hiringValue }
                ]}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }} />
                  <Bar dataKey="Value" radius={[8, 8, 0, 0]}>
                    <Cell fill={BLUE_COLOR} />
                    <Cell fill={GREEN_COLOR} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="erp-card p-5">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-4">Recent Onboarding Actions</h4>
            <div className="space-y-3.5 pt-1.5">
              <div className="flex items-center space-x-3 text-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <p className="text-slate-600 font-semibold flex-1">Complete Pam Beesly’s onboarding handbook</p>
                <span className="text-slate-400 font-bold">Done</span>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
                <p className="text-slate-600 font-semibold flex-1">Issue corporate emails to 2 new interns</p>
                <span className="text-amber-500 font-bold">Pending</span>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                <p className="text-slate-600 font-semibold flex-1">Configure workspace orientation video</p>
                <span className="text-slate-400 font-bold">Scheduled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // TASK COMPLETION VS TARGET METRICS CALCULATIONS
  // ----------------------------------------------------
  const currentMonthStr = '2026-07';
  
  const getEmployeeMonthlyTaskStats = (empId) => {
    const empTasks = tasks.filter(t => 
      t.assignedTo === empId && 
      (empId !== employee.id || (t.assignedBy && t.assignedBy !== employee.id)) && // Only show senior assigned tasks for the current employee
      (!t.dueDate || t.dueDate.startsWith(currentMonthStr) || t.type === 'Today' || t.type === 'Weekly' || t.type === 'Monthly')
    );
    const total = empTasks.length;
    const completed = empTasks.filter(t => t.status === 'Completed').length;
    const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, completionPct };
  };

  const getTargetCompletionPct = (dept) => {
    switch (dept) {
      case 'Web Developer': return 90;
      case 'Admin': return 95;
      case 'Sales': return 85;
      case 'Finance': return 85;
      case 'HR': return 80;
      default: return 85;
    }
  };

  const hasDirectReports = directReports.length > 0;
  
  const chartData = [];

  if (hasDirectReports) {
    // Show current employee first
    const selfStats = getEmployeeMonthlyTaskStats(employee.id);
    chartData.push({
      name: `You`,
      'Actual Completion': selfStats.completionPct,
      'Target Completion': getTargetCompletionPct(employee.department),
      total: selfStats.total,
      completed: selfStats.completed
    });

    // Show each direct report
    directReports.forEach(dr => {
      const stats = getEmployeeMonthlyTaskStats(dr.id);
      chartData.push({
        name: dr.name.split(' ')[0], // Use first name for space efficiency
        'Actual Completion': stats.completionPct,
        'Target Completion': getTargetCompletionPct(dr.department),
        total: stats.total,
        completed: stats.completed
      });
    });
  } else {
    // Regular employee: Show completion vs targets broken down by Task Priority (only showing tasks assigned by a senior/manager)
    const myTasks = tasks.filter(t => 
      t.assignedTo === employee.id &&
      t.assignedBy && t.assignedBy !== employee.id &&
      (!t.dueDate || t.dueDate.startsWith(currentMonthStr) || t.type === 'Today' || t.type === 'Weekly' || t.type === 'Monthly')
    );

    const priorities = ['High', 'Medium', 'Low'];
    priorities.forEach(prio => {
      const prioTasks = myTasks.filter(t => t.priority === prio);
      const total = prioTasks.length;
      const completed = prioTasks.filter(t => t.status === 'Completed').length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      // Target for High is 100%, Medium is 85%, Low is 70%
      const target = prio === 'High' ? 100 : prio === 'Medium' ? 85 : 70;
      
      chartData.push({
        name: `${prio} Priority`,
        'Actual Completion': pct,
        'Target Completion': target,
        total,
        completed
      });
    });

    // Also add Overall
    const overallStats = getEmployeeMonthlyTaskStats(employee.id);
    chartData.push({
      name: 'Overall Avg',
      'Actual Completion': overallStats.completionPct,
      'Target Completion': getTargetCompletionPct(employee.department),
      total: overallStats.total,
      completed: overallStats.completed
    });
  }

  // Calculate insights
  const selfMonthlyStats = getEmployeeMonthlyTaskStats(employee.id);
  const teamStats = chartData.filter(d => d.name !== 'You');
  const topPerformer = teamStats.length > 0 ? [...teamStats].sort((a,b) => b['Actual Completion'] - a['Actual Completion'])[0] : null;
  
  const totalTeamTasks = teamStats.reduce((sum, d) => sum + d.total, 0);
  const completedTeamTasks = teamStats.reduce((sum, d) => sum + d.completed, 0);
  const teamVelocity = totalTeamTasks > 0 ? Math.round((completedTeamTasks / totalTeamTasks) * 100) : 0;
  const teamTargetAverage = teamStats.length > 0 ? Math.round(teamStats.reduce((sum, d) => sum + d['Target Completion'], 0) / teamStats.length) : 85;
  
  const supportRequired = teamStats.filter(d => d['Actual Completion'] < d['Target Completion']);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800">
      
      {/* Top Banner section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white rounded-2xl border border-slate-100 p-6 shadow-sm shadow-slate-100/50">
        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-[#2563EB]/10 text-[#2563EB] rounded-full">
            {employee.department} • {employee.post}
          </span>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Welcome back, {employee.name}!
          </h2>
          <p className="text-xs text-slate-500">
            Designation: <span className="font-bold text-slate-700">{employee.designation}</span>
          </p>
        </div>

        {/* Quick check in button */}
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider">Attendance Status</span>
            <span className={`text-xs font-bold ${isCheckedIn ? 'text-emerald-500' : 'text-amber-500'}`}>
              {isCheckedIn ? 'Checked In' : 'Checked Out'}
            </span>
          </div>

          {isCheckedIn ? (
            <button 
              onClick={onCheckOut}
              className="px-4.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-xl border border-red-200 transition-all active:scale-95"
            >
              Check Out
            </button>
          ) : (
            <button 
              onClick={onCheckIn}
              className="px-4.5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-blue-500/10 active:scale-95"
            >
              Check In Today
            </button>
          )}
        </div>
      </div>

      {/* Grid of standard dashboard widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Widget 1: Attendance Summary */}
        <div className="erp-card p-5 flex flex-col justify-between h-36">
          <div className="flex items-start justify-between">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Attendance Today</p>
            <Clock className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-black text-slate-800 font-mono">
              {currentAttendance?.checkIn || '--:--'}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">
              Check out: <span className="font-semibold text-slate-600">{currentAttendance?.checkOut || 'Active'}</span>
            </p>
          </div>
        </div>

        {/* Widget 2: Company Holidays */}
        <div className="erp-card p-5 flex flex-col justify-between h-36">
          <div className="flex items-start justify-between">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Next Holiday</p>
            <Calendar className="w-5 h-5 text-[#2563EB]" />
          </div>
          <div className="mt-2 min-w-0">
            <h3 className="text-sm font-extrabold text-slate-800 truncate">
              {nextHoliday?.name || 'No holidays'}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">
              {nextHoliday ? new Date(nextHoliday.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
            </p>
          </div>
        </div>

        {/* Widget 3: Today's Tasks */}
        <div className="erp-card p-5 flex flex-col justify-between h-36">
          <div className="flex items-start justify-between">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Today's Tasks</p>
            <CheckSquare className="w-5 h-5 text-purple-500" />
          </div>
          <div className="mt-2">
            <h3 className="text-lg font-black text-slate-800">
              {todayCompletedTasks}/{todayTasks.length} Completed
            </h3>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${todayProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Widget 4: Department Target */}
        <div className="erp-card p-5 flex flex-col justify-between h-36">
          <div className="flex items-start justify-between">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Manager Line</p>
            <Users className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex items-center space-x-2.5 mt-1">
            <img 
              src={manager?.photo || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop'} 
              alt={employee.reportsTo} 
              className="w-8.5 h-8.5 rounded-xl object-cover border border-slate-100"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-xs text-slate-800 truncate">{employee.reportsTo.split(' (')[0]}</h4>
              <p className="text-[10px] text-slate-400 truncate">{employee.reportsToDesignation || 'Supervisor'}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Monthly Task Completion vs Target Analytics */}
      {!(employee.department === 'Sales' && !hasDirectReports) && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-blue-50 text-[#2563EB] rounded-full">
                Analytics Suite
              </span>
              <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center">
                <TrendingUp className="w-5 h-5 text-blue-600 mr-2 shrink-0" />
                Monthly Deliverables vs Completion Targets
              </h3>
              <p className="text-xs text-slate-400">
                {hasDirectReports 
                  ? 'Consolidated team and individual task completion performance versus monthly benchmarks for July 2026.' 
                  : 'Your task completion percentage compared with established quality and velocity benchmarks by task priorities.'}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3.5 self-start md:self-center text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-md bg-blue-600"></span>
                <span className="font-bold text-slate-600">Actual Completion %</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-200"></span>
                <span className="font-bold text-slate-400">Target Benchmark %</span>
              </div>
            </div>
          </div>

          {/* Quick Legend & Readability Guide for the analytics chart */}
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-extrabold text-slate-700 block text-[10px] uppercase tracking-wider">📊 Understanding the Color Codes</span>
              <div className="flex flex-wrap gap-2 text-[10px] font-bold mt-1.5">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">🟢 Green: Met or exceeded goal</span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">🔵 Blue: Normal benchmark met</span>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md">🟡 Amber: Needs slight improvement</span>
                <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-md">🔴 Red: Below target priority</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 leading-relaxed font-medium flex items-center">
              💡 <strong>Why this chart matters:</strong> This chart syncs automatically with active task status updates from your team's Task Boards. It compares actual completed items against set company targets.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Chart Section */}
            <div className="lg:col-span-8">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#64748B' }} 
                      domain={[0, 100]} 
                      tickFormatter={(val) => `${val}%`} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, '']}
                      contentStyle={{ 
                        background: '#1E293B', 
                        borderRadius: '12px', 
                        border: 'none', 
                        color: '#fff', 
                        fontSize: '11px',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                      }} 
                    />
                    <Bar dataKey="Actual Completion" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={32}>
                      {chartData.map((entry, index) => {
                        const isSelf = entry.name === 'You' || entry.name === 'Overall Avg';
                        const isUnderTarget = entry['Actual Completion'] < entry['Target Completion'];
                        let barColor = '#2563EB'; // Normal Blue
                        if (isSelf) {
                          barColor = isUnderTarget ? '#EF4444' : '#10B981'; // Emerald if met/exceeded, Red if under
                        } else {
                          barColor = isUnderTarget ? '#F59E0B' : '#3B82F6'; // Amber if under, Blue if met
                        }
                        return <Cell key={`cell-actual-${index}`} fill={barColor} />;
                      })}
                    </Bar>
                    <Bar dataKey="Target Completion" fill="#E2E8F0" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Insights / Scorecard Panel */}
            <div className="lg:col-span-4 flex flex-col justify-between bg-slate-50/50 border border-slate-100 p-5 rounded-2xl">
              {hasDirectReports ? (
                // Manager Insights panel
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Team Performance Pulse</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">July 2026 Team Velocity Overview</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 pt-2">
                    <div className="bg-white p-3 border border-slate-100 rounded-xl">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Team Velocity</span>
                      <span className="text-lg font-black text-slate-800">{teamVelocity}%</span>
                    </div>
                    <div className="bg-white p-3 border border-slate-100 rounded-xl">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Benchmark Avg</span>
                      <span className="text-lg font-black text-[#2563EB]">{teamTargetAverage}%</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {topPerformer && (
                      <div className="flex items-center justify-between text-xs p-2.5 bg-emerald-50/50 border border-emerald-100/30 rounded-xl">
                        <span className="text-slate-500 font-semibold flex items-center">
                          <Award className="w-3.5 h-3.5 text-emerald-500 mr-1.5 shrink-0" />
                          Top Performer:
                        </span>
                        <span className="font-extrabold text-emerald-700">{topPerformer.name} ({topPerformer['Actual Completion']}%)</span>
                      </div>
                    )}

                    <div className="text-xs p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">Review Checklist</span>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Underperforming Members:</span>
                        <span className={`font-bold ${supportRequired.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {supportRequired.length} {supportRequired.length === 1 ? 'member' : 'members'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Regular Employee Scorecard
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">My Deliverables Scorecard</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">Individual Monthly Standing</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 pt-2">
                    <div className="bg-white p-3 border border-slate-100 rounded-xl">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Completed Tasks</span>
                      <span className="text-base font-black text-slate-800">{selfMonthlyStats.completed} / {selfMonthlyStats.total}</span>
                    </div>
                    <div className="bg-white p-3 border border-slate-100 rounded-xl">
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">Actual Completion</span>
                      <span className="text-lg font-black text-slate-800">{selfMonthlyStats.completionPct}%</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center justify-between text-xs p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-slate-500 font-semibold">Goal PACE:</span>
                      <span className={`font-black px-2 py-0.5 rounded-md uppercase text-[10px] ${selfMonthlyStats.completionPct >= getTargetCompletionPct(employee.department) ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {selfMonthlyStats.completionPct >= getTargetCompletionPct(employee.department) ? 'Exceeding / Met' : 'Needs Focus'}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                      {selfMonthlyStats.completionPct >= getTargetCompletionPct(employee.department)
                        ? 'Incredible job! You are currently meeting or exceeding your set quality benchmarks for this month.'
                        : 'You are slightly below your monthly goal target. Try resolving high priority deliverables to catch up.'}
                    </p>
                  </div>
                </div>
              )}

              <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-3 flex items-center justify-between mt-4">
                <span>Updated: Real-time</span>
                <span className="font-bold text-slate-600 font-mono">July 2026</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Primary Role-Based Performance Metrics Panel */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        {employee.department === 'Sales' && currentKPIs.sales && renderSalesKPIs(currentKPIs.sales)}
        {employee.department === 'Web Developer' && currentKPIs.developer && renderDevKPIs(currentKPIs.developer)}
        {employee.department === 'Finance' && currentKPIs.finance && renderFinanceKPIs(currentKPIs.finance)}
        {employee.department === 'HR' && currentKPIs.hr && renderHRKPIs(currentKPIs.hr)}
        
        {/* Admin Dashboard: Aggregates everything */}
        {employee.department === 'Admin' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center">
              <TrendingUp className="w-4 h-4 text-purple-600 mr-2" />
              Central System Executive Consolidation
            </h3>
            
            <p className="text-xs text-slate-400">
              As the Chief Operations Executive, you have read-write telemetry over all departments. Inspect compiled KPIs below:
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border border-slate-100 p-4.5 rounded-2xl bg-slate-50/20">
                <h4 className="font-bold text-xs text-slate-600 uppercase tracking-wider mb-3">Enterprise Sales funnel</h4>
                {INITIAL_KPIS.MGR201.sales && renderSalesKPIs(INITIAL_KPIS.MGR201.sales)}
              </div>
              <div className="border border-slate-100 p-4.5 rounded-2xl bg-slate-50/20">
                <h4 className="font-bold text-xs text-slate-600 uppercase tracking-wider mb-3">Engineering Delivery Pipeline</h4>
                {INITIAL_KPIS.MGR202.developer && renderDevKPIs(INITIAL_KPIS.MGR202.developer)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lower Row: Tasks Feed & Notifications, Reports list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Tasks list */}
        <div className="lg:col-span-8 erp-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Assigned Task Queue</h4>
            <button 
              onClick={() => setActiveTab('tasks')}
              className="text-[#2563EB] hover:text-blue-700 font-bold text-xs flex items-center space-x-1"
            >
              <span>Task board</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-80 pr-2">
            {tasks.slice(0, 3).map((task) => {
              let prioColor = "bg-slate-100 text-slate-600";
              if (task.priority === 'High') prioColor = "bg-red-100 text-red-600";
              else if (task.priority === 'Medium') prioColor = "bg-amber-100 text-amber-700";

              return (
                <div key={task.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[9px] font-bold text-[#2563EB] bg-blue-50 px-1.5 py-0.5 rounded">
                        {task.id}
                      </span>
                      <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md ${prioColor}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="font-bold text-xs text-slate-800 truncate mt-1">{task.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{task.description}</p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 block font-semibold">Due: {task.dueDate}</span>
                      <span className="text-[10px] font-bold text-slate-600">{task.progress}% done</span>
                    </div>
                    <div className="w-12 bg-slate-200 rounded-full h-1.5 shrink-0 hidden sm:block">
                      <div className="bg-[#2563EB] h-1.5 rounded-full" style={{ width: `${task.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Notifications or Direct Reports Panel */}
        <div className="lg:col-span-4 erp-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3">
              <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                {directReports.length > 0 ? 'Direct Reports' : 'Holidays This Month'}
              </h4>
            </div>

            {directReports.length > 0 ? (
              <div className="space-y-3.5">
                {directReports.map((dr) => (
                  <div key={dr.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center space-x-2.5">
                      <img 
                        src={dr.photo} 
                        alt={dr.name} 
                        className="w-8.5 h-8.5 rounded-xl object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-800 truncate">{dr.name}</p>
                        <p className="text-[9px] text-slate-400 truncate">{dr.designation}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold uppercase text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {dr.employmentStatus}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {holidays.filter(h => h.date.startsWith('2026-07')).map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-2 rounded-xl text-xs bg-slate-50">
                    <div>
                      <p className="font-bold text-slate-700">{h.name}</p>
                      <span className="text-[9px] text-slate-400">{h.type}</span>
                    </div>
                    <span className="font-bold text-[#2563EB] font-mono">{h.date.split('-')[2]} Jul</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-50 mt-4 text-center">
            <p className="text-[10px] text-slate-400 font-medium">
              Active Session: <span className="font-bold text-slate-700">{employee.id}</span>
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
