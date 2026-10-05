import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ClipboardList, Download, Plus, Pencil, Trash2, X } from 'lucide-react';
import { api } from '../../api';
import { exportToCsv } from '../../utils/exportCsv';

const ACTIVITIES = ['Interview', 'Resume Screening', 'Phone Screening', 'Onboarding', 'Offer / Documentation', 'Other'];
const MODES = ['Online', 'Offline'];
const RESULTS = ['Selected', 'Rejected', 'On Hold', 'Next Round', 'No Show'];
const RESULT_STYLE = {
  Selected: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Rejected: 'bg-red-50 text-red-600 border-red-100',
  'On Hold': 'bg-amber-50 text-amber-700 border-amber-100',
  'Next Round': 'bg-blue-50 text-blue-700 border-blue-100',
  'No Show': 'bg-slate-100 text-slate-600 border-slate-200'
};

const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = () => ({
  date: today(), activity: 'Interview', count: 1, description: '',
  candidateName: '', candidatePhone: '', mode: 'Online', domain: '', result: 'Next Round'
});

const inputClass = 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500';

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</span>
      {children}
    </label>
  );
}

// What a row shows in the "Work" column, whichever activity it is.
function workSummary(row) {
  if (row.activity === 'Interview') {
    return (
      <>
        <div className="font-bold text-slate-800">{row.candidateName}</div>
        <div className="text-slate-400">{[row.mode, row.domain, row.candidatePhone].filter(Boolean).join(' · ')}</div>
        {row.description && <div className="text-slate-500 mt-0.5">{row.description}</div>}
      </>
    );
  }
  return <div className="text-slate-700">{row.description}</div>;
}

