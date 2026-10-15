import React, { useState } from 'react';
import { Calendar, Plus, Trash2, X } from 'lucide-react';

const EMPTY_FORM = { name: '', date: '', type: 'Company', department: '', description: '' };

export default function HolidaysView({ employee, holidays = [], onAddHoliday, onDeleteHoliday }) {
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Super Admins hold role 'Admin' too.
  const canManage = employee?.role === 'Admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onAddHoliday(form);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setError(err.message || 'Could not add the holiday.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (h) => {
    if (!window.confirm(`Delete "${h.name}"?`)) return;
    try {
      await onDeleteHoliday(h.id);
    } catch (err) {
      window.alert(err.message || 'Could not delete the holiday.');
    }
  };

  // Only holidays stored by the company can be deleted; live national ones are HOL-<year>-n.
  const isDeletable = (h) => !/^HOL-\d{4}-\d+$/.test(h.id);

  const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20';

  const filteredHolidays = filter === 'all'
    ? holidays
    : holidays.filter(h => h.type.toLowerCase() === filter.toLowerCase() || (h.department && h.department.toLowerCase() === filter.toLowerCase()));

  const getTypeBadge = (type) => {
    if (type === 'National') return 'bg-orange-50 text-orange-600 border-orange-100';
    if (type === 'Company') return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    return 'bg-blue-50 text-blue-600 border-blue-100';
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Company Calendar</h2>
          <p className="text-xs text-slate-500 mt-1">Check scheduled holidays, department retreats, and corporate summits.</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowForm(v => !v)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'Add Holiday'}
          </button>
        )}
      </div>

      {canManage && showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Holiday Name</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g. Holi" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Date</label>
              <input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inputCls}>
                <option value="National">National</option>
                <option value="Company">Company</option>
                <option value="Department">Department</option>
              </select>
            </div>
            {form.type === 'Department' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Department</label>
                <input required value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className={inputCls} placeholder="e.g. Sales" />
              </div>
            )}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Description (optional)</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inputCls} />
            </div>
          </div>
          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
          <button type="submit" disabled={saving} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer">
            {saving ? 'Saving…' : 'Save Holiday'}
          </button>
        </form>
      )}

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {['all', 'National', 'Company', 'Department'].map(chip => (
          <button
            key={chip}
            onClick={() => setFilter(chip)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all border cursor-pointer ${
              filter === chip
                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/10'
                : 'bg-white border-slate-150 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {chip === 'all' ? 'All Events' : `${chip} Holidays`}
          </button>
        ))}
      </div>

      {/* Grid of holiday cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filteredHolidays.map((h) => (
          <div key={h.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-44">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] font-bold text-slate-400">
                  {h.id}
                </span>
                <span className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded border ${getTypeBadge(h.type)}`}>
                    {h.type}
                  </span>
                  {canManage && isDeletable(h) && (
                    <button onClick={() => handleDelete(h)} title="Delete holiday" className="text-slate-300 hover:text-red-500 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </span>
              </div>
              <h3 className="font-bold text-sm text-slate-800 mt-3.5 leading-snug">{h.name}</h3>
              {h.department && (
                <span className="text-[10px] text-slate-400 font-semibold block mt-1.5 uppercase">
                  Dept: {h.department}
                </span>
              )}
            </div>

            <div className="border-t border-slate-50 pt-3 flex items-center space-x-2 text-xs font-bold text-blue-600">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>
                {new Date(h.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
