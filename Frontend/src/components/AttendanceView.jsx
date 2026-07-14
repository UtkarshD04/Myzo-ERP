import React from 'react';
import { Clock, Calendar, UserCheck, AlertCircle } from 'lucide-react';

export default function AttendanceView({ employee, attendanceHistory, onCheckIn, onCheckOut }) {
  const today = new Date().toISOString().split('T')[0];
  const todayRecord = attendanceHistory.find(r => r.date === today);
  const isCheckedIn = todayRecord && todayRecord.checkIn && !todayRecord.checkOut;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present': return 'bg-emerald-50 text-emerald-700';
      case 'Late': return 'bg-amber-50 text-amber-700';
      case 'Absent': return 'bg-red-50 text-red-700';
      case 'Half Day': return 'bg-blue-50 text-blue-700';
      case 'On Leave': return 'bg-purple-50 text-purple-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Attendance Header Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Attendance Management</h2>
            <p className="text-xs text-slate-500 mt-1">Track your daily work hours and attendance status</p>
          </div>

          <div className="flex items-center space-x-3">
            {isCheckedIn ? (
              <button 
                onClick={onCheckOut}
                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm rounded-xl border border-red-200 transition-all active:scale-95"
              >
                Check Out
              </button>
            ) : (
              <button 
                onClick={onCheckIn}
                className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-500/10 active:scale-95"
              >
                Check In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold">Today's Status</p>
              <h3 className="text-lg font-black text-slate-800 mt-1">
                {todayRecord ? todayRecord.status : 'Not Checked In'}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold">Check In Time</p>
              <h3 className="text-lg font-black text-slate-800 mt-1 font-mono">
                {todayRecord?.checkIn || '--:--'}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-semibold">Working Hours</p>
              <h3 className="text-lg font-black text-slate-800 mt-1">
                {todayRecord?.workingHours ? `${todayRecord.workingHours}h` : '0h'}
              </h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Attendance History</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Check In</th>
                <th className="text-left py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Check Out</th>
                <th className="text-left py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Hours</th>
                <th className="text-left py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Overtime</th>
                <th className="text-left py-3 px-4 font-bold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory.slice().reverse().map((record, index) => (
                <tr key={index} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono text-slate-700">{record.date}</td>
                  <td className="py-3 px-4 text-slate-600">{record.checkIn || '--:--'}</td>
                  <td className="py-3 px-4 text-slate-600">{record.checkOut || 'Active'}</td>
                  <td className="py-3 px-4 text-slate-800 font-semibold">{record.workingHours}h</td>
                  <td className="py-3 px-4 text-slate-600">{record.overtime > 0 ? `+${record.overtime}h` : '0h'}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2.5 py-1 rounded-lg font-bold ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
