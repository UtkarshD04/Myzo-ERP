import React, { useState } from 'react';
import { Truck, Plus, Search, Pencil, ArrowLeft, Building2, CheckCircle2, Mail, Phone } from 'lucide-react';

const CATEGORIES = ['Hardware', 'Services', 'Logistics', 'Raw Materials', 'Other'];

const EMPTY_FORM = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  category: 'Hardware',
  gstNumber: '',
  status: 'Active',
  notes: ''
};

export default function VendorDirectoryView({ vendors = [], onAddVendor, onUpdateVendor }) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filtered = vendors.filter(v => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      v.name?.toLowerCase().includes(q) ||
      v.contactPerson?.toLowerCase().includes(q) ||
      v.category?.toLowerCase().includes(q)
    );
  });

  const activeCount = vendors.filter(v => v.status === 'Active').length;

  const openAddForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowForm(true);
  };

  const openEditForm = (v) => {
    setEditingId(v.id);
    setForm({
      name: v.name || '',
      contactPerson: v.contactPerson || '',
      email: v.email || '',
      phone: v.phone || '',
      address: v.address || '',
      category: v.category || 'Hardware',
      gstNumber: v.gstNumber || '',
      status: v.status || 'Active',
      notes: v.notes || ''
    });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (editingId) {
        await onUpdateVendor(editingId, form);
      } else {
        await onAddVendor(form);
      }
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (v) => {
    try {
      await onUpdateVendor(v.id, { status: v.status === 'Active' ? 'Inactive' : 'Active' });
    } catch (err) {
      alert(err.message);
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
          <span>Back to Vendors</span>
        </button>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2.5">
            <Truck className="w-5 h-5 text-blue-600" />
            <span>{editingId ? 'Edit Vendor' : 'Add Vendor'}</span>
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
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Vendor Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Contact Person</label>
              <input
                type="text"
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Address</label>
            <textarea
              rows="2"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">GST Number</label>
              <input
                type="text"
                value={form.gstNumber}
                onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
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

          <label className="flex items-center space-x-2 cursor-pointer border-t border-slate-50 pt-3.5">
            <input
              type="checkbox"
              checked={form.status === 'Active'}
              onChange={(e) => setForm({ ...form, status: e.target.checked ? 'Active' : 'Inactive' })}
            />
            <span className="text-xs font-semibold text-slate-600">Active vendor</span>
          </label>

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
              {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add Vendor'}
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
          <h2 className="text-xl font-bold text-slate-800">Vendor Directory</h2>
          <p className="text-xs text-slate-500 mt-1">Manage supplier and service-provider contacts used in procurement.</p>
        </div>
        <button
          onClick={openAddForm}
          className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md shadow-blue-500/10 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vendor</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400">
            <Building2 className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Total Vendors</span>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-2">{vendors.length}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Active</span>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{activeCount}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center space-x-2.5">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by name, contact, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-10 shadow-sm text-center text-xs text-slate-400 font-semibold">
          No vendors match this search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(v => (
            <div
              key={v.id}
              className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 hover:shadow-lg hover:border-blue-200 transition-all flex flex-col"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 leading-snug">{v.name}</h3>
                  {v.contactPerson && <p className="text-[11px] text-slate-400 mt-0.5">{v.contactPerson}</p>}
                </div>
                <span className={`shrink-0 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                  v.status === 'Inactive'
                    ? 'bg-red-50 text-red-600 border-red-100'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}>
                  {v.status || 'Active'}
                </span>
              </div>

              <span className="inline-block mt-2 w-fit text-[9px] font-bold uppercase tracking-wide text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                {v.category}
              </span>

              <div className="mt-3 space-y-1.5">
                {v.email && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{v.email}</span>
                  </div>
                )}
                {v.phone && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span>{v.phone}</span>
                  </div>
                )}
                {v.gstNumber && (
                  <p className="text-[10px] text-slate-400 font-mono">GST: {v.gstNumber}</p>
                )}
              </div>

              <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-end gap-2">
                <button
                  onClick={() => toggleStatus(v)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-500 hover:bg-slate-100 cursor-pointer transition-all"
                >
                  {v.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => openEditForm(v)}
                  title="Edit vendor"
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
