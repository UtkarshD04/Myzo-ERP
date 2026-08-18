import React, { useState } from 'react';
import { Search, ArrowLeft, ChevronDown, MoreHorizontal, SlidersHorizontal, User, Package, ChevronLeft, ChevronRight, Printer, ArrowRightLeft, Ban, Info } from 'lucide-react';
import { DEFAULT_TERMS_AND_CONDITIONS } from '../../utils/documentPdf';

const STATUS_STYLES = {
  Confirmed: 'bg-blue-50 text-blue-600 border-blue-100',
  Invoiced: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Cancelled: 'bg-slate-50 text-slate-500 border-slate-100'
};

const STATUS_TEXT_STYLES = {
  Confirmed: 'text-blue-600',
  Invoiced: 'text-emerald-600',
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

function canManage(employee, so) {
  if (!employee) return false;
  return employee.role === 'Admin' || employee.role === 'Manager' || so.salesperson === employee.id;
}

export default function SalesOrdersView({ employee, salesOrders = [], onUpdateSalesOrder, onConvertToInvoice, setActiveTab }) {
  const [search, setSearch] = useState('');
  const [showDetail, setShowDetail] = useState(null);
  const [converting, setConverting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const filtered = salesOrders.filter(so => {
    const q1 = search.trim().toLowerCase();
    if (!q1) return true;
    return so.id?.toLowerCase().includes(q1) || so.customerName?.toLowerCase().includes(q1);
  });

  const handleConvertToInvoice = async (soId) => {
    setConverting(true);
    try {
      const invoice = await onConvertToInvoice(soId);
      setShowDetail(prev => (prev && prev.id === soId ? { ...prev, status: 'Invoiced', invoiceId: invoice.id } : prev));
      alert(`Invoice ${invoice.id} created from this sales order.`);
    } catch (err) {
      alert(err.message);
    } finally {
      setConverting(false);
    }
  };

  const handleCancel = async (soId) => {
    if (!window.confirm('Cancel this sales order? Reserved stock will be released back to available inventory.')) return;
    setCancelling(true);
    try {
      await onUpdateSalesOrder(soId, { status: 'Cancelled' });
      setShowDetail(prev => (prev && prev.id === soId ? { ...prev, status: 'Cancelled' } : prev));
    } catch (err) {
      alert(err.message);
    } finally {
      setCancelling(false);
    }
  };

  if (showDetail) {
    const so = showDetail;
    const currentIndex = filtered.findIndex(x => x.id === so.id);
    const prevOrder = currentIndex > 0 ? filtered[currentIndex - 1] : null;
    const nextOrder = currentIndex >= 0 && currentIndex < filtered.length - 1 ? filtered[currentIndex + 1] : null;
    const manageable = canManage(employee, so);

    return (
      <div className="max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
        <div className="p-4 md:p-6 space-y-4">

          <div className="flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={() => setShowDetail(null)}
              className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 cursor-pointer transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sales Orders</span>
            </button>

            <div className="flex items-center gap-1.5 flex-wrap">
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

          <div className="print-area bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">

            <div className="flex items-start justify-between flex-wrap gap-3 border-b border-slate-50 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-black text-slate-800">{so.id}</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${STATUS_STYLES[so.status] || STATUS_STYLES.Confirmed}`}>
                  {so.status}
                </span>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
                <p className="text-lg font-black text-slate-800">{money(so.totalAmount)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
              <MetaRow label="Order Number" value={so.id} />
              <MetaRow label="Order Date" value={so.orderDate || '--'} />
              {so.expectedDeliveryDate && <MetaRow label="Expected Delivery" value={so.expectedDeliveryDate} />}
              <MetaRow label="Salesperson" value={so.salespersonName || '--'} />
              {so.sourceQuotationId && <MetaRow label="From Quote" value={so.sourceQuotationId} />}
              {so.invoiceId && <MetaRow label="Invoice" value={so.invoiceId} />}
              {so.paymentTerm && <MetaRow label="Payment Term" value={so.paymentTerm} />}
              {so.deliveryPlan && <MetaRow label="Delivery Plan" value={so.deliveryPlan} />}
              {so.brand && <MetaRow label="Brand" value={so.brand} />}
              {so.packingType && <MetaRow label="Packing Type" value={so.packingType} />}
              {so.customerType && <MetaRow label="Customer Type" value={so.customerType} />}
              {so.incoTerm && <MetaRow label="Inco Term" value={so.incoTerm} />}
              {so.fiscalPosition && <MetaRow label="Fiscal Position" value={so.fiscalPosition} />}
            </div>

            <div className="border-t border-slate-50 pt-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Customer Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Name</p>
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-500" /> {so.customerName}
                  </p>
                  {so.customerEmail && <p className="text-slate-400 text-[11px] mt-0.5">{so.customerEmail}</p>}
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Billing Address</p>
                  <p className="text-slate-600 font-semibold leading-relaxed whitespace-pre-line">
                    {so.customerAddress || '-'}
                    {so.customerPhone && <><br />{so.customerPhone}</>}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Shipping Address</p>
                  <p className="text-slate-600 font-semibold leading-relaxed whitespace-pre-line">
                    {so.shippingAddress || so.customerAddress || '-'}
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
                    {(so.items || []).map((item, i) => (
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
                    <span className="font-mono font-bold text-slate-800">{money(so.subtotal)}</span>
                  </div>
                  {!!so.discountTotal && (
                    <div className="flex items-center justify-between text-red-500">
                      <span>Discount {so.discountPercent ? `(${so.discountPercent}%)` : ''}</span>
                      <span className="font-mono font-bold">-{money(so.discountTotal)}</span>
                    </div>
                  )}
                  {!!so.cgstRate && (
                    <div className="flex items-center justify-between">
                      <span>CGST ({so.cgstRate}%)</span>
                      <span className="font-mono font-bold text-slate-800">{money(so.cgstAmount)}</span>
                    </div>
                  )}
                  {!!so.sgstRate && (
                    <div className="flex items-center justify-between">
                      <span>SGST ({so.sgstRate}%)</span>
                      <span className="font-mono font-bold text-slate-800">{money(so.sgstAmount)}</span>
                    </div>
                  )}
                  {!!so.igstRate && (
                    <div className="flex items-center justify-between">
                      <span>IGST ({so.igstRate}%)</span>
                      <span className="font-mono font-bold text-slate-800">{money(so.igstAmount)}</span>
                    </div>
                  )}
                  {so.taxType && so.taxType !== 'None' && (
                    <div className="flex items-center justify-between">
                      <span>{so.taxType} ({so.taxRate}%)</span>
                      <span className="font-mono font-bold text-slate-800">{money(so.taxAmount)}</span>
                    </div>
                  )}
                  {!!so.adjustment && (
                    <div className="flex items-center justify-between">
                      <span>Adjustment</span>
                      <span className="font-mono font-bold text-slate-800">{money(so.adjustment)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm border-t border-slate-200 pt-2 mt-1">
                    <span className="font-black text-slate-800">Total</span>
                    <span className="font-mono font-black text-blue-600">{money(so.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {so.customerNotes && (
              <div className="border-t border-slate-50 pt-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notes</h4>
                <p className="text-xs text-slate-500">{so.customerNotes}</p>
              </div>
            )}

            <div className="border-t border-slate-50 pt-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Terms and Conditions</h4>
              <p className="text-xs text-slate-400 font-semibold whitespace-pre-line">
                {so.termsAndConditions || DEFAULT_TERMS_AND_CONDITIONS}
              </p>
            </div>
          </div>

          {manageable && so.status !== 'Cancelled' && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3.5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                <Info className="w-4 h-4 shrink-0" />
                <span>
                  {so.status === 'Invoiced'
                    ? `Converted to invoice ${so.invoiceId}.`
                    : "What's Next? Convert this order to an invoice once it's ready to fulfil."}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {so.status === 'Invoiced' ? (
                  <button
                    onClick={() => setActiveTab && setActiveTab('invoices')}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" /> View Invoice
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleCancel(so.id)}
                      disabled={cancelling}
                      className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-red-300 hover:text-red-600 text-slate-600 text-[11px] font-bold rounded-lg cursor-pointer transition-all disabled:opacity-60 flex items-center gap-1.5"
                    >
                      <Ban className="w-3.5 h-3.5" /> {cancelling ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                    <button
                      onClick={() => handleConvertToInvoice(so.id)}
                      disabled={converting}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-all disabled:opacity-60 flex items-center gap-1.5"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" /> {converting ? 'Converting...' : 'Convert to Invoice'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={() => prevOrder && setShowDetail(prevOrder)}
              disabled={!prevOrder}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => nextOrder && setShowDetail(nextOrder)}
              disabled={!nextOrder}
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
      <div className="p-4 md:p-6 space-y-4">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-[15px] font-bold text-slate-800 select-none">
            <span>All Sales Orders</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center space-x-2.5">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by order number or customer..."
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
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Date</th>
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Number</th>
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expected Delivery</th>
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Name</th>
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(so => (
                  <tr
                    key={so.id}
                    onClick={() => setShowDetail(so)}
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                  >
                    <td className="pl-5 pr-2 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-slate-300" />
                    </td>
                    <td className="pr-3 py-3.5"></td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 font-semibold whitespace-nowrap">{so.orderDate || '--'}</td>
                    <td className="px-5 py-3.5 text-xs font-bold text-blue-600 whitespace-nowrap">{so.id}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 font-semibold whitespace-nowrap">{so.expectedDeliveryDate || '--'}</td>
                    <td className="px-5 py-3.5 text-xs font-bold text-amber-700">{so.customerName}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${STATUS_TEXT_STYLES[so.status] || STATUS_TEXT_STYLES.Confirmed}`}>
                        {so.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs font-bold text-slate-800 font-mono text-right whitespace-nowrap">{money(so.totalAmount)}</td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-10 text-center text-xs text-slate-400 font-semibold">
                      No sales orders yet. Accept a quotation and create one.
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
