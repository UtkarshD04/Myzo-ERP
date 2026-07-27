import React, { useState } from 'react';
import { Plus, Search, Package, Pencil, Trash2, AlertTriangle, ArrowLeft, Eye, EyeOff, X, Save } from 'lucide-react';

const EMPTY_FORM = {
  series: '',
  model: '',
  tagline: '',
  type: '',
  badge: '',
  description: '',
  color: '#2563eb',
  stock: '',
  lowStockThreshold: 5,
  discount: 0,
  status: 'Active',
  isPublished: true
};

export default function ProductsManagementView({ products = [], onAddProduct, onUpdateProduct, onDeleteProduct }) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [specs, setSpecs] = useState(['']);
  const [useCases, setUseCases] = useState(['']);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = products.filter(p => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.series?.toLowerCase().includes(q) ||
      p.model?.toLowerCase().includes(q) ||
      p.type?.toLowerCase().includes(q)
    );
  });

  const openAddForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSpecs(['']);
    setUseCases(['']);
    setError('');
    setShowForm(true);
  };

  const openEditForm = (p) => {
    setEditingId(p._id);
    setForm({
      series: p.series || '',
      model: p.model || '',
      tagline: p.tagline || '',
      type: p.type || '',
      badge: p.badge || '',
      description: p.description || '',
      color: p.color || '#2563eb',
      stock: p.stock ?? '',
      lowStockThreshold: p.lowStockThreshold ?? 5,
      discount: p.discount ?? 0,
      status: p.status || 'Active',
      isPublished: p.isPublished !== false
    });
    setSpecs(p.specs?.length ? p.specs : ['']);
    setUseCases(p.useCases?.length ? p.useCases : ['']);
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      ...form,
      stock: form.stock ? Number(form.stock) : 0,
      lowStockThreshold: form.lowStockThreshold !== '' ? Number(form.lowStockThreshold) : 5,
      discount: form.discount ? Number(form.discount) : 0,
      specs: specs.map(s => s.trim()).filter(Boolean),
      useCases: useCases.map(u => u.trim()).filter(Boolean)
    };

    try {
      if (editingId) {
        await onUpdateProduct(editingId, payload);
      } else {
        await onAddProduct(payload);
      }
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const togglePublish = async (p) => {
    try {
      await onUpdateProduct(p._id, { isPublished: !p.isPublished });
    } catch (err) {
      alert(err.message);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDeleteProduct(deleteTarget._id);
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (showForm) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
        <button
          onClick={() => setShowForm(false)}
          className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 cursor-pointer transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2.5">
            <Package className="w-5 h-5 text-blue-600" />
            <span>{editingId ? 'Edit Product' : 'Add Product'}</span>
          </h2>
        </div>

        {error && (
          <div className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Main column */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Product Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Series *</label>
                    <input
                      type="text"
                      required
                      value={form.series}
                      onChange={(e) => setForm({ ...form, series: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Model *</label>
                    <input
                      type="text"
                      required
                      disabled={!!editingId}
                      value={form.model}
                      onChange={(e) => setForm({ ...form, model: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 disabled:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={form.tagline}
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Type</label>
                    <input
                      type="text"
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Badge</label>
                    <input
                      type="text"
                      placeholder="e.g. Best Seller"
                      value={form.badge}
                      onChange={(e) => setForm({ ...form, badge: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Description</label>
                  <textarea
                    rows="3"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Specs */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Specifications</h3>
                  <button
                    type="button"
                    onClick={() => setSpecs(prev => [...prev, ''])}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Spec</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {specs.map((spec, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="e.g. 5kW output"
                        value={spec}
                        onChange={(e) => setSpecs(prev => prev.map((s, idx) => (idx === i ? e.target.value : s)))}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setSpecs(prev => prev.filter((_, idx) => idx !== i))}
                        disabled={specs.length === 1}
                        className="text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Use cases */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Use Cases</h3>
                  <button
                    type="button"
                    onClick={() => setUseCases(prev => [...prev, ''])}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Use Case</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {useCases.map((uc, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="e.g. Residential rooftop"
                        value={uc}
                        onChange={(e) => setUseCases(prev => prev.map((u, idx) => (idx === i ? e.target.value : u)))}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-800 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setUseCases(prev => prev.filter((_, idx) => idx !== i))}
                        disabled={useCases.length === 1}
                        className="text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pricing &amp; Inventory</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Low Stock Alert</label>
                    <input
                      type="number"
                      min="0"
                      value={form.lowStockThreshold}
                      onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Discount</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.discount}
                      onChange={(e) => setForm({ ...form, discount: e.target.value })}
                      className="w-full pl-3 pr-6 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Color</label>
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-full h-9 px-1 py-1 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                  />
                </div>

                <label className="flex items-center space-x-2 cursor-pointer border-t border-slate-50 pt-3.5">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  />
                  <span className="text-xs font-semibold text-slate-600">Publish to catalog</span>
                </label>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2.5">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/10 cursor-pointer transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add Product'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs cursor-pointer transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
      {/* Header card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Products</h2>
          <p className="text-xs text-slate-500 mt-1">Manage the product catalog used across quotations.</p>
        </div>
        <button
          onClick={openAddForm}
          className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md shadow-blue-500/10 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center space-x-2.5">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by series, model, or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Discount</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Catalog</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(p => (
                <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-white"
                        style={{ backgroundColor: p.color || '#2563eb' }}
                      >
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-800 truncate">{p.series} {p.model}</p>
                        <p className="text-[10px] text-slate-400 truncate">{p.tagline || '--'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-slate-600">{p.type || '--'}</td>
                  <td className="px-5 py-3.5 text-xs font-semibold">
                    <span className={Number(p.stock ?? 0) <= (p.lowStockThreshold ?? 5) ? 'text-red-600 font-bold' : 'text-slate-600'}>
                      {p.stock ?? 0}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-slate-600">{p.discount ? `${p.discount}%` : '--'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                      p.status === 'Inactive'
                        ? 'bg-red-50 text-red-600 border-red-100'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {p.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                      p.isPublished
                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                        : 'bg-slate-50 text-slate-500 border-slate-100'
                    }`}>
                      {p.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => togglePublish(p)}
                        title={p.isPublished ? 'Unpublish from catalog' : 'Publish to catalog'}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer transition-all"
                      >
                        {p.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => openEditForm(p)}
                        title="Edit product"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer transition-all"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        title="Delete product"
                        className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 cursor-pointer transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-xs text-slate-400 font-semibold">
                    No products match this search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 bg-red-50 rounded-xl shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-800">Delete Product?</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              This will permanently delete <span className="font-bold text-slate-700">{deleteTarget.series} {deleteTarget.model}</span> from the database. This action cannot be undone.
            </p>

            <div className="flex items-center space-x-3.5 pt-5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs cursor-pointer transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-red-500/10 cursor-pointer transition-all disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
