import React, { useState } from 'react';
import { Clock, MapPin, Activity, HelpCircle, AlertTriangle, Download, Check, X } from 'lucide-react';
import { exportToCsv } from '../../utils/exportCsv';

export default function AttendanceView({
  employee,
  attendanceHistory = [],
  lateCheckoutRequests = [],
  onCheckIn,
  onCheckOut,
  onReviewLateCheckoutRequest
}) {
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewComments, setReviewComments] = useState('');

  const myAttendance = attendanceHistory.filter(a => a.employeeId === employee.id);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = myAttendance.find(a => a.date === todayStr);
  const isCheckedIn = todayRecord && todayRecord.checkIn && !todayRecord.checkOut;
  const isCompletedToday = todayRecord && todayRecord.checkIn && todayRecord.checkOut;
  const currentLocation = todayRecord?.checkOutLocation || todayRecord?.checkInLocation;

  const myPendingCheckoutRequest = lateCheckoutRequests.find(
    r => r.employeeId === employee.id && r.date === todayStr && r.status === 'Pending'
  );

  const visibleHistory = myAttendance;

  // Only IT department Admins (role 'Admin' + department 'IT') can review
  // late punch-out requests — see attendanceService.reviewLateCheckoutRequest.
  const isITAdmin = employee.role === 'Admin' && (employee.department || '').trim().toLowerCase() === 'it';
  const pendingApprovals = lateCheckoutRequests
    .filter(r => r.status === 'Pending')
    .slice()
    .reverse();

  const handleReview = async (request, status) => {
    try {
      await onReviewLateCheckoutRequest(request.id, status, reviewComments);
      setReviewingId(null);
      setReviewComments('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExport = () => {
    exportToCsv(`Attendance-${employee.name}`, [
      { label: 'Date', value: 'date' },
      { label: 'Punch-In', value: (r) => r.checkIn || '' },
      { label: 'Punch-Out', value: (r) => r.checkOut || '' },
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
          <p className="text-xs text-slate-500 mt-1">Register daily punch-ins and audit historical shift timings.</p>
        </div>

        {/* Live check in action */}
        <div className="flex items-center space-x-3.5">
          {todayRecord && (
            <div className="text-right hidden sm:block">
              <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider">
                {isCheckedIn ? 'Punched In' : 'Punched Out'} · {todayRecord.date}
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

          {myPendingCheckoutRequest ? (
            <span className="px-5 py-2.5 bg-amber-50 text-amber-700 font-bold text-xs rounded-xl border border-amber-200 cursor-not-allowed">
              Awaiting IT Approval
            </span>
          ) : isCheckedIn ? (
            <button
              onClick={onCheckOut}
              className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              Punch Out
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
              Register Punch-In
            </button>
          )}
        </div>
      </div>

      {/* Pending late punch-out approvals (IT department Admins only) */}
      {isITAdmin && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Late Punch-Out Approvals</h3>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-md">
              {pendingApprovals.length}
            </span>
          </div>

          {pendingApprovals.length === 0 ? (
            <p className="text-xs text-slate-400 font-semibold py-6 text-center">No pending office employee punch-out requests.</p>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map(r => (
                <div key={r.id} className="border border-slate-100 rounded-xl p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-xs text-slate-800">{r.employeeName || r.employeeId}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Requested to punch out late on {r.date}</p>
                      {r.reason && <p className="text-[11px] text-slate-500 mt-1.5 italic">"{r.reason}"</p>}
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      {reviewingId === r.id ? (
                        <>
                          <input
                            type="text"
                            placeholder="Remarks (optional)"
                            value={reviewComments}
                            onChange={(e) => setReviewComments(e.target.value)}
                            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-800 focus:outline-none focus:border-blue-500 w-40"
                          />
                          <button
                            onClick={() => handleReview(r, 'Approved')}
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg border border-emerald-200 cursor-pointer transition-all active:scale-95"
                            title="Approve"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleReview(r, 'Rejected')}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 cursor-pointer transition-all active:scale-95"
                            title="Reject"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => { setReviewingId(null); setReviewComments(''); }}
                            className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer px-1"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setReviewingId(r.id)}
                          className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-[10px] rounded-lg border border-blue-200 cursor-pointer transition-all active:scale-95"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
                  <th className="py-3 pr-4 font-extrabold">Punch-In</th>
                  <th className="py-3 pr-4 font-extrabold">Punch-Out</th>
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
              <strong>Punch-out rule:</strong> Forgetting punch-outs twice in a row flags the attendance logs for HR review. Ensure you punch out at end of shift.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
