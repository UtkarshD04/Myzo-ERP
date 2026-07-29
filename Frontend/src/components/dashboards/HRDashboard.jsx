import React, { useState } from 'react';
import { Megaphone, Check } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function HRDashboard({ employee, employees = [], attendanceHistory = [] }) {
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const checkedInToday = new Set(
    attendanceHistory.filter(a => a.date === todayStr && a.checkIn).map(a => a.employeeId)
  ).size;

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const newJoinersThisMonth = employees.filter(e => (e.joiningDate || '').slice(0, 7) === currentMonthKey).length;
  const monthName = now.toLocaleDateString('en-US', { month: 'long' });

  const activeCount = employees.filter(e => e.employmentStatus === 'Active').length;
  const activeRate = employees.length > 0 ? Math.round((activeCount / employees.length) * 100) : 0;

  const departmentCounts = employees.reduce((acc, e) => {
    const dept = e.department || 'Unassigned';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});
  const deptChartData = Object.entries(departmentCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const handleBroadcast = (e) => {
    e.preventDefault();
    setSuccess(true);
    setBroadcastTitle('');
    setBroadcastMsg('');
    setTimeout(() => setSuccess(false), 3000);
    alert(`Successfully broadcasted: "${broadcastTitle}" to all employee dashboards!`);
  };

  return (
    <div className="space-y-6">
      {/* Top HR metrics widgets */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm min-w-0">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Headcount</span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-800 mt-1 truncate">{employees.length} Staff</h3>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1.5 truncate">Across {Object.keys(departmentCounts).length} Departments</span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm min-w-0">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Checked In Today</span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-800 mt-1 truncate">{checkedInToday} Present</h3>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1.5 truncate">
            {employees.length > 0 ? Math.round((checkedInToday / employees.length) * 100) : 0}% of workforce
          </span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm min-w-0">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">New Joiners</span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-800 mt-1 leading-tight">{newJoinersThisMonth} This Month</h3>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1.5 truncate">Joined in {monthName}</span>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-sm min-w-0">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Employment Rate</span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-800 mt-1 truncate">{activeRate}%</h3>
          <span className="text-[10px] text-emerald-500 font-bold block mt-1.5 truncate">{activeCount}/{employees.length} marked active</span>
        </div>
      </div>

      {/* Department breakdown and Broadcast utility */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">Headcount by Department</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="count" fill="#2a78d6" radius={[8, 8, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4 flex items-center">
              <Megaphone className="w-4 h-4 mr-1.5 text-blue-600" /> Broadcast Company Alert
            </h3>
            <form onSubmit={handleBroadcast} className="space-y-3.5">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Alert Title (e.g. Policy update)"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/10 transition-all font-semibold"
                />
              </div>

              <div>
                <textarea
                  required
                  rows="3"
                  placeholder="Type message text here..."
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/10 transition-all font-medium resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 cursor-pointer transition-all active:scale-[0.99] flex items-center justify-center space-x-2"
              >
                {success ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Broadcast Sent!</span>
                  </>
                ) : (
                  <span>Dispatch Broadcast Alert</span>
                )}
              </button>
            </form>
          </div>

          <div className="flex items-start gap-1.5 text-[10px] text-slate-400 border-t border-slate-50 pt-3 mt-4">
            <Megaphone className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-px" />
            <span>Sent alerts immediately pop up in notifications lists of all active employee accounts.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
