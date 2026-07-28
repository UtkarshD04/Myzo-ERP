import React from 'react';
import { Briefcase, CheckCircle, RefreshCcw, Send, Calendar } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function BDEDashboard({ employee, kpis = {}, payrolls = [] }) {
  const currentKPIs = kpis.sales || {
    dailyTarget: 3000,
    dailyValue: 1200,
    monthlyTarget: 80000,
    monthlyValue: 56000,
    leads: [],
    collections: 45000
  };

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const myPayslip = payrolls.find(p => p.employeeId === employee.id && p.month === currentMonthKey);
  const commissionEarned = myPayslip?.commission || 0;
  const commissionPercent = myPayslip?.commissionPercent ?? employee.commissionPercent ?? 0;

  const funnelData = [
    { stage: 'Discovery', count: 18 },
    { stage: 'Proposal', count: 12 },
    { stage: 'Negotiation', count: 7 },
    { stage: 'Closed', count: 4 }
  ];

  return (
    <div className="space-y-6">
      {/* Upper info banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Pipeline Value</span>
          <h3 className="text-2xl font-black text-slate-800 mt-1">₹3,40,000</h3>
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[9px] font-bold mt-2 bg-blue-50 text-blue-600 border border-blue-100">
            <span>7 Clients</span>
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

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Business Generated</span>
          <h3 className="text-2xl font-black text-slate-800 mt-1">₹{currentKPIs.monthlyValue.toLocaleString()}</h3>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '70%' }} />
          </div>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1.5">70% towards target goal</span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Discovery Calls</span>
          <h3 className="text-2xl font-black text-slate-800 mt-1">18 Calls</h3>
          <span className="text-[10px] text-slate-400 font-semibold block mt-2">Conversion: 22%</span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Average Close Time</span>
          <h3 className="text-2xl font-black text-slate-800 mt-1">14 Days</h3>
          <span className="text-[10px] text-emerald-500 font-bold block mt-2">⚡ 3 Days faster than Q1</span>
        </div>
      </div>

      {/* Grid of chart and schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Funnel Stage representation */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">Pipeline Funnel Stage Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }} />
                <Tooltip contentStyle={{ background: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="count" fill="#4F46E5" radius={[0, 6, 6, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic scheduler tracker */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4 flex items-center">
              <Calendar className="w-4 h-4 mr-1.5 text-indigo-500" /> Meeting Calendar
            </h3>
            <div className="space-y-3.5">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">Proposal Review - Apex Systems</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Today, 03:00 PM</p>
                </div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 font-bold text-[9px] rounded-md border border-blue-100 shrink-0">Zoom</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">Discovery Call - Zenith Ltd</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Tomorrow, 11:30 AM</p>
                </div>
                <span className="px-2 py-0.5 bg-purple-50 text-purple-600 font-bold text-[9px] rounded-md border border-purple-100 shrink-0">In-Person</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-50 pt-3.5 mt-4 text-[10px] text-slate-400 font-medium">
            💡 Commission is calculated automatically from your accepted quotations each month when payroll is generated.
          </div>
        </div>
      </div>
    </div>
  );
}
