import React from 'react';
import { Clock } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const QUOTE_STATUS_STYLES = {
  Draft: 'bg-slate-50 text-slate-600 border-slate-100',
  Sent: 'bg-blue-50 text-blue-600 border-blue-100',
  Accepted: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Rejected: 'bg-red-50 text-red-600 border-red-100'
};

const EMPTY_BDE_KPIS = {
  totalQuotations: 0, pipelineValue: 0, businessGeneratedThisMonth: 0,
  clientsEngaged: 0, conversionRate: 0, avgCloseTimeDays: null,
  funnel: { Draft: 0, Sent: 0, Accepted: 0, Rejected: 0 },
  recentQuotations: []
};

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function BDEDashboard({ employee, kpis = {}, payrolls = [] }) {
  // Real numbers from GET /api/performance-summary (see Backend/controllers/
  // performanceController.js), scoped to this employee's own quotations —
  // never hardcoded demo figures.
  const bde = kpis.bde || EMPTY_BDE_KPIS;

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const myPayslip = payrolls.find(p => p.employeeId === employee.id && p.month === currentMonthKey);
  const commissionEarned = myPayslip?.commission || 0;
  const commissionPercent = myPayslip?.commissionPercent ?? employee.commissionPercent ?? 0;

  const funnelData = [
    { stage: 'Draft', count: bde.funnel.Draft },
    { stage: 'Sent', count: bde.funnel.Sent },
    { stage: 'Accepted', count: bde.funnel.Accepted },
    { stage: 'Rejected', count: bde.funnel.Rejected }
  ];

  return (
    <div className="space-y-6">
      {/* Upper info banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Pipeline Value</span>
          <h3 className="text-2xl font-black text-slate-800 mt-1">{money(bde.pipelineValue)}</h3>
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[9px] font-bold mt-2 bg-blue-50 text-blue-600 border border-blue-100">
            <span>{bde.clientsEngaged} Client{bde.clientsEngaged === 1 ? '' : 's'}</span>
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
          <h3 className="text-2xl font-black text-slate-800 mt-1">{money(bde.businessGeneratedThisMonth)}</h3>
          <span className="text-[10px] text-slate-400 font-semibold block mt-2">
            From {bde.funnel.Accepted} accepted deal{bde.funnel.Accepted === 1 ? '' : 's'} (all time)
          </span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Quotes</span>
          <h3 className="text-2xl font-black text-slate-800 mt-1">{bde.totalQuotations}</h3>
          <span className="text-[10px] text-slate-400 font-semibold block mt-2">Conversion: {bde.conversionRate}%</span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Average Close Time</span>
          <h3 className="text-2xl font-black text-slate-800 mt-1">
            {bde.avgCloseTimeDays !== null ? `${bde.avgCloseTimeDays} Days` : '—'}
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold block mt-2">
            {bde.avgCloseTimeDays !== null ? 'Sent to Accepted, average' : 'No closed deals yet'}
          </span>
        </div>
      </div>

      {/* Grid of chart and recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Funnel Stage representation */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">Pipeline Funnel Stage Breakdown</h3>
          {bde.totalQuotations === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400 font-semibold">
              No quotations yet.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} allowDecimals={false} />
                  <YAxis dataKey="stage" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }} />
                  <Tooltip contentStyle={{ background: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }} />
                  <Bar dataKey="count" fill="#2a78d6" radius={[0, 6, 6, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent quotations */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4 flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-indigo-500" /> Recent Quotations
            </h3>
            {bde.recentQuotations.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium py-4">No quotations raised yet.</p>
            ) : (
              <div className="space-y-3.5">
                {bde.recentQuotations.map(q => (
                  <div key={q.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{q.customerName || 'Unnamed customer'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{q.quoteDate || '—'} · {money(q.totalAmount)}</p>
                    </div>
                    <span className={`px-2 py-0.5 font-bold text-[9px] rounded-md border shrink-0 ${QUOTE_STATUS_STYLES[q.status] || QUOTE_STATUS_STYLES.Draft}`}>
                      {q.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-50 pt-3.5 mt-4 text-[10px] text-slate-400 font-medium">
            💡 Commission is calculated automatically from your accepted quotations each month when payroll is generated.
          </div>
        </div>
      </div>
    </div>
  );
}
