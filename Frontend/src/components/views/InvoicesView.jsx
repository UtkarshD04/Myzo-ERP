import React, { useState } from 'react';
import { Search, ArrowLeft, ChevronDown, MoreHorizontal, SlidersHorizontal, Mail, User, Package, ChevronLeft, ChevronRight, Printer, Download } from 'lucide-react';
import { downloadDocumentPdf } from '../../utils/documentPdf';

const STATUS_STYLES = {
  Unpaid: 'bg-amber-50 text-amber-600 border-amber-100',
  Paid: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Overdue: 'bg-red-50 text-red-600 border-red-100',
  Cancelled: 'bg-slate-50 text-slate-500 border-slate-100'
};

const STATUS_TEXT_STYLES = {
  Unpaid: 'text-amber-600',
  Paid: 'text-emerald-600',
  Overdue: 'text-red-500',
  Cancelled: 'text-slate-400'
};

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

function MetaRow({ label, value }) {
  return (
    <div className="flex items-center justify-between md:justify-start md:gap-3">
      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider md:w-32 shrink-0">{label}</span>
      <span className="text-slate-700 font-semibold">{value}</span>
    </div>
  );
}

export default function InvoicesView({ employee, invoices = [], onUpdateInvoice }) {
  const [search, setSearch] = useState('');
  const [showDetail, setShowDetail] = useState(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const filtered = invoices.filter(inv => {
    const q1 = search.trim().toLowerCase();
    if (!q1) return true;
    return inv.id?.toLowerCase().includes(q1) || inv.customerName?.toLowerCase().includes(q1);
  });

  const handleStatusChange = async (invoiceId, status) => {
    try {
      await onUpdateInvoice(invoiceId, { status });
      setShowDetail(prev => (prev && prev.id === invoiceId ? { ...prev, status } : prev));
    } catch (err) {
      alert(err.message);
    }
  };

  const tabBar = (
    <div className="bg-white border-b border-slate-200 px-4 md:px-6">
      <div className="flex items-center gap-6 overflow-x-auto text-[13px] font-semibold">
        <span className="py-3 whitespace-nowrap text-blue-600 border-b-2 border-blue-600 -mb-px cursor-default">Invoices</span>
        <span className="py-3 whitespace-nowrap text-slate-300 cursor-not-allowed select-none">Payments Received</span>
        <span className="py-3 whitespace-nowrap text-slate-300 cursor-not-allowed select-none">Recurring Invoices</span>
        <span className="py-3 whitespace-nowrap text-slate-300 cursor-not-allowed select-none">Credit Notes</span>
      </div>
    </div>
  );

  if (showDetail) {
    const inv = showDetail;
    const currentIndex = filtered.findIndex(x => x.id === inv.id);
    const prevInvoice = currentIndex > 0 ? filtered[currentIndex - 1] : null;
    const nextInvoice = currentIndex >= 0 && currentIndex < filtered.length - 1 ? filtered[currentIndex + 1] : null;

    return (
      <div className="max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
        {tabBar}
        <div className="p-4 md:p-6 space-y-4">

          <div className="flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={() => setShowDetail(null)}
              className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 cursor-pointer transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Invoices</span>
            </button>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => downloadDocumentPdf({ type: 'INVOICE', doc: inv })}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600 cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-blue-300 hover:text-blue-600 cursor-pointer transition-all"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <button disabled className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-300 cursor-not-allowed select-none">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">

            <div className="flex items-start justify-between flex-wrap gap-3 border-b border-slate-50 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-black text-slate-800">{inv.id}</span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowStatusMenu(v => !v)}
                    onBlur={() => setTimeout(() => setShowStatusMenu(false), 150)}
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border cursor-pointer transition-all ${STATUS_STYLES[inv.status] || STATUS_STYLES.Unpaid}`}
                  >
                    {inv.status}
                  </button>
                  {showStatusMenu && (
                    <div className="absolute z-10 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden w-32">
                      {['Unpaid', 'Paid', 'Overdue', 'Cancelled'].map(st => (
                        <button
                          key={st}
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); handleStatusChange(inv.id, st); setShowStatusMenu(false); }}
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
                <p className="text-lg font-black text-slate-800">{money(inv.totalAmount)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
              <MetaRow label="Invoice Number" value={inv.id} />
              <MetaRow label="Invoice Date" value={inv.invoiceDate || '--'} />
              <MetaRow label="Due Date" value={inv.dueDate || '--'} />
              <MetaRow label="Salesperson" value={inv.salespersonName || '--'} />
              {inv.sourceQuotationId && <MetaRow label="From Quote" value={inv.sourceQuotationId} />}
              {inv.referenceNumber && <MetaRow label="Reference #" value={inv.referenceNumber} />}
            </div>

            <div className="border-t border-slate-50 pt-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Customer Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Name</p>
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-500" /> {inv.customerName}
                  </p>
                  {inv.customerEmail && <p className="text-slate-400 text-[11px] mt-0.5">{inv.customerEmail}</p>}
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Billing Address</p>
                  <p className="text-slate-600 font-semibold leading-relaxed whitespace-pre-line">
                    {inv.customerAddress || '-'}
                    {inv.customerPhone && <><br />{inv.customerPhone}</>}
                  </p>
                </div>
              </div>
            </div>

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
                    {(inv.items || []).map((item, i) => (
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

              <div className="flex justify-end mt-3">
                <div className="w-full max-w-xs space-y-1.5 text-xs font-semibold text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Sub Total</span>
                    <span className="font-mono font-bold text-slate-800">{money(inv.subtotal)}</span>
                  </div>
                  {!!inv.discountTotal && (
                    <div className="flex items-center justify-between text-red-500">
                      <span>Discount {inv.discountPercent ? `(${inv.discountPercent}%)` : ''}</span>
                      <span className="font-mono font-bold">-{money(inv.discountTotal)}</span>
                    </div>
                  )}
                  {!!inv.cgstRate && (
                    <div className="flex items-center justify-between">
                      <span>CGST ({inv.cgstRate}%)</span>
                      <span className="font-mono font-bold text-slate-800">{money(inv.cgstAmount)}</span>
                    </div>
                  )}
                  {!!inv.sgstRate && (
                    <div className="flex items-center justify-between">
                      <span>SGST ({inv.sgstRate}%)</span>
                      <span className="font-mono font-bold text-slate-800">{money(inv.sgstAmount)}</span>
                    </div>
                  )}
                  {!!inv.igstRate && (
                    <div className="flex items-center justify-between">
                      <span>IGST ({inv.igstRate}%)</span>
                      <span className="font-mono font-bold text-slate-800">{money(inv.igstAmount)}</span>
                    </div>
                  )}
                  {inv.taxType && inv.taxType !== 'None' && (
                    <div className="flex items-center justify-between">
                      <span>{inv.taxType} ({inv.taxRate}%)</span>
                      <span className="font-mono font-bold text-slate-800">{money(inv.taxAmount)}</span>
                    </div>
                  )}
                  {!!inv.adjustment && (
                    <div className="flex items-center justify-between">
                      <span>Adjustment</span>
                      <span className="font-mono font-bold text-slate-800">{money(inv.adjustment)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm border-t border-slate-200 pt-2 mt-1">
                    <span className="font-black text-slate-800">Total</span>
                    <span className="font-mono font-black text-blue-600">{money(inv.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-50 pt-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Email Recipients</h4>
              {inv.customerEmail ? (
                <span className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {inv.customerEmail}
                </span>
              ) : (
                <p className="text-xs text-slate-400 font-semibold">No recipients added.</p>
              )}
            </div>

            {inv.customerNotes && (
              <div className="border-t border-slate-50 pt-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notes</h4>
                <p className="text-xs text-slate-500">{inv.customerNotes}</p>
              </div>
            )}

            <div className="border-t border-slate-50 pt-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Terms and Conditions</h4>
              <p className="text-xs text-slate-400 font-semibold">
                {inv.termsAndConditions || 'No Terms and Conditions'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => prevInvoice && setShowDetail(prevInvoice)}
              disabled={!prevInvoice}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => nextInvoice && setShowDetail(nextInvoice)}
              disabled={!nextInvoice}
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
            <span>All Invoices</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center space-x-2.5">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by invoice number or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="pl-5 pr-2 py-3 w-8"><input type="checkbox" className="rounded border-slate-300" /></th>
                  <th className="pr-3 py-3 w-8 text-slate-400"><SlidersHorizontal className="w-3.5 h-3.5" /></th>
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Date</th>
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Number</th>
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Name</th>
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(inv => (
                  <tr
                    key={inv.id}
                    onClick={() => setShowDetail(inv)}
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                  >
                    <td className="pl-5 pr-2 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-slate-300" />
                    </td>
                    <td className="pr-3 py-3.5"></td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 font-semibold whitespace-nowrap">{inv.invoiceDate || '--'}</td>
                    <td className="px-5 py-3.5 text-xs font-bold text-blue-600 whitespace-nowrap">{inv.id}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 font-semibold whitespace-nowrap">{inv.dueDate || '--'}</td>
                    <td className="px-5 py-3.5 text-xs font-bold text-amber-700">{inv.customerName}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${STATUS_TEXT_STYLES[inv.status] || STATUS_TEXT_STYLES.Unpaid}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-bold text-slate-800 font-mono text-right whitespace-nowrap">{money(inv.totalAmount)}</td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-xs text-slate-400 font-semibold">
                      No invoices yet. Convert a quotation to create one.
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
