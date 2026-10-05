import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ClipboardList, Download, Plus, Pencil, Trash2, X } from 'lucide-react';
import { api } from '../../api';
import { exportToCsv } from '../../utils/exportCsv';

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
const thisMonth = () => today().slice(0, 7);
const emptyForm = () => ({ date: today(), candidateName: '', candidatePhone: '', mode: 'Online', domain: '', result: 'Next Round', notes: '' });

const inputClass = 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500';

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</span>
      {children}
    </label>
  );
}

export default function InterviewLogView({ employee, employees = [] }) {
  const isAdmin = employee?.role === 'Admin';
  const [month, setMonth] = useState(thisMonth());
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
      const { interviews } = await api.getInterviewLogs({ month, conductedBy: isAdmin ? hrFilter : '' });
      setRows(interviews || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month, hrFilter, isAdmin]);

  useEffect(() => { load(); }, [load]);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const summary = useMemo(() => {
    const count = (fn) => rows.filter(fn).length;
    return {
      total: rows.length,
      online: count(r => r.mode === 'Online'),
      offline: count(r => r.mode === 'Offline'),
      byResult: RESULTS.map(r => [r, count(x => x.result === r)]),
      days: Object.entries(rows.reduce((acc, r) => ({ ...acc, [r.date]: (acc[r.date] || 0) + 1 }), {})).sort(([a], [b]) => a.localeCompare(b)),
      domains: Object.entries(rows.reduce((acc, r) => ({ ...acc, [r.domain]: (acc[r.domain] || 0) + 1 }), {}))
    };
  }, [rows]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editingId) await api.updateInterviewLog(editingId, form);
      else await api.addInterviewLog(form);
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
      date: row.date, candidateName: row.candidateName, candidatePhone: row.candidatePhone || '',
      mode: row.mode, domain: row.domain, result: row.result, notes: row.notes || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => { setEditingId(null); setForm(emptyForm()); };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete the interview entry for ${row.candidateName}?`)) return;
    try {
      await api.deleteInterviewLog(row.id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExport = () => {
    if (!rows.length) return;
    const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));
    exportToCsv(`Interview-Log-${month}`, [
      { label: 'Date', value: 'date' },
      { label: 'Candidate Name', value: 'candidateName' },
      { label: 'Phone', value: (r) => r.candidatePhone || '' },
      { label: 'Mode (Online/Offline)', value: 'mode' },
      { label: 'Domain', value: 'domain' },
      { label: 'Result', value: 'result' },
      { label: 'Notes', value: (r) => r.notes || '' },
      { label: 'Interviewed By', value: (r) => r.conductedByName || '' }
    ], sorted);
  };

  const hrUsers = employees.filter(e => e.role === 'HR' || e.role === 'Admin');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><ClipboardList size={18} /> {isAdmin ? 'HR Interview Work' : 'My Interview Work'}</h3>
          <p className="text-xs text-slate-500 mt-1">Add the interviews you take each day. The whole month's work is shown below and can be downloaded for Excel.</p>
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
        <h4 className="text-sm font-bold text-slate-800">{editingId ? 'Edit interview entry' : 'Add interview'}</h4>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Date *"><input required type="date" className={inputClass} value={form.date} onChange={set('date')} /></Field>
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
        <Field label="Notes"><textarea rows={2} className={inputClass} value={form.notes} onChange={set('notes')} /></Field>
        <div className="flex gap-2">
          <button type="submit" disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50">
            <Plus size={14} /> {editingId ? 'Save changes' : 'Add interview'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl">
              <X size={14} /> Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[['Total', summary.total], ['Online', summary.online], ['Offline', summary.offline], ...summary.byResult].map(([label, value]) => (
          <div key={label} className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="text-xl font-black text-slate-800 mt-1">{value}</p>
          </div>
        ))}
      </div>
      {summary.days.length > 0 && (
        <p className="text-xs text-slate-500"><span className="font-bold text-slate-600">Days worked: {summary.days.length}</span> · {summary.days.map(([d, n]) => `${d.slice(8)}/${d.slice(5, 7)} (${n})`).join(' · ')}</p>
      )}
      {summary.domains.length > 0 && (
        <p className="text-xs text-slate-500"><span className="font-bold text-slate-600">By domain:</span> {summary.domains.map(([d, n]) => `${d} (${n})`).join(' · ')}</p>
      )}

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
              {['Date', 'Candidate', 'Mode', 'Domain', 'Result', 'Notes', ...(isAdmin ? ['By'] : []), ''].map(h => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-400">Loading…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={8} className="px-4 py-6 text-center text-slate-400">No interview work logged for this month.</td></tr>}
            {rows.map(row => (
              <tr key={row.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3 whitespace-nowrap">{row.date}</td>
                <td className="px-4 py-3"><div className="font-bold text-slate-800">{row.candidateName}</div>{row.candidatePhone && <div className="text-slate-400">{row.candidatePhone}</div>}</td>
                <td className="px-4 py-3">{row.mode}</td>
                <td className="px-4 py-3">{row.domain}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${RESULT_STYLE[row.result] || ''}`}>{row.result}</span></td>
                <td className="px-4 py-3 text-slate-500 max-w-[240px]">{row.notes}</td>
                {isAdmin && <td className="px-4 py-3 whitespace-nowrap">{row.conductedByName}</td>}
                <td className="px-4 py-3 whitespace-nowrap">
                  {(isAdmin || row.conductedBy === employee?.id) && (
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
