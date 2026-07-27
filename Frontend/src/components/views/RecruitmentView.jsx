import React, { useState } from 'react';
import { Plus, UserPlus, MessageSquare, Briefcase, Link as LinkIcon, ArrowLeft } from 'lucide-react';

const STAGES = [
  { id: 'Applied', color: 'border-t-slate-400 text-slate-700 bg-slate-50' },
  { id: 'Screening', color: 'border-t-indigo-500 text-indigo-700 bg-indigo-50/10' },
  { id: 'Interview', color: 'border-t-blue-500 text-blue-700 bg-blue-50/10' },
  { id: 'Offer', color: 'border-t-amber-500 text-amber-700 bg-amber-50/10' },
  { id: 'Hired', color: 'border-t-emerald-500 text-emerald-700 bg-emerald-50/10' },
  { id: 'Rejected', color: 'border-t-red-500 text-red-700 bg-red-50/10' }
];

const EMPTY_FORM = { name: '', email: '', phone: '', position: '', department: '', source: '', resumeLink: '' };

export default function RecruitmentView({ employee, candidates = [], onAddCandidate, onUpdateCandidate, setActiveTab }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);
  const [note, setNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await onAddCandidate(form);
      setShowAddModal(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStageChange = async (candidate, stage) => {
    try {
      const updates = { stage };
      if (stage === 'Rejected' && rejectionReason) updates.rejectionReason = rejectionReason;
      await onUpdateCandidate(candidate.id, updates);
      setDetail(prev => (prev && prev.id === candidate.id ? { ...prev, stage } : prev));
      setRejectionReason('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!note.trim() || !detail) return;
    try {
      await onUpdateCandidate(detail.id, { note: note.trim(), author: employee.name });
      setDetail(prev => ({
        ...prev,
        notes: [...(prev.notes || []), { author: employee.name, text: note.trim(), date: 'Just now' }]
      }));
      setNote('');
    } catch (err) {
      alert(err.message);
    }
  };

  if (showAddModal) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
        <button
          onClick={() => { setShowAddModal(false); setForm(EMPTY_FORM); setError(''); }}
          className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 cursor-pointer transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Recruitment Pipeline</span>
        </button>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2.5">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <span>Add Candidate</span>
          </h2>
        </div>

        <form onSubmit={handleAddCandidate} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
            <input
              type="text" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email</label>
              <input
                type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Phone</label>
              <input
                type="text" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Position</label>
              <input
                type="text" required value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Department</label>
              <input
                type="text" value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Source</label>
              <input
                type="text" placeholder="Referral, LinkedIn..." value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Resume Link</label>
              <input
                type="text" value={form.resumeLink}
                onChange={(e) => setForm({ ...form, resumeLink: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {error && <p className="text-[11px] text-red-600 font-semibold bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}

          <div className="flex items-center space-x-3.5 pt-2">
            <button
              type="button"
              onClick={() => { setShowAddModal(false); setForm(EMPTY_FORM); setError(''); }}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/10 cursor-pointer transition-all"
            >
              Add to Pipeline
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Recruitment Pipeline</h2>
          <p className="text-xs text-slate-500 mt-1">Track candidates from application through to hire.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('onboarding')}
            className="px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl flex items-center space-x-2 cursor-pointer transition-all active:scale-95"
          >
            <Briefcase className="w-4 h-4" />
            <span>Onboarding Checklists</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md shadow-blue-500/10 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Pipeline Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-5">
        {STAGES.map(col => {
          const colCandidates = candidates.filter(c => c.stage === col.id);
          return (
            <div key={col.id} className="space-y-4">
              <div className={`p-3 bg-white border border-slate-100 rounded-xl flex items-center justify-between shadow-sm border-t-4 ${col.color}`}>
                <span className="font-extrabold text-xs">{col.id}</span>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded-md text-slate-600">
                  {colCandidates.length}
                </span>
              </div>
              <div className="space-y-3 min-h-[200px]">
                {colCandidates.map(c => (
                  <div
                    key={c.id}
                    onClick={() => setDetail(c)}
                    className="bg-white border border-slate-100 hover:border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <span className="font-mono text-[9px] font-bold text-blue-500 bg-blue-50/50 px-1.5 py-0.5 rounded border border-blue-100">
                      {c.id}
                    </span>
                    <h4 className="font-bold text-xs text-slate-800 mt-2 group-hover:text-blue-600 transition-colors leading-snug">
                      {c.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{c.position}</p>
                    {c.department && <p className="text-[9px] text-slate-400 mt-0.5">{c.department}</p>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Candidate Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4.5 border-b border-slate-50 pb-3">
              <span className="font-mono text-xs font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                {detail.id}
              </span>
              <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-800 text-base">{detail.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{detail.position} {detail.department ? `· ${detail.department}` : ''}</p>
                <p className="text-[10px] text-slate-400 mt-1">{detail.email} {detail.phone ? `· ${detail.phone}` : ''}</p>
                {detail.resumeLink && (
                  <a href={detail.resumeLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-bold mt-1.5 hover:underline">
                    <LinkIcon className="w-3 h-3" /> View Resume
                  </a>
                )}
              </div>

              <div className="border-t border-b border-slate-50 py-4">
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Pipeline Stage</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {STAGES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => handleStageChange(detail, s.id)}
                      className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all ${
                        detail.stage === s.id
                          ? 'bg-blue-50 border-blue-200 text-blue-600'
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {s.id}
                    </button>
                  ))}
                </div>
                {detail.stage === 'Hired' && (
                  <p className="text-[10px] text-emerald-600 font-semibold mt-2.5">
                    Onboarding checklist auto-created — check the Onboarding Checklists tab.
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Notes</label>
                <div className="max-h-32 overflow-y-auto space-y-2.5 divide-y divide-slate-50/50 pr-1.5">
                  {(detail.notes || []).length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">No notes yet.</p>
                  ) : (
                    (detail.notes || []).map((n, i) => (
                      <div key={i} className={`text-[11px] ${i > 0 ? 'pt-2.5' : ''}`}>
                        <div className="flex items-center justify-between text-slate-500 font-semibold mb-0.5">
                          <span>{n.author}</span>
                          <span className="font-mono text-[9px] font-medium">{n.date}</span>
                        </div>
                        <p className="text-slate-600 font-medium">{n.text}</p>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={handleAddNote} className="flex items-center space-x-2.5 pt-2">
                  <input
                    type="text"
                    placeholder="Add interview feedback / note..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 cursor-pointer transition-all flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Post
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
