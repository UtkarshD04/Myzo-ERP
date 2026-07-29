import React from 'react';
import { Clock, MapPin, Activity, HelpCircle, AlertTriangle, Download } from 'lucide-react';
import { exportToCsv } from '../../utils/exportCsv';

export default function AttendanceView({
  employee,
  attendanceHistory = [],
  onCheckIn,
  onCheckOut
}) {
  const myAttendance = attendanceHistory.filter(a => a.employeeId === employee.id);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = myAttendance.find(a => a.date === todayStr);
  const isCheckedIn = todayRecord && todayRecord.checkIn && !todayRecord.checkOut;
  const isCompletedToday = todayRecord && todayRecord.checkIn && todayRecord.checkOut;
  const currentLocation = todayRecord?.checkOutLocation || todayRecord?.checkInLocation;

  const visibleHistory = myAttendance;

  const handleExport = () => {
    exportToCsv(`Attendance-${employee.name}`, [
      { label: 'Date', value: 'date' },
      { label: 'Check-In', value: (r) => r.checkIn || '' },
      { label: 'Check-Out', value: (r) => r.checkOut || '' },
      { label: 'Working Hours', value: (r) => r.workingHours || 0 },
      { label: 'Overtime', value: (r) => r.overtime || 0 },
      { label: 'Location', value: (r) => r.checkInLocation?.placeName || r.checkOutLocation?.placeName || '' },
      { label: 'Status', value: 'status' }
    ], visibleHistory);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Late': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Absent': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Attendance Tracker</h2>
          <p className="text-xs text-slate-500 mt-1">Register daily check-ins and audit historical shift timings.</p>
        </div>

        {/* Live check in action */}
        <div className="flex items-center space-x-3.5">
          {todayRecord && (
            <div className="text-right hidden sm:block">
              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">
                {isCheckedIn ? 'Checked In' : 'Checked Out'} · {todayRecord.date}
              </span>
              <span className="text-xs text-slate-700 font-semibold block">
                {isCheckedIn ? todayRecord.checkIn : (todayRecord.checkOut || todayRecord.checkIn)}
              </span>
              {currentLocation?.placeName && (
                <span className="text-xs text-slate-700 font-semibold flex items-center justify-end mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 mr-1 shrink-0" />
                  {currentLocation.placeName}
                </span>
              )}
            </div>
          )}

          {isCheckedIn ? (
            <button
              onClick={onCheckOut}
              className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              Checkout Session
            </button>
          ) : isCompletedToday ? (
            <span className="px-5 py-2.5 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-xl border border-emerald-200 cursor-not-allowed">
              Attendance Completed for Today
            </span>
          ) : (
            <button
              onClick={onCheckIn}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-95 shadow-md shadow-blue-500/10"
            >
              Register Check-in
            </button>
          )}
        </div>
      </div>

      {/* Grid: Live location indicator & logs summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Historical Logs</h3>
            {visibleHistory.length > 0 && (
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-600 font-bold rounded-lg text-[11px] cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 pr-4 font-extrabold">Date</th>
                  <th className="py-3 pr-4 font-extrabold">Check-In</th>
                  <th className="py-3 pr-4 font-extrabold">Check-Out</th>
                  <th className="py-3 pr-4 font-extrabold">Working Hours</th>
                  <th className="py-3 pr-4 font-extrabold">Overtime</th>
                  <th className="py-3 pr-4 font-extrabold">Location</th>
                  <th className="py-3 font-extrabold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {visibleHistory.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                      No attendance records found.
                    </td>
                  </tr>
                )}
                {visibleHistory.slice().reverse().map((log, index) => (
                  <tr key={index} className="hover:bg-slate-50/50">
                    <td className="py-3.5 pr-4 text-slate-800 font-bold">{log.date}</td>
                    <td className="py-3.5 pr-4 text-slate-600">{log.checkIn || '--:--'}</td>
                    <td className="py-3.5 pr-4 text-slate-600">{log.checkOut || 'Active'}</td>
                    <td className="py-3.5 pr-4 text-slate-700 font-mono">{log.workingHours ? `${log.workingHours} hrs` : '--'}</td>
                    <td className="py-3.5 pr-4 text-slate-500 font-mono">{log.overtime > 0 ? `${log.overtime} hrs` : '0'}</td>
                    <td className="py-3.5 pr-4 text-slate-500">
                      {(log.checkInLocation?.placeName || log.checkOutLocation?.placeName) ? (
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 text-blue-500 mr-1 shrink-0" />
                          <span className="truncate max-w-40">{log.checkInLocation?.placeName || log.checkOutLocation?.placeName}</span>
                        </span>
                      ) : '--'}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3">Attendance Guidelines</h3>
            <div className="space-y-3.5 text-xs text-slate-500 leading-relaxed font-semibold">
              <div className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p>Standard shifts start at 09:00 AM. Access after 09:15 AM triggers a Late status tag.</p>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p>System automatically grabs GPS coordinates to geocode logs. Keep device location permissions enabled.</p>
              </div>
              <div className="flex items-start space-x-2">
                <Activity className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p>Work reports cannot be submitted on days marked Absent.</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/50 border border-amber-200/40 rounded-2xl p-4.5 text-xs text-amber-800 flex items-start space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="leading-relaxed">
              <strong>Check-out rule:</strong> Forgetting check-outs twice in a row flags the attendance logs for HR review. Ensure you check out at end of shift.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
