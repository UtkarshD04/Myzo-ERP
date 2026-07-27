import React, { useState } from 'react';
import { Plus, Search, Trash2, FileSpreadsheet, IndianRupee, Info, ArrowLeft, FileEdit, Send, Users, Mail, User, Ban, CheckCircle2, ChevronDown, MoreHorizontal, SlidersHorizontal, Share2, Printer, ChevronLeft, ChevronRight, Package, Download, MessageCircle, ArrowRightLeft, BellRing } from 'lucide-react';
import { downloadDocumentPdf } from '../../utils/documentPdf';

const EMPTY_ITEM = { productId: '', productName: '', model: '', quantity: 1, unitPrice: 0, discount: 0 };

const STATUS_STYLES = {
  Draft: 'bg-slate-50 text-slate-600 border-slate-100',
  Sent: 'bg-blue-50 text-blue-600 border-blue-100',
  Accepted: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Rejected: 'bg-red-50 text-red-600 border-red-100'
};

const STATUS_TEXT_STYLES = {
  Draft: 'text-slate-500',
  Sent: 'text-blue-600',
  Accepted: 'text-emerald-600',
  Rejected: 'text-red-500'
};

const todayStr = () => new Date().toISOString().split('T')[0];
const generateQuoteId = () => `QUO-${Date.now().toString().slice(-6)}`;

function computeLineTotal(item) {
  const qty = Number(item.quantity) || 0;
  const price = Number(item.unitPrice) || 0;
  const discount = Number(item.discount) || 0;
  return Math.max(qty * price - discount, 0);
}

function computeTotals({ items, discountPercent, gstMode, cgstRate, sgstRate, igstRate, taxType, taxRate, adjustment }) {
  const subtotal = items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
  const afterLineDiscount = items.reduce((sum, it) => sum + computeLineTotal(it), 0);
  const overallDiscountAmount = afterLineDiscount * (Number(discountPercent) || 0) / 100;
  const afterOverallDiscount = afterLineDiscount - overallDiscountAmount;

  const isIGST = gstMode === 'igst';
  const cgstAmount = isIGST ? 0 : afterOverallDiscount * (Number(cgstRate) || 0) / 100;
  const sgstAmount = isIGST ? 0 : afterOverallDiscount * (Number(sgstRate) || 0) / 100;
  const igstAmount = isIGST ? afterOverallDiscount * (Number(igstRate) || 0) / 100 : 0;

  const rawTax = afterOverallDiscount * (Number(taxRate) || 0) / 100;
  const taxAmount = taxType === 'TCS' ? rawTax : 0;
  const totalAmount = afterOverallDiscount + cgstAmount + sgstAmount + igstAmount + taxAmount + (Number(adjustment) || 0);
  return { subtotal, overallDiscountAmount, cgstAmount, sgstAmount, igstAmount, taxAmount, totalAmount };
}

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const FOLLOW_UP_THRESHOLD_DAYS = 3;

