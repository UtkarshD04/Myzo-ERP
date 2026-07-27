import React, { useState } from 'react';
import { Target, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function SalesManagerDashboard({ employee, employees = [], quotations = [], scope = 'team' }) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetType, setTargetType] = useState('monthly');

  const isCompany = scope === 'company';

  const teamMembers = isCompany
    ? employees.filter(e => e.id !== employee.id && (e.department || '').toLowerCase() === 'sales')
    : employees.filter(e => e.reportsTo === employee.id);

  const teamIds = new Set([employee.id, ...teamMembers.map(m => m.id)]);
  const teamQuotations = isCompany ? quotations : quotations.filter(q => teamIds.has(q.salesperson));

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const inCurrentMonth = (q) => (q.createdAt || q.quoteDate || '').slice(0, 7) === currentMonthKey;

  const closedThisMonth = teamQuotations.filter(q => q.status === 'Accepted' && inCurrentMonth(q));
  const closedValue = closedThisMonth.reduce((sum, q) => sum + (q.totalAmount || 0), 0);

  const pipelineQuotations = teamQuotations.filter(q => q.status === 'Sent');
  const pipelineValue = pipelineQuotations.reduce((sum, q) => sum + (q.totalAmount || 0), 0);

  const decided = teamQuotations.filter(q => q.status === 'Accepted' || q.status === 'Rejected');
  const winRate = decided.length > 0
    ? Math.round((teamQuotations.filter(q => q.status === 'Accepted').length / decided.length) * 100)
    : 0;

  const monthWindow = [...Array(7)].map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('en-US', { month: 'short' }) };
  });

  const revenueData = monthWindow.map(({ key, label }) => {
    const inMonth = teamQuotations.filter(q => (q.createdAt || q.quoteDate || '').slice(0, 7) === key);
    return {
      month: label,
      Quoted: inMonth.reduce((s, q) => s + (q.totalAmount || 0), 0),
      Closed: inMonth.filter(q => q.status === 'Accepted').reduce((s, q) => s + (q.totalAmount || 0), 0)
    };
  });

  const leaderboard = teamMembers
    .map(m => {
      const memberQuotations = quotations.filter(q => q.salesperson === m.id);
      const accepted = memberQuotations.filter(q => q.status === 'Accepted');
      const value = accepted.reduce((s, q) => s + (q.totalAmount || 0), 0);
      return { ...m, closedValue: value, dealCount: accepted.length };
    })
    .sort((a, b) => b.closedValue - a.closedValue);

  const handleAssignTarget = (e) => {
    e.preventDefault();
    alert(`Successfully assigned ${targetType} target of ₹${parseInt(targetAmount).toLocaleString()} to employee ${selectedAgent}`);
    setShowAssignModal(false);
    setSelectedAgent('');
    setTargetAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Upper header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Sales Ops Dashboard</h2>
          <p className="text-xs text-slate-500">Live figures from submitted quotations{isCompany ? ' across the company' : ' for your direct reports'}.</p>
        </div>
        {teamMembers.length > 0 && (
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center space-x-2 shadow-md shadow-blue-500/10 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Dispatch Targets</span>
          </button>
        )}
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm min-w-0">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block truncate">Closed This Month</span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-800 mt-1 truncate">₹{closedValue.toLocaleString()}</h3>
          <span className="text-[10px] text-slate-400 font-semibold block mt-2 truncate">{closedThisMonth.length} accepted quotation{closedThisMonth.length === 1 ? '' : 's'}</span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm min-w-0">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block truncate">Active Pipeline</span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-800 mt-1 truncate">₹{pipelineValue.toLocaleString()}</h3>
          <span className="text-[10px] text-slate-400 font-semibold block mt-2 truncate">{pipelineQuotations.length} quotation{pipelineQuotations.length === 1 ? '' : 's'} sent, awaiting response</span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm min-w-0">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block truncate">{isCompany ? 'Sales Team Size' : 'Direct Report Agents'}</span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-800 mt-1 truncate">{teamMembers.length} Reps</h3>
          <span className="text-[10px] text-slate-400 font-semibold block mt-2 truncate">{teamQuotations.length} total quotations on record</span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm min-w-0">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block truncate">Win Rate</span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-800 mt-1 truncate">{winRate}%</h3>
          <span className="text-[10px] text-slate-400 font-semibold mt-2 truncate flex items-center">
            {winRate >= 50 ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 text-emerald-500 shrink-0" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 text-red-500 shrink-0" />}
            {decided.length} decided quotation{decided.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Recharts Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">Quoted vs Closed Value (Last 7 Months)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="Quoted" stroke="#6366F1" fillOpacity={0.1} fill="url(#colorSales)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="Closed" stroke="#10B981" fillOpacity={0.1} fill="url(#colorCol)" strokeWidth={2.5} />
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">Team Leaderboard</h3>
            {leaderboard.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10 font-medium">
                {isCompany ? 'No sales department employees found.' : 'No one reports to you yet.'}
              </p>
            ) : (
              <div className="space-y-4">
                {leaderboard.map((dr, index) => (
                  <div key={dr.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <img
                        src={dr.photo}
                        alt={dr.name}
                        className="w-8.5 h-8.5 rounded-xl object-cover border border-slate-100 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{dr.name}</p>
                        <p className="text-[9px] text-slate-400 font-semibold truncate">{dr.designation}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="font-bold text-slate-800">₹{dr.closedValue.toLocaleString()}</p>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        index === 0 && dr.closedValue > 0 ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-50 text-slate-600'
                      }`}>
                        {index === 0 && dr.closedValue > 0 ? `⭐ ${dr.dealCount} deals` : `${dr.dealCount} deals`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Target Dispatcher Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-2.5 text-blue-600 mb-4">
              <Target className="w-5 h-5" />
              <h3 className="font-extrabold text-sm text-slate-800">Dispatch Quota Target</h3>
            </div>
            <form onSubmit={handleAssignTarget} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Assign Agent</label>
                <select
                  required
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Agent...</option>
                  {teamMembers.map(dr => (
                    <option key={dr.id} value={dr.id}>{dr.name} ({dr.designation})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Target Amount (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="50000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Timeline Cycle</label>
                <div className="grid grid-cols-2 gap-2">
                  {['daily', 'monthly'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTargetType(t)}
                      className={`py-2 rounded-xl text-xs font-bold uppercase border transition-all ${
                        targetType === t
                          ? 'bg-blue-50 border-blue-200 text-blue-600'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2.5">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/10 cursor-pointer transition-all"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
