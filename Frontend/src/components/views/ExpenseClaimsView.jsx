import React, { useState, useMemo } from 'react';
import { Wallet, Plus, Check, X, Ban, BadgeIndianRupee, ArrowLeft, Receipt, ImagePlus, Clock, CheckCircle2 } from 'lucide-react';

const CATEGORIES = ['Travel', 'Food & Meals', 'Office Supplies', 'Accommodation', 'Client Entertainment', 'Other'];
const APPROVER_ROLES = ['Manager', 'HR', 'Admin'];
const REIMBURSER_ROLES = ['HR', 'Admin'];

// No file-storage backend exists (see ProductsManagementView) — receipts are
// stored as base64 data URLs directly on the claim document, so keep them small.
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function money(n) {
  return `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function getStatusBadge(status) {
  switch (status) {
    case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'Reimbursed': return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'Rejected': return 'bg-red-50 text-red-700 border-red-100';
    case 'Cancelled': return 'bg-slate-100 text-slate-500 border-slate-200';
    default: return 'bg-amber-50 text-amber-700 border-amber-100';
  }
}

export default function ExpenseClaimsView({
  employee,
  expenseClaims = [],
  onAddExpenseClaim,
  onUpdateExpenseClaimStatus
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [description, setDescription] = useState('');
  const [receiptImage, setReceiptImage] = useState('');
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewComments, setReviewComments] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isApprover = APPROVER_ROLES.includes(employee.role);
  const isReimburser = REIMBURSER_ROLES.includes(employee.role);

  const myClaims = useMemo(
    () => expenseClaims.filter(c => c.employeeId === employee.id).slice().reverse(),
    [expenseClaims, employee.id]
  );

  const pendingApprovals = useMemo(
    () => expenseClaims.filter(c => c.status === 'Pending' && c.employeeId !== employee.id).slice().reverse(),
    [expenseClaims, employee.id]
  );

  const approvedAwaitingReimbursement = useMemo(
    () => expenseClaims.filter(c => c.status === 'Approved').slice().reverse(),
    [expenseClaims]
  );

  const totalPending = myClaims.filter(c => c.status === 'Pending').length;
  const totalReimbursed = expenseClaims
    .filter(c => c.status === 'Reimbursed' && (isApprover || c.employeeId === employee.id))
    .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  const resetForm = () => {
    setCategory(CATEGORIES[0]);
    setAmount('');
    setExpenseDate('');
    setDescription('');
    setReceiptImage('');
    setError('');
  };

  const handleReceiptChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file for the receipt.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('Receipt image must be under 2MB.');
      return;
    }
    setError('');
    setReceiptImage(await readImageAsDataUrl(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onAddExpenseClaim({ category, amount: Number(amount), expenseDate, description, receiptImage });
      setShowAddForm(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (claim) => {
    try {
      await onUpdateExpenseClaimStatus(claim.id, { status: 'Cancelled' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReview = async (claim, status) => {
    try {
      await onUpdateExpenseClaimStatus(claim.id, { status, reviewComments });
      setReviewingId(null);
      setReviewComments('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMarkReimbursed = async (claim) => {
    try {
      await onUpdateExpenseClaimStatus(claim.id, { status: 'Reimbursed' });
    } catch (err) {
      alert(err.message);
    }
  };

  if (showAddForm) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
        <button
          onClick={() => { setShowAddForm(false); resetForm(); }}
          className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 cursor-pointer transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Expense Claims</span>
        </button>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2.5">
            <Wallet className="w-5 h-5 text-blue-600" />
            <span>Submit Expense Claim</span>
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Amount (₹)</label>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Expense Date</label>
            <input
              type="date"
              required
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Description</label>
            <textarea
              rows="3"
              placeholder="What was this expense for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Receipt (optional)</label>
            <div className="flex items-center gap-3">
              {receiptImage && (
                <img src={receiptImage} alt="Receipt preview" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
              )}
              <label className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600 cursor-pointer transition-all flex items-center gap-1.5">
                <ImagePlus className="w-3.5 h-3.5" />
                {receiptImage ? 'Replace Receipt' : 'Attach Receipt'}
                <input type="file" accept="image/*" onChange={handleReceiptChange} className="hidden" />
              </label>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">Optional. Max 2MB.</p>
          </div>

          {error && (
            <p className="text-[11px] text-red-600 font-semibold bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
          )}

          <div className="flex items-center space-x-3.5 pt-2">
            <button
              type="button"
              onClick={() => { setShowAddForm(false); resetForm(); }}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/10 cursor-pointer transition-all disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit Claim'}
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
          <h2 className="text-xl font-bold text-slate-800">Expense Claims</h2>
          <p className="text-xs text-slate-500 mt-1">File and track reimbursement for work-related expenses.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md shadow-blue-500/10 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Claim</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400">
            <Receipt className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">My Claims</span>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-2">{myClaims.length}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Pending</span>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{totalPending}</p>
        </div>
        {isApprover && (
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <BadgeIndianRupee className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-wider">Awaiting Approval</span>
            </div>
            <p className="text-2xl font-black text-slate-800 mt-2">{pendingApprovals.length}</p>
          </div>
        )}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Total Reimbursed</span>
          </div>
          <p className="text-2xl font-black text-blue-600 mt-2">{money(totalReimbursed)}</p>
        </div>
      </div>

      {isApprover && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Pending Approvals</h3>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-md">
              {pendingApprovals.length}
            </span>
          </div>

          {pendingApprovals.length === 0 ? (
            <p className="text-xs text-slate-400 font-semibold py-6 text-center">No pending expense claims to review.</p>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map(c => (
                <div key={c.id} className="border border-slate-100 rounded-xl p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-xs text-slate-800">{c.employeeName || c.employeeId}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{c.department}</p>
                      <p className="text-[10px] text-slate-500 mt-1.5">
                        <span className="font-bold text-slate-700">{c.category}</span> · {money(c.amount)} · {c.expenseDate}
                      </p>
                      {c.description && <p className="text-[11px] text-slate-500 mt-1.5 italic">"{c.description}"</p>}
                      {c.receiptImage && (
                        <a href={c.receiptImage} target="_blank" rel="noreferrer" className="inline-block mt-2 text-[10px] font-bold text-blue-600 hover:underline">
                          View Receipt
                        </a>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      {reviewingId === c.id ? (
                        <>
                          <input
                            type="text"
                            placeholder="Remarks (optional)"
                            value={reviewComments}
                            onChange={(e) => setReviewComments(e.target.value)}
                            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-800 focus:outline-none focus:border-blue-500 w-40"
                          />
                          <button
                            onClick={() => handleReview(c, 'Approved')}
                            className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg border border-emerald-200 cursor-pointer transition-all active:scale-95"
                            title="Approve"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleReview(c, 'Rejected')}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 cursor-pointer transition-all active:scale-95"
                            title="Reject"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => { setReviewingId(null); setReviewComments(''); }}
                            className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer px-1"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setReviewingId(c.id)}
                          className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-[10px] rounded-lg border border-blue-200 cursor-pointer transition-all active:scale-95"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isReimburser && approvedAwaitingReimbursement.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">Approved — Awaiting Reimbursement</h3>
          <div className="space-y-2.5">
            {approvedAwaitingReimbursement.map(c => (
              <div key={c.id} className="flex items-center justify-between gap-3 border border-slate-100 rounded-xl px-4 py-3">
                <div>
                  <p className="text-xs font-bold text-slate-800">{c.employeeName || c.employeeId}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{c.category} · {money(c.amount)}</p>
                </div>
                <button
                  onClick={() => handleMarkReimbursed(c)}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-[10px] rounded-lg border border-blue-200 cursor-pointer transition-all active:scale-95"
                >
                  Mark Reimbursed
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-4">My Expense Claims</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                <th className="py-3 pr-4 font-extrabold">Category</th>
                <th className="py-3 pr-4 font-extrabold">Date</th>
                <th className="py-3 pr-4 font-extrabold">Amount</th>
                <th className="py-3 pr-4 font-extrabold">Description</th>
                <th className="py-3 pr-4 font-extrabold">Status</th>
                <th className="py-3 font-extrabold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {myClaims.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                    No expense claims filed yet.
                  </td>
                </tr>
              )}
              {myClaims.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 pr-4 text-slate-800 font-bold">{c.category}</td>
                  <td className="py-3.5 pr-4 text-slate-600">{c.expenseDate}</td>
                  <td className="py-3.5 pr-4 text-slate-700 font-mono">{money(c.amount)}</td>
                  <td className="py-3.5 pr-4 text-slate-500 max-w-48 truncate" title={c.description}>{c.description || '--'}</td>
                  <td className="py-3.5 pr-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(c.status)}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5">
                    {c.status === 'Pending' && (
                      <button
                        onClick={() => handleCancel(c)}
                        className="flex items-center space-x-1 text-[10px] font-bold text-red-500 hover:text-red-600 cursor-pointer"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