function daysSince(dateStr) {
  if (!dateStr) return null;
  const diffMs = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

function isFollowUpDue(q) {
  if (q.status !== 'Sent') return false;
  const days = daysSince(q.sentAt || q.createdAt);
  return days !== null && days >= FOLLOW_UP_THRESHOLD_DAYS;
}

function MetaRow({ label, value }) {
  return (
    <div className="flex items-center justify-between md:justify-start md:gap-3">
      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider md:w-32 shrink-0">{label}</span>
      <span className="text-slate-700 font-semibold">{value}</span>
    </div>
  );
}

const EMPTY_FORM = {
  quoteId: '',
  referenceNumber: '',
  quoteDate: '',
  validUntil: '',
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  customerAddress: '',
  subject: '',
  discountPercent: 0,
  gstMode: 'split',
  cgstRate: 0,
  sgstRate: 0,
  igstRate: 0,
  taxType: 'None',
  taxRate: 0,
  adjustment: 0,
  customerNotes: 'Looking forward for your business.',
  termsAndConditions: ''
};

const EMPTY_CUSTOMER_FORM = { name: '', email: '' };

export default function QuotationsView({ employee, employees = [], quotations = [], products = [], customers = [], onAddQuotation, onUpdateQuotation, onSendFollowUp, onAddCustomer, onSetCustomerBlocked, onDeleteCustomer, onConvertToInvoice, setActiveTab }) {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [converting, setConverting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [followingUp, setFollowingUp] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState(EMPTY_FORM);
  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);

  const [showCustomers, setShowCustomers] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerForm, setCustomerForm] = useState(EMPTY_CUSTOMER_FORM);
  const [customerError, setCustomerError] = useState('');
  const [customerSubmitting, setCustomerSubmitting] = useState(false);

  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [showQuoteCustomerModal, setShowQuoteCustomerModal] = useState(false);
  const [quoteCustomerForm, setQuoteCustomerForm] = useState(EMPTY_CUSTOMER_FORM);
  const [quoteCustomerError, setQuoteCustomerError] = useState('');
  const [quoteCustomerSubmitting, setQuoteCustomerSubmitting] = useState(false);

  const matchingCustomers = customers.filter(c => {
    const q1 = form.customerName.trim().toLowerCase();
    if (!q1) return true;
    return c.name?.toLowerCase().includes(q1) || c.email?.toLowerCase().includes(q1);
  });

  const selectCustomerForQuote = (customer) => {
    setForm(prev => ({ ...prev, customerName: customer.name, customerEmail: customer.email }));
    setShowCustomerSuggestions(false);
  };

  const openQuoteCustomerModal = () => {
    setQuoteCustomerForm({ name: form.customerName.trim(), email: '' });
    setQuoteCustomerError('');
    setShowQuoteCustomerModal(true);
    setShowCustomerSuggestions(false);
  };

  const handleQuoteCustomerSubmit = async (e) => {
    e.preventDefault();
    setQuoteCustomerError('');

    if (!quoteCustomerForm.name.trim() || !quoteCustomerForm.email.trim()) {
      setQuoteCustomerError('Name and email are both required.');
      return;
    }

    setQuoteCustomerSubmitting(true);
    try {
      const name = quoteCustomerForm.name.trim();
      const email = quoteCustomerForm.email.trim();
      const updatedCustomers = await onAddCustomer({ name, email });
      const newCustomer = (updatedCustomers || []).find(c => c.email.toLowerCase() === email.toLowerCase()) || { name, email };
      selectCustomerForQuote(newCustomer);
      setShowQuoteCustomerModal(false);
      setQuoteCustomerForm(EMPTY_CUSTOMER_FORM);
    } catch (err) {
      setQuoteCustomerError(err.message);
    } finally {
      setQuoteCustomerSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const q1 = customerSearch.trim().toLowerCase();
    if (!q1) return true;
    return c.name?.toLowerCase().includes(q1) || c.email?.toLowerCase().includes(q1);
  });

  const openCustomerForm = () => {
    setCustomerForm(EMPTY_CUSTOMER_FORM);
    setCustomerError('');
    setShowCustomerForm(true);
  };

  const handleAddCustomerSubmit = async (e) => {
    e.preventDefault();
    setCustomerError('');

    if (!customerForm.name.trim() || !customerForm.email.trim()) {
      setCustomerError('Name and email are both required.');
      return;
    }

    setCustomerSubmitting(true);
    try {
      await onAddCustomer({ name: customerForm.name.trim(), email: customerForm.email.trim() });
      setShowCustomerForm(false);
      setCustomerForm(EMPTY_CUSTOMER_FORM);
    } catch (err) {
      setCustomerError(err.message);
    } finally {
      setCustomerSubmitting(false);
    }
  };

  const handleToggleBlockCustomer = async (customer) => {
    try {
      await onSetCustomerBlocked(customer._id, !customer.isBlocked);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCustomerClick = async (customer) => {
    if (!window.confirm(`Delete customer "${customer.name}"? This cannot be undone.`)) return;
    try {
      await onDeleteCustomer(customer._id);
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = quotations.filter(q => {
    const q1 = search.trim().toLowerCase();
    if (!q1) return true;
    return q.id?.toLowerCase().includes(q1) || q.customerName?.toLowerCase().includes(q1);
  });

  const resetForm = () => {
    setForm({ ...EMPTY_FORM, quoteId: generateQuoteId(), quoteDate: todayStr() });
    setItems([{ ...EMPTY_ITEM }]);
    setError('');
    setShowCustomerSuggestions(false);
    setShowQuoteCustomerModal(false);
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (q) => {
    setForm({
      quoteId: q.id,
      referenceNumber: q.referenceNumber || '',
      quoteDate: q.quoteDate || todayStr(),
      validUntil: q.validUntil || '',
      customerName: q.customerName || '',
      customerPhone: q.customerPhone || '',
      customerEmail: q.customerEmail || '',
      customerAddress: q.customerAddress || '',
      subject: q.subject || '',
      discountPercent: q.discountPercent || 0,
      gstMode: q.gstMode || 'split',
      cgstRate: q.cgstRate || 0,
      sgstRate: q.sgstRate || 0,
      igstRate: q.igstRate || 0,
      taxType: q.taxType || 'None',
      taxRate: q.taxRate || 0,
      adjustment: q.adjustment || 0,
      customerNotes: q.customerNotes || '',
      termsAndConditions: q.termsAndConditions || ''
    });
    setItems(
      q.items && q.items.length
        ? q.items.map(it => ({
            productId: it.productId || '',
            productName: it.productName || '',
            model: it.model || '',
            quantity: it.quantity ?? 1,
            unitPrice: it.unitPrice ?? 0,
            discount: it.discount ?? 0
          }))
        : [{ ...EMPTY_ITEM }]
    );
    setEditingId(q.id);
    setError('');
    setShowCustomerSuggestions(false);
    setShowDetailModal(null);
    setShowAddModal(true);
  };

  const updateItem = (index, patch) => {
    setItems(prev => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };

  const handleProductSelect = (index, productId) => {
    const product = products.find(p => p._id === productId);
    updateItem(index, {
      productId,
      productName: product ? `${product.series || ''} ${product.model || ''}`.trim() : '',
      model: product?.model || ''
    });
  };

  const addItemRow = () => setItems(prev => [...prev, { ...EMPTY_ITEM }]);
  const removeItemRow = (index) => setItems(prev => prev.filter((_, i) => i !== index));

  const totals = computeTotals({
    items,
    discountPercent: form.discountPercent,
    gstMode: form.gstMode,
    cgstRate: form.cgstRate,
    sgstRate: form.sgstRate,
    igstRate: form.igstRate,
    taxType: form.taxType,
    taxRate: form.taxRate,
    adjustment: form.adjustment
  });

  const handleSubmit = async (e, action = 'draft') => {
    e.preventDefault();
    setError('');

    const validItems = items.filter(it => it.productId && Number(it.quantity) > 0);
    if (validItems.length === 0) {
      setError('Add at least one product line item.');
      return;
    }

    if (action === 'send' && !form.customerEmail) {
      setError('Customer email is required to send this quotation.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        id: form.quoteId,
        referenceNumber: form.referenceNumber,
        quoteDate: form.quoteDate,
        validUntil: form.validUntil,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail,
        customerAddress: form.customerAddress,
        salesperson: employee.id,
        salespersonName: employee.name,
        subject: form.subject,
        items: validItems,
        discountPercent: form.discountPercent,
        gstMode: form.gstMode,
        cgstRate: form.gstMode === 'igst' ? 0 : form.cgstRate,
        sgstRate: form.gstMode === 'igst' ? 0 : form.sgstRate,
        igstRate: form.gstMode === 'igst' ? form.igstRate : 0,
        taxType: form.taxType,
        taxRate: form.taxRate,
        adjustment: form.adjustment,
        customerNotes: form.customerNotes,
        termsAndConditions: form.termsAndConditions
      };

      if (editingId) {
        await onUpdateQuotation(editingId, payload);
      } else {
        const response = await onAddQuotation({
          ...payload,
          createdBy: employee.id,
          createdByName: employee.name,
          sendToCustomer: action === 'send'
        });

        if (action === 'send') {
          if (response?.emailError) {
            alert(`Saved as Draft — email to the customer could not be sent: ${response.emailError}`);
          } else {
            alert(`Quotation emailed to ${form.customerEmail}.`);
          }
        }
      }

      setShowAddModal(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (quotationId, status) => {
    try {
      await onUpdateQuotation(quotationId, { status });
      setShowDetailModal(prev => (prev && prev.id === quotationId ? { ...prev, status } : prev));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSendFollowUp = async (q) => {
    setFollowingUp(true);
    try {
      const response = await onSendFollowUp(q.id);
      const updated = response?.quotations?.find(x => x.id === q.id);
      if (updated) setShowDetailModal(prev => (prev && prev.id === q.id ? updated : prev));
      if (response?.emailError) {
        alert(`Follow-up logged, but the email could not be sent: ${response.emailError}`);
      } else {
        alert(response?.emailSent ? `Follow-up emailed to ${q.customerEmail}.` : 'Follow-up logged.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setFollowingUp(false);
    }
  };

  const handleConvertToInvoice = async (quotationId) => {
    setConverting(true);
    try {
      const invoice = await onConvertToInvoice(quotationId);
      setShowDetailModal(prev => (prev && prev.id === quotationId ? { ...prev, invoiceId: invoice.id } : prev));
      alert(`Invoice ${invoice.id} created from this quote.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setConverting(false);
    }
  };

  const buildShareText = (q) => {
    const lines = [
      `Quotation ${q.id}`,
      `Customer: ${q.customerName}`,
      '',
      ...(q.items || []).map(it => `${it.productName} x ${it.quantity} = ${money(it.lineTotal)}`),
      '',
      `Total: ${money(q.totalAmount)}`,
      q.validUntil ? `Valid until: ${q.validUntil}` : null
    ].filter(Boolean);
    return lines.join('\n');
  };

  const shareViaWhatsApp = (q) => {
    const text = encodeURIComponent(buildShareText(q));
    const digits = (q.customerPhone || '').replace(/\D/g, '');
    const phone = digits ? (digits.length === 10 ? `91${digits}` : digits) : '';
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    setShowShareMenu(false);
  };

  const shareViaEmail = (q) => {
    const subject = encodeURIComponent(`Quotation ${q.id} from MYZO`);
    const body = encodeURIComponent(buildShareText(q));
    window.location.href = `mailto:${q.customerEmail || ''}?subject=${subject}&body=${body}`;
    setShowShareMenu(false);
  };

  const tabBar = (
    <div className="bg-white border-b border-slate-200 px-4 md:px-6">
      <div className="flex items-center gap-6 overflow-x-auto text-[13px] font-semibold">
        <button
          onClick={() => { setShowCustomers(true); setShowCustomerForm(false); }}
          className={`py-3 border-b-2 -mb-px whitespace-nowrap cursor-pointer transition-colors ${
            showCustomers ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          Customers
        </button>
        <button
          onClick={() => { setShowCustomers(false); setShowAddModal(false); setShowDetailModal(null); }}
          className={`py-3 border-b-2 -mb-px whitespace-nowrap cursor-pointer transition-colors ${
            !showCustomers ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'
          }`}
        >
          Quotes
        </button>
        <span className="py-3 whitespace-nowrap text-slate-300 cursor-not-allowed select-none flex items-center gap-1">
          Sales Orders <ChevronDown className="w-3 h-3" />
        </span>
      </div>
    </div>
  );

  if (showCustomers) {
    if (showCustomerForm) {
      return (
        <div className="max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
          {tabBar}
          <div className="p-4 md:p-6 space-y-6 max-w-lg mx-auto">
          <button
            onClick={() => setShowCustomerForm(false)}
            className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 cursor-pointer transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Customers</span>
          </button>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2.5">
              <Users className="w-5 h-5 text-blue-600" />
              <span>New Customer</span>
            </h2>

            {customerError && (
              <div className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
                {customerError}
              </div>
            )}

            <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Customer name"
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="Customer email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={customerSubmitting}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/10 cursor-pointer transition-all disabled:opacity-60"
                >
                  {customerSubmitting ? 'Saving...' : 'Save Customer'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomerForm(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs cursor-pointer transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
        {tabBar}
        <div className="p-4 md:p-6 space-y-4">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-[15px] font-bold text-slate-800 select-none">
            <span>All Customers</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg overflow-hidden shadow-sm shadow-blue-500/10">
              <button
                onClick={openCustomerForm}
                className="pl-3.5 pr-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
              <div className="px-2 py-2 bg-blue-600 border-l border-blue-500/60 text-white/70 cursor-not-allowed select-none">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 cursor-not-allowed select-none">
              <MoreHorizontal className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center space-x-2.5">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            className="flex-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="pl-5 pr-2 py-3 w-8"><input type="checkbox" className="rounded border-slate-300" /></th>
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCustomers.map(c => (
                  <tr key={c._id || c.email} className="hover:bg-slate-50/60 transition-colors">
                    <td className="pl-5 pr-2 py-3.5"><input type="checkbox" className="rounded border-slate-300" /></td>
                    <td className="px-5 py-3.5 text-xs font-bold text-slate-800">{c.name}</td>
                    <td className="px-5 py-3.5 text-xs font-semibold text-slate-500">{c.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                        c.isBlocked ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {c.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleToggleBlockCustomer(c)}
                          className={`flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-all ${
                            c.isBlocked ? 'text-emerald-600 hover:text-emerald-700' : 'text-amber-600 hover:text-amber-700'
                          }`}
                        >
                          {c.isBlocked ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          <span>{c.isBlocked ? 'Unblock' : 'Block'}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCustomerClick(c)}
                          className="flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600 cursor-pointer transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-xs text-slate-400 font-semibold">
                      No customers yet. Add your first one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    );
  }

  if (showAddModal) {
    return (
      <div className="max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
        {tabBar}
        <div className="p-4 md:p-6 space-y-6">
        <button
          onClick={() => { setShowAddModal(false); setEditingId(null); }}
          className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 cursor-pointer transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Quotations</span>
        </button>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2.5">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <span>{editingId ? 'Edit Quotation' : 'Create Quotation'}</span>
          </h2>
          <span className="font-mono text-xs font-bold text-blue-500 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
            {form.quoteId}
          </span>
        </div>

        {error && (
          <div className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
            {error}
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, 'draft')}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Main document column */}
            <div className="lg:col-span-8 space-y-6">

              {/* Customer & quote meta */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Customer &amp; Quote Details</h3>

                <div className="relative">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Customer Name *</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Select or add a customer"
                      value={form.customerName}
                      autoComplete="off"
                      onFocus={() => setShowCustomerSuggestions(true)}
                      onChange={(e) => { setForm({ ...form, customerName: e.target.value }); setShowCustomerSuggestions(true); }}
                      onBlur={() => setTimeout(() => setShowCustomerSuggestions(false), 150)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {showCustomerSuggestions && (
                    <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                      <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); openQuoteCustomerModal(); }}
                        className="w-full flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 border-b border-slate-100 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New Customer</span>
                      </button>
                      <div className="max-h-44 overflow-y-auto">
                        {matchingCustomers.length === 0 ? (
                          <div className="px-3 py-2.5 text-[11px] text-slate-400 font-semibold">No matching customers</div>
                        ) : (
                          matchingCustomers.map(c => (
                            <button
                              type="button"
                              key={c._id}
                              onMouseDown={(e) => { e.preventDefault(); selectCustomerForQuote(c); }}
                              className="w-full text-left px-3 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-b-0"
                            >
                              <p className="text-xs font-bold text-slate-800">{c.name}</p>
                              <p className="text-[10px] text-slate-400">{c.email}</p>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-50 pt-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Reference #</label>
                    <input
                      type="text"
                      value={form.referenceNumber}
                      onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Quote Date *</label>
                    <input
                      type="date"
                      required
                      value={form.quoteDate}
                      onChange={(e) => setForm({ ...form, quoteDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={form.validUntil}
                      onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center space-x-1">
                    <span>Subject</span>
                    <Info className="w-3 h-3 text-slate-300" />
                  </label>
                  <input
                    type="text"
                    placeholder="Let your customer know what this Quote is for"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Item table */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Item Table</h3>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add New Row</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-140">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                        <th className="py-2 pr-3 font-extrabold">Product</th>
                        <th className="py-2 pr-3 font-extrabold text-center w-20">Qty</th>
                        <th className="py-2 pr-3 font-extrabold text-right w-28">Rate</th>
                        <th className="py-2 pr-3 font-extrabold text-right w-28">Discount</th>
                        <th className="py-2 pr-3 font-extrabold text-right w-28">Amount</th>
                        <th className="py-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td className="py-2.5 pr-3">
                            <select
                              value={item.productId}
                              onChange={(e) => handleProductSelect(index, e.target.value)}
                              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-800 focus:outline-none focus:border-blue-500"
                            >
                              <option value="">Select product...</option>
                              {products.map(p => (
                                <option key={p._id} value={p._id}>{p.series} {p.model}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2.5 pr-3">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, { quantity: e.target.value })}
                              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-800 text-center focus:outline-none focus:border-blue-500"
                            />
                          </td>
                          <td className="py-2.5 pr-3">
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => updateItem(index, { unitPrice: e.target.value })}
                              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-800 text-right focus:outline-none focus:border-blue-500"
                            />
                          </td>
                          <td className="py-2.5 pr-3">
                            <input
                              type="number"
                              min="0"
                              value={item.discount}
                              onChange={(e) => updateItem(index, { discount: e.target.value })}
                              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-800 text-right focus:outline-none focus:border-blue-500"
                            />
                          </td>
                          <td className="py-2.5 pr-3 text-right font-mono font-bold text-slate-700 whitespace-nowrap">
                            {money(computeLineTotal(item))}
                          </td>
                          <td className="py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => removeItemRow(index)}
                              disabled={items.length === 1}
                              className="text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes & terms */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Customer Notes</label>
                  <textarea
                    rows="3"
                    value={form.customerNotes}
                    onChange={(e) => setForm({ ...form, customerNotes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Terms &amp; Conditions</label>
                  <textarea
                    rows="3"
                    placeholder="Enter the terms and conditions of your business..."
                    value={form.termsAndConditions}
                    onChange={(e) => setForm({ ...form, termsAndConditions: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Sidebar: salesperson + totals + actions */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">

              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Salesperson</h3>
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                  <span className="text-xs font-semibold text-slate-700">
                    {employee.name} <span className="text-slate-400 font-medium">({employee.designation || employee.role})</span>
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider shrink-0 ml-2">You</span>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2.5 text-xs font-semibold text-slate-600">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Summary</h3>

                <div className="flex items-center justify-between">
                  <span>Sub Total</span>
                  <span className="font-mono font-bold text-slate-800">{money(totals.subtotal)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Discount</span>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.discountPercent}
                      onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                      className="w-14 px-1.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-right focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-[10px]">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 pt-2.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">GST Type</span>
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, gstMode: 'split' })}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                        form.gstMode === 'split' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      CGST + SGST
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, gstMode: 'igst' })}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                        form.gstMode === 'igst' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      IGST
                    </button>
                  </div>
                </div>

                {form.gstMode === 'split' ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span>CGST</span>
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="number"
                          min="0"
                          value={form.cgstRate}
                          onChange={(e) => setForm({ ...form, cgstRate: e.target.value })}
                          className="w-14 px-1.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-right focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-[10px]">%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>SGST</span>
                      <div className="flex items-center space-x-1.5">
                        <input
                          type="number"
                          min="0"
                          value={form.sgstRate}
                          onChange={(e) => setForm({ ...form, sgstRate: e.target.value })}
                          className="w-14 px-1.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-right focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-[10px]">%</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <span>IGST</span>
                    <div className="flex items-center space-x-1.5">
                      <input
                        type="number"
                        min="0"
                        value={form.igstRate}
                        onChange={(e) => setForm({ ...form, igstRate: e.target.value })}
                        className="w-14 px-1.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-right focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-[10px]">%</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {['None', 'TCS'].map(t => (
                      <label key={t} className="flex items-center space-x-1 cursor-pointer">
                        <input
                          type="radio"
                          checked={form.taxType === t}
                          onChange={() => setForm({ ...form, taxType: t })}
                        />
                        <span className="text-[10px]">{t}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="number"
                      min="0"
                      disabled={form.taxType === 'None'}
                      value={form.taxRate}
                      onChange={(e) => setForm({ ...form, taxRate: e.target.value })}
                      className="w-14 px-1.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-right focus:outline-none focus:border-blue-500 disabled:opacity-40"
                    />
                    <span className="text-[10px]">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>Adjustment</span>
                  <input
                    type="number"
                    value={form.adjustment}
                    onChange={(e) => setForm({ ...form, adjustment: e.target.value })}
                    className="w-24 px-1.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-right focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 pt-2.5 text-sm">
                  <span className="font-black text-slate-700 flex items-center">
                    <IndianRupee className="w-3.5 h-3.5 mr-1 text-blue-600" />
                    Total
                  </span>
                  <span className="font-mono font-black text-blue-600">{money(totals.totalAmount)}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-2.5">
                {editingId ? (
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, 'save')}
                    disabled={submitting}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/10 cursor-pointer transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, 'send')}
                      disabled={submitting}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/10 cursor-pointer transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {submitting ? 'Sending...' : 'Send to Customer'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, 'draft')}
                      disabled={submitting}
                      className="w-full py-2.5 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-lg shadow-slate-500/10 cursor-pointer transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      {submitting ? 'Saving...' : 'Save as Draft'}
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingId(null); }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs cursor-pointer transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>

        {showQuoteCustomerModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-100 rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2.5 bg-blue-50 rounded-xl shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-800">New Customer</h3>
              </div>

              {quoteCustomerError && (
                <div className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5 mb-3">
                  {quoteCustomerError}
                </div>
              )}

              <form onSubmit={handleQuoteCustomerSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Customer name"
                      value={quoteCustomerForm.name}
                      onChange={(e) => setQuoteCustomerForm({ ...quoteCustomerForm, name: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="Customer email"
                      value={quoteCustomerForm.email}
                      onChange={(e) => setQuoteCustomerForm({ ...quoteCustomerForm, email: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowQuoteCustomerModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={quoteCustomerSubmitting}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/10 cursor-pointer transition-all disabled:opacity-60"
                  >
                    {quoteCustomerSubmitting ? 'Saving...' : 'Save Customer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        </div>
      </div>
    );
  }

  if (showDetailModal) {
    const q = showDetailModal;
    const currentIndex = filtered.findIndex(x => x.id === q.id);
    const prevQuote = currentIndex > 0 ? filtered[currentIndex - 1] : null;
    const nextQuote = currentIndex >= 0 && currentIndex < filtered.length - 1 ? filtered[currentIndex + 1] : null;

    return (
      <div className="max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
        {tabBar}
        <div className="p-4 md:p-6 space-y-4">

          {/* Top toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={() => setShowDetailModal(null)}
              className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 cursor-pointer transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Quotations</span>
            </button>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => openEditModal(q)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600 cursor-pointer transition-all"
              >
                <FileEdit className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => handleStatusChange(q.id, 'Sent')}
                disabled={!q.customerEmail}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
              {q.status === 'Sent' && (
                <button
                  onClick={() => handleSendFollowUp(q)}
                  disabled={followingUp}
                  className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-bold cursor-pointer transition-all disabled:opacity-60 ${
                    isFollowUpDue(q)
                      ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  <BellRing className="w-3.5 h-3.5" /> {followingUp ? 'Sending...' : 'Follow Up'}
                </button>
              )}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowShareMenu(v => !v)}
                  onBlur={() => setTimeout(() => setShowShareMenu(false), 150)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600 cursor-pointer transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
                {showShareMenu && (
                  <div className="absolute z-10 mt-1 right-0 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden w-44">
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); shareViaWhatsApp(q); }}
                      className="w-full flex items-center gap-2 text-left px-3 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-500" /> Share via WhatsApp
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); shareViaEmail(q); }}
                      disabled={!q.customerEmail}
                      className="w-full flex items-center gap-2 text-left px-3 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Mail className="w-3.5 h-3.5 text-blue-500" /> Share via Email
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => downloadDocumentPdf({ type: 'QUOTATION', doc: q })}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600 cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
              <button
                onClick={() => window.print()}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 cursor-pointer transition-all"
                title="Print"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* What's Next banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3.5 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                {q.invoiceId
                  ? `Converted to invoice ${q.invoiceId}.`
                  : "What's Next? Convert this quote to an invoice."}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {q.invoiceId ? (
                <button
                  onClick={() => setActiveTab && setActiveTab('invoices')}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" /> View Invoice
                </button>
              ) : (
                <button
                  onClick={() => handleConvertToInvoice(q.id)}
                  disabled={converting}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-all disabled:opacity-60 flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" /> {converting ? 'Converting...' : 'Convert to Invoice'}
                </button>
              )}
            </div>
          </div>

          {/* Follow-up status banner */}
          {q.status === 'Sent' && (
            <div className={`rounded-2xl px-5 py-3.5 flex items-center justify-between flex-wrap gap-3 border ${
              isFollowUpDue(q) ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'
            }`}>
              <div className={`flex items-center gap-2 text-xs font-bold ${isFollowUpDue(q) ? 'text-amber-700' : 'text-slate-500'}`}>
                <BellRing className="w-4 h-4 shrink-0" />
                <span>
                  {isFollowUpDue(q)
                    ? `Follow-up due — pending ${daysSince(q.sentAt || q.createdAt)} day(s) since it was sent.`
                    : `Sent ${daysSince(q.sentAt || q.createdAt)} day(s) ago. Follow-up reminders kick in after ${FOLLOW_UP_THRESHOLD_DAYS} days of no response.`}
                  {q.followUpCount > 0 && ` (${q.followUpCount} follow-up${q.followUpCount > 1 ? 's' : ''} sent${q.lastFollowUpAt ? `, last on ${new Date(q.lastFollowUpAt).toLocaleDateString('en-IN')}` : ''})`}
                </span>
              </div>
            </div>
          )}

          {/* Details tab */}
          <div className="flex items-center gap-5 text-xs font-bold border-b border-slate-100">
            <span className="text-blue-600 border-b-2 border-blue-600 pb-2.5 -mb-px cursor-default">Details</span>
          </div>

          {/* Main document card */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">

            {/* Header row: id, status, total */}
            <div className="flex items-start justify-between flex-wrap gap-3 border-b border-slate-50 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-black text-slate-800">{q.id}</span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowStatusMenu(v => !v)}
                    onBlur={() => setTimeout(() => setShowStatusMenu(false), 150)}
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border cursor-pointer transition-all ${STATUS_STYLES[q.status] || STATUS_STYLES.Draft}`}
                  >
                    {q.status}
                  </button>
                  {showStatusMenu && (
                    <div className="absolute z-10 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden w-32">
                      {['Draft', 'Sent', 'Accepted', 'Rejected'].map(st => (
                        <button
                          key={st}
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); handleStatusChange(q.id, st); setShowStatusMenu(false); }}
                          className="w-full text-left px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
                <p className="text-lg font-black text-slate-800">{money(q.totalAmount)}</p>
              </div>
            </div>

            {/* Meta info grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
              <MetaRow label="Quote Type" value="Goods" />
              <MetaRow label="Quote Number" value={q.id} />
              <MetaRow label="Quote Date" value={q.quoteDate || '--'} />
              <MetaRow label="Creation Date" value={q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-IN') : (q.quoteDate || '--')} />
              <MetaRow label="Salesperson" value={q.salespersonName || '--'} />
              <MetaRow label="Expiry Date" value={q.validUntil || '--'} />
              <MetaRow label="PDF Template" value="Standard Template" />
              {q.referenceNumber && <MetaRow label="Reference #" value={q.referenceNumber} />}
            </div>

            {/* Customer Details */}
            <div className="border-t border-slate-50 pt-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Customer Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Name</p>
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-500" /> {q.customerName}
                  </p>
                  {q.customerEmail && <p className="text-slate-400 text-[11px] mt-0.5">{q.customerEmail}</p>}
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Billing Address</p>
                  <p className="text-slate-600 font-semibold leading-relaxed whitespace-pre-line">
                    {q.customerAddress || '-'}
                    {q.customerPhone && <><br />{q.customerPhone}</>}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Shipping Address</p>
                  <p className="text-slate-400 font-semibold">-</p>
                </div>
              </div>
              {q.subject && (
                <p className="text-xs text-slate-600 mt-3 font-semibold italic">"{q.subject}"</p>
              )}
            </div>

            {/* Items table */}
            <div className="border-t border-slate-50 pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-2 pr-3 font-extrabold w-10">S.NO</th>
                      <th className="py-2 pr-3 font-extrabold">Item</th>
                      <th className="py-2 pr-3 font-extrabold text-center w-20">Qty</th>
                      <th className="py-2 pr-3 font-extrabold text-right w-28">Price</th>
                      <th className="py-2 font-extrabold text-right w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(q.items || []).map((item, i) => (
                      <tr key={i}>
                        <td className="py-3 pr-3 text-slate-400 font-semibold">{i + 1}</td>
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                              <Package className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                            <div>
                              <p className="font-bold text-blue-600">{item.productName}</p>
                              {item.model && <p className="text-[10px] text-slate-400">{item.model}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-center text-slate-600 font-semibold">{item.quantity}</td>
                        <td className="py-3 pr-3 text-right text-slate-600 font-semibold">{money(item.unitPrice)}</td>
                        <td className="py-3 text-right font-mono font-bold text-slate-800">{money(item.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mt-3">
                <div className="w-full max-w-xs space-y-1.5 text-xs font-semibold text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Sub Total</span>
                    <span className="font-mono font-bold text-slate-800">{money(q.subtotal)}</span>
                  </div>
                  {!!q.discountTotal && (
                    <div className="flex items-center justify-between text-red-500">
                      <span>Discount {q.discountPercent ? `(${q.discountPercent}%)` : ''}</span>
                      <span className="font-mono font-bold">-{money(q.discountTotal)}</span>
                    </div>
                  )}
                  {!!q.cgstRate && (
                    <div className="flex items-center justify-between">
                      <span>CGST ({q.cgstRate}%)</span>
                      <span className="font-mono font-bold text-slate-800">{money(q.cgstAmount)}</span>
                    </div>
                  )}
                  {!!q.sgstRate && (
                    <div className="flex items-center justify-between">
                      <span>SGST ({q.sgstRate}%)</span>
                      <span className="font-mono font-bold text-slate-800">{money(q.sgstAmount)}</span>
                    </div>
                  )}
                  {!!q.igstRate && (
                    <div className="flex items-center justify-between">
                      <span>IGST ({q.igstRate}%)</span>
                      <span className="font-mono font-bold text-slate-800">{money(q.igstAmount)}</span>
                    </div>
                  )}
                  {q.taxType && q.taxType !== 'None' && (
                    <div className="flex items-center justify-between">
                      <span>{q.taxType} ({q.taxRate}%)</span>
                      <span className="font-mono font-bold text-slate-800">{money(q.taxAmount)}</span>
                    </div>
                  )}
                  {!!q.adjustment && (
                    <div className="flex items-center justify-between">
                      <span>Adjustment</span>
                      <span className="font-mono font-bold text-slate-800">{money(q.adjustment)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm border-t border-slate-200 pt-2 mt-1">
                    <span className="font-black text-slate-800">Total</span>
                    <span className="font-mono font-black text-blue-600">{money(q.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Recipients */}
            <div className="border-t border-slate-50 pt-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Email Recipients</h4>
              {q.customerEmail ? (
                <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {q.customerEmail}
                </span>
              ) : (
                <p className="text-xs text-slate-400 font-semibold">No recipients added.</p>
              )}
            </div>

            {/* Notes */}
            <div className="border-t border-slate-50 pt-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notes</h4>
              <p className="text-xs text-slate-500">
                {q.customerNotes || 'No notes added.'}
              </p>
            </div>

            {/* Terms and Conditions */}
            <div className="border-t border-slate-50 pt-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Terms and Conditions</h4>
              <p className="text-xs text-slate-400 font-semibold">
                {q.termsAndConditions || 'No Terms and Conditions'}
              </p>
            </div>
          </div>

          {/* Prev/Next navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => prevQuote && setShowDetailModal(prevQuote)}
              disabled={!prevQuote}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => nextQuote && setShowDetailModal(nextQuote)}
              disabled={!nextQuote}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
      {tabBar}
      <div className="p-4 md:p-6 space-y-4">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1.5 text-[15px] font-bold text-slate-800 select-none">
          <span>All Quotes</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg overflow-hidden shadow-sm shadow-blue-500/10">
            <button
              onClick={openAddModal}
              className="pl-3.5 pr-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
            <div className="px-2 py-2 bg-blue-600 border-l border-blue-500/60 text-white/70 cursor-not-allowed select-none">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 cursor-not-allowed select-none">
            <MoreHorizontal className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center space-x-2.5">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by quote number or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Quotations table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="pl-5 pr-2 py-3 w-8"><input type="checkbox" className="rounded border-slate-300" /></th>
                <th className="pr-3 py-3 w-8 text-slate-400"><SlidersHorizontal className="w-3.5 h-3.5" /></th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Quote Number</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference Number</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Name</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(q => (
                <tr
                  key={q.id}
                  onClick={() => setShowDetailModal(q)}
                  className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                >
                  <td className="pl-5 pr-2 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="rounded border-slate-300" />
                  </td>
                  <td className="pr-3 py-3.5"></td>
                  <td className="px-5 py-3.5 text-xs text-slate-500 font-semibold whitespace-nowrap">{q.quoteDate || '--'}</td>
                  <td className="px-5 py-3.5 text-xs font-bold text-blue-600 whitespace-nowrap">{q.id}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-500 font-semibold">{q.referenceNumber || '--'}</td>
                  <td className="px-5 py-3.5 text-xs font-bold text-amber-700">{q.customerName}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${STATUS_TEXT_STYLES[q.status] || STATUS_TEXT_STYLES.Draft}`}>
                        {q.status}
                      </span>
                      {isFollowUpDue(q) && (
                        <span
                          title={`Pending ${daysSince(q.sentAt || q.createdAt)} day(s) since sent`}
                          className="flex items-center gap-0.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-100"
                        >
                          <BellRing className="w-2.5 h-2.5" /> Follow-up
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-bold text-slate-800 font-mono text-right whitespace-nowrap">{money(q.totalAmount)}</td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-xs text-slate-400 font-semibold">
                    No quotations yet. Create your first one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      </div>
    </div>
  );
}
