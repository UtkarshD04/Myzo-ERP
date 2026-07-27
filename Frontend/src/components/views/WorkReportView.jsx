import React, { useState } from 'react';
import { FileText, Send, Calendar, CheckSquare, Users, Eye, Sparkles, ArrowLeft } from 'lucide-react';
import { api } from '../../api';

export default function WorkReportView({
  employee,
  employees = [],
  reports = [],
  setReports
}) {
  const hasDirectReports = employee.role === 'Admin' || employees.some(e => e.reportsTo === employee.id);
  const [subTab, setSubTab] = useState(() => (hasDirectReports ? 'team-logs' : 'my-logs'));
  const [showDetailReport, setShowDetailReport] = useState(null);

  // Form states for creating a report
  const [tasksCompleted, setTasksCompleted] = useState('');
  const [challengesFaced, setChallengesFaced] = useState('');
  const [nextDayPlan, setNextDayPlan] = useState('');
  const [hoursSpent, setHoursSpent] = useState('');

  // Manager review states
  const [reviewComments, setReviewComments] = useState('');

  // Filter reports
  const myReports = reports.filter(r => r.employeeId === employee.id);
  const teamReports = reports.filter(r =>
    r.employeeId !== employee.id &&
    (employee.role === 'Admin' || employees.find(e => e.id === r.employeeId)?.reportsTo === employee.id)
  );

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    const payload = {
      employeeId: employee.id,
      employeeName: employee.name,
      department: employee.department,
      tasksCompleted,
      challengesFaced,
      nextDayPlan,
      hoursSpent: parseFloat(hoursSpent) || 8,
    };

    try {
      const updatedState = await api.addReport(payload);
      setReports(updatedState.reports);
      // Clear form
      setTasksCompleted('');
      setChallengesFaced('');
      setNextDayPlan('');
      setHoursSpent('');
      setSubTab('my-logs');
      alert('Daily Work Log submitted successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReviewReport = async (reportId, nextStatus) => {
    try {
      const updatedState = await api.modifyReport(reportId, {
        status: nextStatus,
        reviewComments: reviewComments.trim() || undefined
      });
      setReports(updatedState.reports);
      setShowDetailReport(null);
      setReviewComments('');
      alert(`Report marked as ${nextStatus}!`);
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusBadge = (s) => {
    if (s === 'Reviewed') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (s === 'Rejected') return 'bg-red-50 text-red-600 border-red-100';
    return 'bg-blue-50 text-blue-600 border-blue-100';
  };

  if (showDetailReport) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
        <button
          onClick={() => {
            setShowDetailReport(null);
            setReviewComments('');
          }}
          className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 cursor-pointer transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Team Submissions</span>
        </button>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm max-w-2xl">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-4.5">
            <h3 className="font-extrabold text-sm text-slate-800">
              Log Audit: {showDetailReport.employeeName} ({showDetailReport.date})
            </h3>
            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getStatusBadge(showDetailReport.status)}`}>
              {showDetailReport.status}
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl space-y-3.5 text-xs font-semibold">
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Tasks Completed</span>
                <p className="text-slate-700 mt-1 leading-relaxed">{showDetailReport.tasksCompleted}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Challenges Faced</span>
                <p className="text-slate-700 mt-1">{showDetailReport.challengesFaced || 'None'}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Next Day Plan</span>
                <p className="text-slate-700 mt-1">{showDetailReport.nextDayPlan}</p>
              </div>
            </div>

            {/* Review inputs */}
            <div className="space-y-3 pt-2">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Review Feedback</label>
              <input
                type="text"
                placeholder="Enter comments or revision notes..."
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
              />

              <div className="flex items-center space-x-3 pt-2.5">
                <button
                  onClick={() => handleReviewReport(showDetailReport.id, 'Rejected')}
                  className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold rounded-xl text-xs cursor-pointer transition-all active:scale-[0.99]"
                >
                  Flag Revision
                </button>
                <button
                  onClick={() => handleReviewReport(showDetailReport.id, 'Reviewed')}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/10 cursor-pointer transition-all active:scale-[0.99]"
                >
                  Approve Log
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
      {/* Header & Sub-Tabs */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5.5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Daily Work Log</h2>
          <p className="text-xs text-slate-500 mt-1">Submit your daily accomplishments or audit team deliverables.</p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-150 p-1 rounded-xl">
          <button
            onClick={() => setSubTab('my-logs')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subTab === 'my-logs' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            My logs
          </button>
          <button
            onClick={() => setSubTab('submit-log')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              subTab === 'submit-log' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Submit Daily Log
          </button>
          {hasDirectReports && (
            <button
              onClick={() => setSubTab('team-logs')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                subTab === 'team-logs' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Team Submissions ({teamReports.length})
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Renderings */}
      {subTab === 'my-logs' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">Historical Submissions</h3>
          {myReports.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-10 font-medium">No logs submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {myReports.map((rep) => (
                <div key={rep.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl relative">
                  <div className="flex items-center justify-between text-xs border-b border-slate-200/50 pb-2.5 mb-2.5">
                    <span className="font-mono font-bold text-slate-500">{rep.id} · {rep.date}</span>
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getStatusBadge(rep.status)}`}>
                      {rep.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Completed Tasks</span>
                      <p className="text-slate-700 mt-1">{rep.tasksCompleted}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Challenges Faced</span>
                      <p className="text-slate-700 mt-1">{rep.challengesFaced || 'None'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Next Day Plan</span>
                      <p className="text-slate-700 mt-1">{rep.nextDayPlan}</p>
                    </div>
                  </div>

                  {rep.reviewComments && (
                    <div className="mt-3.5 pt-3 border-t border-slate-200/50 text-[11px] text-slate-500">
                      <strong>Manager Comments:</strong> {rep.reviewComments}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {subTab === 'submit-log' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm max-w-2xl mx-auto">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4 flex items-center">
            <Sparkles className="w-4.5 h-4.5 mr-1.5 text-blue-500" />
            Create Work Log Entry
          </h3>
          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tasks Completed</label>
              <textarea
                required
                rows="3"
                placeholder="Describe what deliverables you finished today..."
                value={tasksCompleted}
                onChange={(e) => setTasksCompleted(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-none font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Challenges Faced (Optional)</label>
              <input
                type="text"
                placeholder="Describe any queries, blocks, or issues..."
                value={challengesFaced}
                onChange={(e) => setChallengesFaced(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Next Day Plan</label>
                <input
                  type="text"
                  required
                  placeholder="Task goals for tomorrow..."
                  value={nextDayPlan}
                  onChange={(e) => setNextDayPlan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Hours Logged</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  placeholder="8"
                  value={hoursSpent}
                  onChange={(e) => setHoursSpent(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 cursor-pointer transition-all active:scale-[0.99] flex items-center justify-center space-x-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Publish Log Entry</span>
            </button>
          </form>
        </div>
      )}

      {subTab === 'team-logs' && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">Team Submissions Queue</h3>
          {teamReports.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-10 font-medium">No team logs submitted yet.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {teamReports.map((rep) => {
                const repUser = employees.find(e => e.id === rep.employeeId);

                return (
                  <div key={rep.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 min-w-0">
                      {repUser && (
                        <img
                          src={repUser.photo}
                          alt={repUser.name}
                          className="w-8.5 h-8.5 rounded-xl object-cover border border-slate-150 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-800 truncate">{rep.employeeName}</p>
                        <p className="text-[10px] text-slate-400 font-semibold truncate">
                          {rep.department} · {rep.date} · {rep.hoursSpent} hrs
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getStatusBadge(rep.status)}`}>
                        {rep.status}
                      </span>
                      <button
                        onClick={() => setShowDetailReport(rep)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                        title="Audit log"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