export default function HrWorkLogView({ employee, employees = [] }) {
  const isAdmin = employee?.role === 'Admin';
  const [month, setMonth] = useState(today().slice(0, 7));
  const [hrFilter, setHrFilter] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { logs } = await api.getHrWorkLogs({ month, loggedBy: isAdmin ? hrFilter : '' });
      setRows(logs || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month, hrFilter, isAdmin]);

  useEffect(() => { load(); }, [load]);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const isInterview = form.activity === 'Interview';

  const summary = useMemo(() => {
    const interviews = rows.filter(r => r.activity === 'Interview');
    const tally = (list, key) => Object.entries(list.reduce((acc, r) => ({ ...acc, [r[key]]: (acc[r[key]] || 0) + (r.count || 1) }), {}));
    return {
      totalWork: rows.reduce((t, r) => t + (r.count || 1), 0),
      interviews: interviews.length,
      online: interviews.filter(r => r.mode === 'Online').length,
      offline: interviews.filter(r => r.mode === 'Offline').length,
      byResult: RESULTS.map(res => [res, interviews.filter(r => r.result === res).length]),
      byActivity: tally(rows, 'activity'),
      byDomain: tally(interviews, 'domain'),
      days: Object.entries(rows.reduce((acc, r) => ({ ...acc, [r.date]: (acc[r.date] || 0) + (r.count || 1) }), {})).sort(([a], [b]) => a.localeCompare(b))
    };
  }, [rows]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editingId) await api.updateHrWorkLog(editingId, form);
      else await api.addHrWorkLog(form);
      setForm(emptyForm());
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setForm({
      date: row.date, activity: row.activity, count: row.count || 1, description: row.description || '',
      candidateName: row.candidateName || '', candidatePhone: row.candidatePhone || '',
      mode: row.mode || 'Online', domain: row.domain || '', result: row.result || 'Next Round'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => { setEditingId(null); setForm(emptyForm()); };

  const handleDelete = async (row) => {
    if (!window.confirm('Delete this work entry?')) return;
    try {
      await api.deleteHrWorkLog(row.id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExport = () => {
    if (!rows.length) return;
    const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
    exportToCsv(`HR-Work-${month}`, [
      { label: 'Date', value: 'date' },
      { label: 'Activity', value: 'activity' },
      { label: 'Count', value: (r) => r.count || 1 },
      { label: 'Candidate Name', value: (r) => r.candidateName || '' },
      { label: 'Phone', value: (r) => r.candidatePhone || '' },
      { label: 'Mode (Online/Offline)', value: (r) => r.mode || '' },
      { label: 'Domain', value: (r) => r.domain || '' },
      { label: 'Result', value: (r) => r.result || '' },
      { label: 'Details', value: (r) => r.description || '' },
      { label: 'Done By', value: (r) => r.loggedByName || '' }
    ], sorted);
  };

  const hrUsers = employees.filter(e => e.role === 'HR' || e.role === 'Admin');
  const stats = [
    ['Total work', summary.totalWork], ['Interviews', summary.interviews], ['Online', summary.online], ['Offline', summary.offline],
    ...summary.byResult
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><ClipboardList size={18} /> {isAdmin ? 'HR Work' : 'My HR Work'}</h3>
          <p className="text-xs text-slate-500 mt-1">Update the work you do each day. The whole month's work is shown below and can be downloaded for Excel.</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Month"><input type="month" className={inputClass} value={month} onChange={(e) => setMonth(e.target.value)} /></Field>
          {isAdmin && (
            <Field label="HR">
              <select className={inputClass} value={hrFilter} onChange={(e) => setHrFilter(e.target.value)}>
                <option value="">All HR</option>
                {hrUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </Field>
          )}
          <button type="button" onClick={handleExport} disabled={!rows.length}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-40">
            <Download size={14} /> Export to Excel
          </button>
        </div>
      </div>

      {error && <div className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-800">{editingId ? 'Edit work entry' : 'Add today\'s work'}</h4>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Date *"><input required type="date" className={inputClass} value={form.date} onChange={set('date')} /></Field>
          <Field label="Work type *">
            <select className={inputClass} value={form.activity} onChange={set('activity')}>{ACTIVITIES.map(a => <option key={a}>{a}</option>)}</select>
          </Field>
          {!isInterview && (
            <Field label="How many *"><input required type="number" min="1" step="1" className={inputClass} value={form.count} onChange={set('count')} /></Field>
          )}
        </div>

        {isInterview && (
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Candidate name *"><input required className={inputClass} value={form.candidateName} onChange={set('candidateName')} /></Field>
            <Field label="Candidate phone"><input className={inputClass} value={form.candidatePhone} onChange={set('candidatePhone')} /></Field>
            <Field label="Mode *">
              <select className={inputClass} value={form.mode} onChange={set('mode')}>{MODES.map(m => <option key={m}>{m}</option>)}</select>
            </Field>
            <Field label="Domain / role *"><input required className={inputClass} placeholder="e.g. Sales, Solar Design, Accounts" value={form.domain} onChange={set('domain')} /></Field>
            <Field label="Result *">
              <select className={inputClass} value={form.result} onChange={set('result')}>{RESULTS.map(r => <option key={r}>{r}</option>)}</select>
            </Field>
          </div>
        )}

        <Field label={isInterview ? 'Notes' : 'What work was done *'}>
          <textarea required={!isInterview} rows={2} className={inputClass} value={form.description} onChange={set('description')}
            placeholder={isInterview ? '' : 'e.g. Screened 25 resumes for the Sales role'} />
        </Field>

        <div className="flex gap-2">
          <button type="submit" disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50">
            <Plus size={14} /> {editingId ? 'Save changes' : 'Add work'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl">
              <X size={14} /> Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-9 gap-3">
        {stats.map(([label, value]) => (
          <div key={label} className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="text-xl font-black text-slate-800 mt-1">{value}</p>
          </div>
        ))}
      </div>
      <div className="space-y-1 text-xs text-slate-500">
        {summary.days.length > 0 && <p><span className="font-bold text-slate-600">Days worked: {summary.days.length}</span> · {summary.days.map(([d, n]) => `${d.slice(8)}/${d.slice(5, 7)} (${n})`).join(' · ')}</p>}
        {summary.byActivity.length > 0 && <p><span className="font-bold text-slate-600">By work type:</span> {summary.byActivity.map(([a, n]) => `${a} (${n})`).join(' · ')}</p>}
        {summary.byDomain.length > 0 && <p><span className="font-bold text-slate-600">Interviews by domain:</span> {summary.byDomain.map(([d, n]) => `${d} (${n})`).join(' · ')}</p>}
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
              {['Date', 'Type', 'Count', 'Work', 'Result', ...(isAdmin ? ['By'] : []), ''].map(h => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">Loading…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400">No work logged for this month.</td></tr>}
            {rows.map(row => (
              <tr key={row.id} className="border-b border-slate-50 last:border-0 align-top">
                <td className="px-4 py-3 whitespace-nowrap">{row.date}</td>
                <td className="px-4 py-3 whitespace-nowrap font-semibold text-slate-700">{row.activity}</td>
                <td className="px-4 py-3">{row.count || 1}</td>
                <td className="px-4 py-3 max-w-[320px]">{workSummary(row)}</td>
                <td className="px-4 py-3">{row.result && <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${RESULT_STYLE[row.result] || ''}`}>{row.result}</span>}</td>
                {isAdmin && <td className="px-4 py-3 whitespace-nowrap">{row.loggedByName}</td>}
                <td className="px-4 py-3 whitespace-nowrap">
                  {(isAdmin || row.loggedBy === employee?.id) && (
                    <div className="flex gap-2 text-slate-400">
                      <button type="button" onClick={() => startEdit(row)} className="hover:text-blue-600" title="Edit"><Pencil size={14} /></button>
                      <button type="button" onClick={() => handleDelete(row)} className="hover:text-red-600" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
