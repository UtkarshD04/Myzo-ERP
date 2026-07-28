import React from 'react';
import { TrendingUp, DollarSign, Target, Award, ListChecks } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function SalesAssociateDashboard({ employee, quotations = [], payrolls = [] }) {
  const myQuotations = quotations.filter(q => q.salesperson === employee.id);

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const myPayslip = payrolls.find(p => p.employeeId === employee.id && p.month === currentMonthKey);
  const commissionEarned = myPayslip?.commission || 0;
  const commissionPercent = myPayslip?.commissionPercent ?? employee.commissionPercent ?? 0;
  const inMonth = (q) => (q.createdAt || q.quoteDate || '').slice(0, 7) === currentMonthKey;
  const inToday = (q) => (q.createdAt || q.quoteDate || '').slice(0, 10) === todayStr;

  const dailyTarget = 5000;
  const dailyValue = myQuotations.filter(q => q.status === 'Accepted' && inToday(q)).reduce((s, q) => s + (q.totalAmount || 0), 0);
  const monthlyTarget = employee.salary ? employee.salary * 20 : 100000;
  const monthlyAccepted = myQuotations.filter(q => q.status === 'Accepted' && inMonth(q));
  const monthlyValue = monthlyAccepted.reduce((s, q) => s + (q.totalAmount || 0), 0);
  const collections = monthlyValue;

  const monthlyPct = Math.min(100, Math.round((monthlyValue / monthlyTarget) * 100));
  const dailyPct = Math.min(100, Math.round((dailyValue / dailyTarget) * 100));
  const collectionPct = Math.min(100, Math.round((collections / monthlyTarget) * 100));
  const remaining = Math.max(0, monthlyTarget - monthlyValue);

  const currentKPIs = { dailyTarget, dailyValue, collections, monthlyValue };

  const pendingQuotations = myQuotations.filter(q => q.status === 'Sent').map(q => ({
    name: q.customerName,
    status: q.status === 'Sent' ? 'In Negotiation' : q.status,
    value: q.totalAmount
  }));

  const chartData = [
    { name: 'Daily Target', Value: dailyTarget, color: '#3B82F6' },
    { name: 'Daily Sold', Value: dailyValue, color: '#10B981' },
    { name: 'Monthly Target (20x)', Value: monthlyTarget, color: '#6366F1' },
    { name: 'Monthly Sold', Value: monthlyValue, color: '#8B5CF6' }
  ];

  return (
    <div className="space-y-6">
      {/* 20x Monthly Target Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 border border-slate-800 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full filter blur-[100px] opacity-10" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-bold text-blue-400">
              <Target className="w-3.5 h-3.5 animate-pulse" />
              <span>Target Quota (20× Basic Salary)</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight mt-1">₹{monthlyTarget.toLocaleString()}</h2>
            <p className="text-slate-400 text-xs font-medium">
              Calculated from basic salary: ₹{employee.salary?.toLocaleString()} × 20
            </p>
          </div>
          <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-2xl px-6 py-4.5 min-w-[120px]">
            <span className="text-4xl font-black bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              {monthlyPct}%
            </span>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1.5">Achieved</span>
          </div>
        </div>

        {/* Progress details */}
        <div className="mt-6 border-t border-slate-800/80 pt-4.5">
          <div className="flex justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-2">
            <span>Sold: ₹{currentKPIs.monthlyValue.toLocaleString()}</span>
            <span>Remains: ₹{remaining.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-950/60 rounded-full h-3 border border-slate-800/60">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-500 to-indigo-500"
              style={{ width: `${monthlyPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Today's Revenue</span>
          <h3 className="text-2xl font-black text-slate-800 mt-1">₹{currentKPIs.dailyValue.toLocaleString()}</h3>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${dailyPct}%` }} />
          </div>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1.5">
            {dailyPct}% of Daily Target (₹{currentKPIs.dailyTarget.toLocaleString()})
          </span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Collections received</span>
          <h3 className="text-2xl font-black text-slate-800 mt-1">₹{currentKPIs.collections.toLocaleString()}</h3>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${collectionPct}%` }} />
          </div>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1.5">
            {collectionPct}% collections efficiency
          </span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Commission Earned</span>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">₹{commissionEarned.toLocaleString()}</h3>
          <span className="text-[10px] text-slate-400 font-semibold block mt-2">
            {commissionPercent > 0
              ? `${commissionPercent}% of this month's closed deals, via payroll`
              : 'No commission rate configured yet'}
          </span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Status Appraisal</span>
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold mt-2 bg-blue-50 text-blue-600 border border-blue-100">
              <Award className="w-3 h-3" />
              <span>Active Agent</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-medium mt-3 border-t border-slate-50 pt-2.5">
            {remaining === 0 ? '🎉 Congratulations, target met!' : `Needs ₹${remaining.toLocaleString()} to complete the monthly 20x quota.`}
          </p>
        </div>
      </div>

      {/* Target chart and active leads pipeline split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">Quota Performance Analysis</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="Value" radius={[8, 8, 0, 0]} maxBarSize={30}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">Warm Leads Pipeline</h3>
          <div className="space-y-3.5 divide-y divide-slate-50">
            {pendingQuotations.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10 font-medium">No pending quotations currently.</p>
            ) : (
              pendingQuotations.map((lead, i) => (
                <div key={i} className={`flex items-center justify-between ${i > 0 ? 'pt-3.5' : ''}`}>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-slate-800 truncate">{lead.name}</p>
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-md mt-1 border ${
                      lead.status === 'Signed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      lead.status === 'In Negotiation' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {lead.status}
                    </span>
                  </div>
                  <span className="font-extrabold text-xs text-slate-800 ml-4">
                    ₹{lead.value?.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
