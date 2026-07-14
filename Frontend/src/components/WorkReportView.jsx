import React, { useState } from 'react';
import { FileText, Plus, Clock, CheckCircle, MessageSquare } from 'lucide-react';

export default function WorkReportView({ employee, employees, reports, setReports, initialSubTab }) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab || 'my-reports');
  const [showAddModal, setShowAddModal] = useState(false);

  const myReports = reports.filter(r => r.employeeId === employee.id);
  const teamReports = employee.role === 'Manager' || employee.role === 'Admin' || employee.role === 'HR'
    ? reports.filter(r => r.employeeId !== employee.id)
    : [];

  const displayedReports = activeSubTab === 'my-reports' ? myReports : teamReports;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Reviewed': return 'bg-emerald-50 text-emerald-700';
      case 'Submitted': return 'bg-blue-50 text-blue-700';
      case 'Draft': return 'bg-slate-50 text-slate-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Work Reports</h2>
            <p className="text-xs text-slate-500 mt-1">Submit and track daily work reports</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Report</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs for managers */}
      {(employee.role === 'Manager' || employee.role === 'Admin' || employee.role === 'HR') && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveSubTab('my-reports')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'my-reports' 
                  ? 'bg-[#2563EB] text-white' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              My Reports
            </button>
            <button 
              onClick={() => setActiveSubTab('team-logs')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'team-logs' 
                  ? 'bg-[#2563EB] text-white' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Team Reports
            </button>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-3">
        {displayedReports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 shadow-sm text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No reports found</p>
          </div>
        ) : (
          displayedReports.map((report) => (
            <div key={report.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-mono text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded">
                      {report.id}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase px-2 py-0.5 rounded-md bg-slate-50">
                      {report.department}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-bold text-sm text-slate-800">{report.employeeName}</h4>
                    <span className="text-[10px] text-slate-400">•</span>
                    <span className="text-xs text-slate-500">{report.date}</span>
                    <span className="text-[10px] text-slate-400">•</span>
                    <span className="text-xs text-slate-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {report.hoursSpent}h
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tasks Completed</p>
                      <p className="text-slate-700">{report.tasksCompleted}</p>
                    </div>
                    
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Challenges Faced</p>
                      <p className="text-slate-600">{report.challengesFaced}</p>
                    </div>
                    
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Next Day Plan</p>
                      <p className="text-slate-600">{report.nextDayPlan}</p>
                    </div>

                    {report.reviewComments && (
                      <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Review Comments
                        </p>
                        <p className="text-emerald-900 text-xs">{report.reviewComments}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
