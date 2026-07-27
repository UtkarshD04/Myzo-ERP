import React, { useState, useMemo } from 'react';
import { CalendarDays, Plus, Check, X, Ban, Info, ArrowLeft } from 'lucide-react';

const LEAVE_TYPES = ['Casual', 'Sick', 'Earned', 'Unpaid'];
const APPROVER_ROLES = ['Admin', 'HR', 'Manager'];

function countLeaveDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (end < start) return 0;
  let days = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0) days++;
  }
  return days;
}

function getStatusBadge(status) {
  switch (status) {
    case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'Rejected': return 'bg-red-50 text-red-700 border-red-100';
    case 'Cancelled': return 'bg-slate-100 text-slate-500 border-slate-200';
    default: return 'bg-amber-50 text-amber-700 border-amber-100';
  }
}

export default function LeaveManagementView({
  employee,
  leaves = [],
  onRequestLeave,
  onUpdateLeaveStatus
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [leaveType, setLeaveType] = useState('Casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewComments, setReviewComments] = useState('');
  const [error, setError] = useState('');

  const isApprover = APPROVER_ROLES.includes(employee.role);

  const myLeaves = useMemo(
    () => leaves.filter(l => l.employeeId === employee.id).slice().reverse(),
    [leaves, employee.id]
  );

  const pendingApprovals = useMemo(
    () => leaves.filter(l => l.status === 'Pending' && l.employeeId !== employee.id).slice().reverse(),
    [leaves, employee.id]
  );

  const teamHistory = useMemo(
    () => leaves.filter(l => l.status !== 'Pending' && l.employeeId !== employee.id).slice().reverse(),
    [leaves, employee.id]
  );

  const previewDays = countLeaveDays(startDate, endDate);

  const resetForm = () => {
    setLeaveType('Casual');
    setStartDate('');
    setEndDate('');
    setReason('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await onRequestLeave({ leaveType, startDate, endDate, reason });
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = async (leave) => {
    try {
      await onUpdateLeaveStatus(leave.id, { status: 'Cancelled' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReview = async (leave, status) => {
    try {
      await onUpdateLeaveStatus(leave.id, { status, reviewComments });
      setReviewingId(null);
      setReviewComments('');
    } catch (err) {
      alert(err.message);
    }
  };

  if (showAddModal) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
        <button
          onClick={() => { setShowAddModal(false); resetForm(); }}
          className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 cursor-pointer transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Leave Management</span>
        </button>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2.5">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            <span>Apply for Leave</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Leave Type</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            >
              {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {startDate && endDate && (
            <div className="flex items-center space-x-2 text-[11px] text-blue-600 font-semibold bg-blue-50/50 border border-blue-100 rounded-xl px-3 py-2">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>{previewDays} working day(s) requested (Sundays excluded).</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Reason</label>
            <textarea
              required
              rows="3"
              placeholder="Briefly describe the reason for leave..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {error && (
            <p className="text-[11px] text-red-600 font-semibold bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
          )}

          <div className="flex items-center space-x-3.5 pt-2">
            <button
              type="button"
              onClick={() => { setShowAddModal(false); resetForm(); }}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/10 cursor-pointer transition-all"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Leave Management</h2>
          <p className="text-xs text-slate-500 mt-1">Apply for leave and track approval status, separate from daily attendance.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md shadow-blue-500/10 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Pending approvals (managers / HR / admin only) */}
      {isApprover && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Pending Approvals</h3>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-md">
              {pendingApprovals.length}
            </span>
          </div>

          {pendingApprovals.length === 0 ? (
            <p className="text-xs text-slate-400 font-semibold py-6 text-center">No pending leave requests to review.</p>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map(l => (
                <div key={l.id} className="border border-slate-100 rounded-xl p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-xs text-slate-800">{l.employeeName || l.employeeId}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{l.department} · {l.designation}</p>
                      <p className="text-[10px] text-slate-500 mt-1.5">
                        <span className="font-bold text-slate-700">{l.leaveType}</span> leave · {l.startDate} to {l.endDate} · {l.days} day(s)
                      </p>
                      {l.reason && <p className="text-[11px] text-slate-500 mt-1.5 italic">"{l.reason}"</p>}
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      {reviewingId === l.id ? (
                        <>
                          <input
                            type="text"
                            placeholder="Remarks (optional)"
                            value={reviewComments}
                            onChange={(e) => setReviewComments(e.target.value)}
                            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-800 focus:outline-none focus:border-blue-500 w-40"
                          />
                          <button
                            onClick={() => handleReview(l, 'Approved')}
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg border border-emerald-200 cursor-pointer transition-all active:scale-95"
                            title="Approve"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleReview(l, 'Rejected')}
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
                          onClick={() => setReviewingId(l.id)}
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

      {/* My leave requests */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">My Leave Requests</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                <th className="py-3 pr-4 font-extrabold">Type</th>
                <th className="py-3 pr-4 font-extrabold">From</th>
                <th className="py-3 pr-4 font-extrabold">To</th>
                <th className="py-3 pr-4 font-extrabold">Days</th>
                <th className="py-3 pr-4 font-extrabold">Reason</th>
                <th className="py-3 pr-4 font-extrabold">Status</th>
                <th className="py-3 font-extrabold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {myLeaves.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-semibold">
                    No leave requests filed yet.
                  </td>
                </tr>
              )}
              {myLeaves.map(l => (
                <tr key={l.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 pr-4 text-slate-800 font-bold">{l.leaveType}</td>
                  <td className="py-3.5 pr-4 text-slate-600">{l.startDate}</td>
                  <td className="py-3.5 pr-4 text-slate-600">{l.endDate}</td>
                  <td className="py-3.5 pr-4 text-slate-700 font-mono">{l.days}</td>
                  <td className="py-3.5 pr-4 text-slate-500 max-w-48 truncate" title={l.reason}>{l.reason || '--'}</td>
                  <td className="py-3.5 pr-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(l.status)}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="py-3.5">
                    {l.status === 'Pending' && (
                      <button
                        onClick={() => handleCancel(l)}
                        className="flex items-center space-x-1 text-[10px] font-bold text-red-500 hover:text-red-600 cursor-pointer"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team leave history (approvers only) */}
      {isApprover && teamHistory.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">Team Leave History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 pr-4 font-extrabold">Employee</th>
                  <th className="py-3 pr-4 font-extrabold">Type</th>
                  <th className="py-3 pr-4 font-extrabold">From</th>
                  <th className="py-3 pr-4 font-extrabold">To</th>
                  <th className="py-3 pr-4 font-extrabold">Status</th>
                  <th className="py-3 font-extrabold">Reviewed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {teamHistory.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 pr-4 text-slate-800 font-bold">{l.employeeName || l.employeeId}</td>
                    <td className="py-3.5 pr-4 text-slate-600">{l.leaveType}</td>
                    <td className="py-3.5 pr-4 text-slate-600">{l.startDate}</td>
                    <td className="py-3.5 pr-4 text-slate-600">{l.endDate}</td>
                    <td className="py-3.5 pr-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(l.status)}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-500">{l.reviewedBy || '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
