import React, { useState } from 'react';
import { ClipboardCheck, CheckCircle2, Circle, ArrowLeft } from 'lucide-react';

export default function OnboardingView({ employee, employees = [], onboarding = [], onUpdateOnboardingItem, onLinkEmployee, setActiveTab }) {
  const [linkingId, setLinkingId] = useState(null);

  const inProgress = onboarding.filter(o => o.status !== 'Completed');
  const completed = onboarding.filter(o => o.status === 'Completed');

  const handleToggle = async (record, item) => {
    try {
      await onUpdateOnboardingItem(record.id, item.id, !item.done);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLink = async (record, employeeId) => {
    try {
      await onLinkEmployee(record.id, employeeId);
      setLinkingId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const renderCard = (record) => {
    const doneCount = (record.items || []).filter(i => i.done).length;
    const total = (record.items || []).length || 1;
    const pct = Math.round((doneCount / total) * 100);
    const linkedEmployee = employees.find(e => e.id === record.employeeId);

    return (
      <div key={record.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="font-bold text-sm text-slate-800">{record.candidateName}</h4>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{record.position} {record.department ? `· ${record.department}` : ''}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Start date: {record.startDate}</p>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${
            record.status === 'Completed'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
              : 'bg-amber-50 text-amber-700 border-amber-100'
          }`}>
            {record.status}
          </span>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 mb-1">
            <span>PROGRESS</span>
            <span>{doneCount}/{total} · {pct}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${record.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-1.5">
          {(record.items || []).map(item => (
            <button
              key={item.id}
              onClick={() => handleToggle(record, item)}
              className="w-full flex items-center gap-2.5 py-1.5 text-left cursor-pointer group"
            >
              {item.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300 group-hover:text-slate-400 shrink-0" />
              )}
              <span className={`text-xs font-medium ${item.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Link to employee record */}
        <div className="border-t border-slate-50 pt-3.5">
          {linkedEmployee ? (
            <p className="text-[10px] text-slate-500 font-semibold">
              Linked to employee: <span className="text-slate-700 font-bold">{linkedEmployee.name}</span>
            </p>
          ) : linkingId === record.id ? (
            <div className="flex items-center gap-2">
              <select
                onChange={(e) => e.target.value && handleLink(record, e.target.value)}
                defaultValue=""
                className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="" disabled>Select employee record...</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.officialEmail})</option>
                ))}
              </select>
              <button onClick={() => setLinkingId(null)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer">Cancel</button>
            </div>
          ) : (
            <button
              onClick={() => setLinkingId(record.id)}
              className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Link to employee record
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-blue-600" />
            Onboarding Checklists
          </h2>
          <p className="text-xs text-slate-500 mt-1">Track new hire onboarding tasks from offer sign-off to induction.</p>
        </div>
        <button
          onClick={() => setActiveTab('recruitment')}
          className="px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl flex items-center space-x-2 cursor-pointer transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Pipeline</span>
        </button>
      </div>

      <div>
        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3">In Progress ({inProgress.length})</h3>
        {inProgress.length === 0 ? (
          <p className="text-xs text-slate-400 font-semibold py-6 text-center bg-white border border-slate-100 rounded-2xl">
            No active onboarding checklists. Move a candidate to "Hired" in the Recruitment Pipeline to start one.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {inProgress.map(renderCard)}
          </div>
        )}
      </div>

      {completed.length > 0 && (
        <div>
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3">Completed ({completed.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {completed.map(renderCard)}
          </div>
        </div>
      )}
    </div>
  );
}
