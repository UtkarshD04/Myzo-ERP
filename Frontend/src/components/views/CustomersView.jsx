import React, { useState } from 'react';
import { Plus, Search, UserCog, UserX, UserCheck2, Contact, Trash2, AlertTriangle, ArrowLeft, Building2, Phone, Mail, FileSpreadsheet, ArrowRight, ArrowLeftCircle, CheckCircle2, XCircle, RotateCcw, LayoutGrid, List } from 'lucide-react';

const LEAD_STATUSES = ['New', 'Contacted', 'Negotiation', 'Won', 'Lost'];

const LEAD_STATUS_STYLES = {
  New: 'bg-slate-50 text-slate-600 border-slate-100',
  Contacted: 'bg-blue-50 text-blue-600 border-blue-100',
  Negotiation: 'bg-amber-50 text-amber-600 border-amber-100',
  Won: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Lost: 'bg-red-50 text-red-600 border-red-100'
};

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  company: '',
  address: '',
  leadStatus: 'New'
};

// Older records may still carry the pre-rename 'Lead' value — treat it as 'New'.
const normalizeStage = (stage) => (stage === 'Lead' ? 'New' : stage) || 'New';

export default function CustomersView({ customers = [], quotations = [], onAddCustomer, onUpdateCustomer, onSetCustomerBlocked, onDeleteCustomer }) {
  const [view, setView] = useState('directory');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [movingId, setMovingId] = useState(null);

  const quotationCountFor = (email) =>
    quotations.filter(q => (q.customerEmail || '').toLowerCase() === (email || '').toLowerCase()).length;

  const moveStage = async (customer, newStage) => {
    setMovingId(customer._id);
    try {
      await onUpdateCustomer(customer._id, { leadStatus: newStage });
    } catch (err) {
      alert(err.message);
    } finally {
      setMovingId(null);
    }
  };

  const filtered = customers.filter(c => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q ||
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || normalizeStage(c.leadStatus) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openAddForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowForm(true);
  };

  const openEditForm = (c) => {
    setEditingId(c._id);
    setForm({
      name: c.name || '',
      email: c.email || '',
      phone: c.phone || '',
      company: c.company || '',
      address: c.address || '',
      leadStatus: normalizeStage(c.leadStatus)
    });
    setError('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingId) {
        await onUpdateCustomer(editingId, form);
      } else {
        await onAddCustomer(form);
      }
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBlocked = async (c) => {
    try {
      await onSetCustomerBlocked(c._id, !c.isBlocked);
    } catch (err) {
      alert(err.message);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDeleteCustomer(deleteTarget._id);
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (showForm) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
        <button
          onClick={() => setShowForm(false)}
          className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 cursor-pointer transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customer Directory</span>
        </button>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2.5">
            <Contact className="w-5 h-5 text-blue-600" />
            <span>{editingId ? 'Edit Customer' : 'Add New Customer'}</span>
          </h2>
        </div>

        {error && (
          <div className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Company</label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Address</label>
            <textarea
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Lead Status</label>
            <select
              value={form.leadStatus}
              onChange={(e) => setForm({ ...form, leadStatus: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            >
              {LEAD_STATUSES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
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
              {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add Customer'}
            </button>
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
          <h2 className="text-xl font-bold text-slate-800">Customer Directory</h2>
          <p className="text-xs text-slate-500 mt-1">Manage customer contacts, companies, and lead status.</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setView('directory')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                view === 'directory' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List className="w-3.5 h-3.5" /> Directory
            </button>
            <button
              onClick={() => setView('pipeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                view === 'pipeline' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Pipeline
            </button>
          </div>
          <button
            onClick={openAddForm}
            className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md shadow-blue-500/10 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {view === 'pipeline' && (
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-max">
            {LEAD_STATUSES.map(stage => {
              const stageCustomers = customers.filter(c => normalizeStage(c.leadStatus) === stage);
              return (
                <div key={stage} className="w-64 shrink-0">
                  <div className={`rounded-xl border px-3.5 py-2.5 mb-3 flex items-center justify-between ${LEAD_STATUS_STYLES[stage]}`}>
                    <span className="text-[11px] font-black uppercase tracking-wider">{stage}</span>
                    <span className="text-[10px] font-bold bg-white/60 px-1.5 py-0.5 rounded-md">{stageCustomers.length}</span>
                  </div>
                  <div className="space-y-2.5">
                    {stageCustomers.map(c => (
                      <div key={c._id} className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm">
                        <p className="font-bold text-xs text-slate-800 truncate">{c.name}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{c.company || c.email}</p>
                        <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                          <FileSpreadsheet className="w-3 h-3" /> {quotationCountFor(c.email)} quotation(s)
                        </p>

                        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-50">
                          {stage === 'New' && (
                            <button
                              disabled={movingId === c._id}
                              onClick={() => moveStage(c, 'Contacted')}
                              className="flex-1 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg py-1.5 flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                            >
                              Contact <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          {stage === 'Contacted' && (
                            <>
                              <button
                                disabled={movingId === c._id}
                                onClick={() => moveStage(c, 'New')}
                                title="Move back to New"
                                className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg cursor-pointer transition-all disabled:opacity-50"
                              >
                                <ArrowLeftCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                disabled={movingId === c._id}
                                onClick={() => moveStage(c, 'Negotiation')}
                                className="flex-1 text-[10px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg py-1.5 flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                              >
                                Negotiate <ArrowRight className="w-3 h-3" />
                              </button>
                            </>
                          )}
                          {stage === 'Negotiation' && (
                            <>
                              <button
                                disabled={movingId === c._id}
                                onClick={() => moveStage(c, 'Contacted')}
                                title="Move back to Contacted"
                                className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg cursor-pointer transition-all disabled:opacity-50"
                              >
                                <ArrowLeftCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                disabled={movingId === c._id}
                                onClick={() => moveStage(c, 'Won')}
                                className="flex-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg py-1.5 flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Won
                              </button>
                              <button
                                disabled={movingId === c._id}
                                onClick={() => moveStage(c, 'Lost')}
                                className="flex-1 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg py-1.5 flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                              >
                                <XCircle className="w-3 h-3" /> Lost
                              </button>
                            </>
                          )}
                          {(stage === 'Won' || stage === 'Lost') && (
                            <button
                              disabled={movingId === c._id}
                              onClick={() => moveStage(c, 'Negotiation')}
                              className="flex-1 text-[10px] font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-lg py-1.5 flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                            >
                              <RotateCcw className="w-3 h-3" /> Reopen
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {stageCustomers.length === 0 && (
                      <div className="text-center text-[10px] text-slate-400 font-semibold py-6 border border-dashed border-slate-200 rounded-xl">
                        No customers
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'directory' && (
      <>
      {/* Search & filter */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex items-center space-x-2.5 flex-1">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email, company, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
        >
          <option value="All">All Lead Statuses</option>
          {LEAD_STATUSES.map(st => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Company</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Status</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quotations</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(c => (
                <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-800 truncate">{c.name}</p>
                      <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 shrink-0" /> {c.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-slate-600">
                    {c.company ? (
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {c.company}
                      </span>
                    ) : '--'}
                  </td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-slate-600">
                    {c.phone ? (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {c.phone}
                      </span>
                    ) : '--'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${LEAD_STATUS_STYLES[normalizeStage(c.leadStatus)]}`}>
                      {normalizeStage(c.leadStatus)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {quotationCountFor(c.email)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                      c.isBlocked
                        ? 'bg-red-50 text-red-600 border-red-100'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {c.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEditForm(c)}
                        title="Edit customer"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer transition-all"
                      >
                        <UserCog className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleBlocked(c)}
                        title={c.isBlocked ? 'Unblock customer' : 'Block customer'}
                        className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                          c.isBlocked
                            ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            : 'border-red-200 text-red-500 hover:bg-red-50'
                        }`}
                      >
                        {c.isBlocked
                          ? <UserCheck2 className="w-3.5 h-3.5" />
                          : <UserX className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(c)}
                        title="Delete customer"
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
                    No customers match this search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2.5 bg-red-50 rounded-xl shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-800">Delete Customer?</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              This will permanently delete <span className="font-bold text-slate-700">{deleteTarget.name}</span> from the database. This action cannot be undone.
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
