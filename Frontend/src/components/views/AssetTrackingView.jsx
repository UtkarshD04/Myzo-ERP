import React, { useState } from 'react';
import { Laptop, Plus, Search, Pencil, ArrowLeft, Boxes, Wrench, IndianRupee, PackageCheck } from 'lucide-react';

const CATEGORIES = ['Laptop', 'Mobile', 'Furniture', 'Vehicle', 'Other'];
const STATUSES = ['In Use', 'In Storage', 'Under Repair', 'Retired'];
const CONDITIONS = ['Good', 'Fair', 'Damaged'];
const MANAGER_ROLES = ['Admin', 'HR'];

const EMPTY_FORM = {
  assetTag: '',
  name: '',
  category: 'Laptop',
  serialNumber: '',
  purchaseDate: '',
  purchaseCost: '',
  assignedTo: '',
  status: 'In Storage',
  condition: 'Good',
  location: '',
  warrantyExpiry: '',
  notes: ''
};

function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function getStatusBadge(status) {
  switch (status) {
    case 'In Use': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'Under Repair': return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'Retired': return 'bg-slate-100 text-slate-500 border-slate-200';
    default: return 'bg-blue-50 text-blue-700 border-blue-100';
  }
}

function getConditionBadge(condition) {
  switch (condition) {
    case 'Damaged': return 'bg-red-50 text-red-600 border-red-100';
    case 'Fair': return 'bg-amber-50 text-amber-600 border-amber-100';
    default: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  }
}

export default function AssetTrackingView({ employee, employees = [], assets = [], onAddAsset, onUpdateAsset }) {
  const isManager = MANAGER_ROLES.includes(employee.role);

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const myAssets = assets.filter(a => a.assignedTo === employee.id);
  const visibleAssets = isManager ? assets : myAssets;

  const filtered = visibleAssets.filter(a => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      a.name?.toLowerCase().includes(q) ||
      a.assetTag?.toLowerCase().includes(q) ||
      a.category?.toLowerCase().includes(q) ||
      a.assignedToName?.toLowerCase().includes(q)
    );
  });

  const inUseCount = assets.filter(a => a.status === 'In Use').length;
  const underRepairCount = assets.filter(a => a.status === 'Under Repair').length;
  const totalValue = assets.reduce((sum, a) => sum + (Number(a.purchaseCost) || 0), 0);

  const openAddForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowForm(true);
  };

  const openEditForm = (a) => {
    setEditingId(a.id);
    setForm({
      assetTag: a.assetTag || '',
      name: a.name || '',
      category: a.category || 'Laptop',
      serialNumber: a.serialNumber || '',
      purchaseDate: a.purchaseDate || '',
      purchaseCost: a.purchaseCost ?? '',
      assignedTo: a.assignedTo || '',
      status: a.status || 'In Storage',
      condition: a.condition || 'Good',
      location: a.location || '',
      warrantyExpiry: a.warrantyExpiry || '',
      notes: a.notes || ''
    });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      ...form,
      purchaseCost: form.purchaseCost ? Number(form.purchaseCost) : 0,
      assignedTo: form.assignedTo || null
    };

    try {
      if (editingId) {
        await onUpdateAsset(editingId, payload);
      } else {
        await onAddAsset(payload);
      }
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (showForm) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
        <button
          onClick={() => setShowForm(false)}
          className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 cursor-pointer transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assets</span>
        </button>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2.5">
            <Laptop className="w-5 h-5 text-blue-600" />
            <span>{editingId ? 'Edit Asset' : 'Add Asset'}</span>
          </h2>
        </div>

        {error && (
          <div className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Asset Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Asset Tag</label>
              <input
                type="text"
                placeholder="e.g. MYZO-AST-001"
                value={form.assetTag}
                onChange={(e) => setForm({ ...form, assetTag: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Serial Number</label>
              <input
                type="text"
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Purchase Cost (₹)</label>
              <input
                type="number"
                min="0"
                value={form.purchaseCost}
                onChange={(e) => setForm({ ...form, purchaseCost: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Purchase Date</label>
              <input
                type="date"
                value={form.purchaseDate}
                onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Warranty Expiry</label>
              <input
                type="date"
                value={form.warrantyExpiry}
                onChange={(e) => setForm({ ...form, warrantyExpiry: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Location</label>
              <input
                type="text"
                placeholder="e.g. HO - 3rd Floor"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Assigned To</label>
              <select
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="">Unassigned</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Condition</label>
              <select
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              >
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Notes</label>
            <textarea
              rows="3"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center space-x-3.5 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/10 cursor-pointer transition-all disabled:opacity-60"
            >
              {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add Asset'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{isManager ? 'Asset Tracking' : 'My Assigned Assets'}</h2>
          <p className="text-xs text-slate-500 mt-1">
            {isManager ? 'Track company assets, assignments, and condition.' : 'Equipment currently assigned to you.'}
          </p>
        </div>
        {isManager && (
          <button
            onClick={openAddForm}
            className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md shadow-blue-500/10 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
        )}
      </div>

      {isManager && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <Boxes className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-wider">Total Assets</span>
            </div>
            <p className="text-2xl font-black text-slate-800 mt-2">{assets.length}</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <PackageCheck className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-wider">In Use</span>
            </div>
            <p className="text-2xl font-black text-emerald-600 mt-2">{inUseCount}</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <Wrench className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-wider">Under Repair</span>
            </div>
            <p className={`text-2xl font-black mt-2 ${underRepairCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>{underRepairCount}</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <IndianRupee className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-wider">Total Value</span>
            </div>
            <p className="text-2xl font-black text-slate-800 mt-2">{money(totalValue)}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center space-x-2.5">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by name, tag, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-10 shadow-sm text-center text-xs text-slate-400 font-semibold">
          {isManager ? 'No assets match this search.' : 'No assets are currently assigned to you.'}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                <th className="py-3 pr-4 font-extrabold">Asset</th>
                <th className="py-3 pr-4 font-extrabold">Category</th>
                {isManager && <th className="py-3 pr-4 font-extrabold">Assigned To</th>}
                <th className="py-3 pr-4 font-extrabold">Status</th>
                <th className="py-3 pr-4 font-extrabold">Condition</th>
                {isManager && <th className="py-3 pr-4 font-extrabold">Value</th>}
                {isManager && <th className="py-3 font-extrabold">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 pr-4">
                    <p className="text-slate-800 font-bold">{a.name}</p>
                    {a.assetTag && <p className="text-[10px] text-slate-400">{a.assetTag}</p>}
                  </td>
                  <td className="py-3.5 pr-4 text-slate-600">{a.category}</td>
                  {isManager && <td className="py-3.5 pr-4 text-slate-600">{a.assignedToName || '--'}</td>}
                  <td className="py-3.5 pr-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(a.status)}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getConditionBadge(a.condition)}`}>
                      {a.condition}
                    </span>
                  </td>
                  {isManager && <td className="py-3.5 pr-4 text-slate-700 font-mono">{money(a.purchaseCost)}</td>}
                  {isManager && (
                    <td className="py-3.5">
                      <button
                        onClick={() => openEditForm(a)}
                        title="Edit asset"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
