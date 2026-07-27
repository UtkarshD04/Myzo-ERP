import React, { useState } from 'react';
import { Boxes, Plus, AlertTriangle, ArrowDownCircle, ArrowUpCircle, Settings2, Truck, ListOrdered, ArrowLeft } from 'lucide-react';

const LOW_STOCK_DEFAULT = 5;

const PO_STATUS_STYLES = {
  Draft: 'bg-slate-50 text-slate-600 border-slate-100',
  Ordered: 'bg-blue-50 text-blue-600 border-blue-100',
  Received: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Cancelled: 'bg-red-50 text-red-600 border-red-100'
};

const MOVEMENT_STYLES = {
  Sale: { icon: ArrowDownCircle, className: 'text-red-500' },
  Purchase: { icon: ArrowUpCircle, className: 'text-emerald-500' },
  Adjustment: { icon: Settings2, className: 'text-amber-500' }
};

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const EMPTY_ITEM = { productId: '', productName: '', model: '', quantity: 1, unitCost: 0 };
const EMPTY_PO = { supplierName: '', supplierEmail: '', supplierPhone: '', expectedDate: '', notes: '' };

export default function InventoryView({ employee, manageProducts = [], purchaseOrders = [], stockMovements = [], onAddPurchaseOrder, onUpdatePurchaseOrder }) {
  const [tab, setTab] = useState('stock');
  const [showPoModal, setShowPoModal] = useState(false);
  const [poForm, setPoForm] = useState(EMPTY_PO);
  const [poItems, setPoItems] = useState([{ ...EMPTY_ITEM }]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const lowStockProducts = manageProducts.filter(p => {
    const threshold = p.lowStockThreshold ?? LOW_STOCK_DEFAULT;
    return Number(p.stock ?? 0) <= threshold;
  });

  const handleProductSelect = (index, productId) => {
    const product = manageProducts.find(p => p._id === productId);
    setPoItems(prev => prev.map((it, i) => i === index ? {
      ...it,
      productId,
      productName: product ? `${product.series} ${product.model}` : '',
      model: product?.model || ''
    } : it));
  };

  const handleItemChange = (index, field, value) => {
    setPoItems(prev => prev.map((it, i) => i === index ? { ...it, [field]: value } : it));
  };

  const addItemRow = () => setPoItems(prev => [...prev, { ...EMPTY_ITEM }]);
  const removeItemRow = (index) => setPoItems(prev => prev.filter((_, i) => i !== index));

  const poTotal = poItems.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitCost) || 0), 0);

  const resetPoForm = () => {
    setPoForm(EMPTY_PO);
    setPoItems([{ ...EMPTY_ITEM }]);
    setError('');
  };

  const handleCreatePo = async (e) => {
    e.preventDefault();
    setError('');
    const validItems = poItems.filter(it => it.productId && Number(it.quantity) > 0);
    if (validItems.length === 0) {
      setError('Add at least one line item with a product and quantity.');
      return;
    }
    setSubmitting(true);
    try {
      await onAddPurchaseOrder({ ...poForm, items: validItems, createdByName: employee.name });
      setShowPoModal(false);
      resetPoForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (po, status) => {
    try {
      await onUpdatePurchaseOrder(po.id, { status });
    } catch (err) {
      alert(err.message);
    }
  };

  if (showPoModal) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
        <button
          onClick={() => { setShowPoModal(false); resetPoForm(); }}
          className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 cursor-pointer transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Inventory</span>
        </button>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2.5">
            <Truck className="w-5 h-5 text-blue-600" />
            <span>New Purchase Order</span>
          </h2>
        </div>

        <form onSubmit={handleCreatePo} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Supplier Name</label>
              <input
                type="text" required value={poForm.supplierName}
                onChange={(e) => setPoForm({ ...poForm, supplierName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Supplier Email</label>
              <input
                type="email" value={poForm.supplierEmail}
                onChange={(e) => setPoForm({ ...poForm, supplierEmail: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Expected Date</label>
              <input
                type="date" value={poForm.expectedDate}
                onChange={(e) => setPoForm({ ...poForm, expectedDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Line Items</label>
              <button type="button" onClick={addItemRow} className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer">+ Add Item</button>
            </div>
            {poItems.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <select
                  value={item.productId}
                  onChange={(e) => handleProductSelect(i, e.target.value)}
                  className="col-span-6 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select product...</option>
                  {manageProducts.map(p => (
                    <option key={p._id} value={p._id}>{p.series} {p.model}</option>
                  ))}
                </select>
                <input
                  type="number" min="1" placeholder="Qty" value={item.quantity}
                  onChange={(e) => handleItemChange(i, 'quantity', e.target.value)}
                  className="col-span-2 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-800 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="number" min="0" placeholder="Unit Cost" value={item.unitCost}
                  onChange={(e) => handleItemChange(i, 'unitCost', e.target.value)}
                  className="col-span-3 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-800 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button" onClick={() => removeItemRow(i)} disabled={poItems.length === 1}
                  className="col-span-1 text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            ))}
            <p className="text-right text-xs font-bold text-slate-700">Total: {money(poTotal)}</p>
          </div>

          {error && <p className="text-[11px] text-red-600 font-semibold bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}

          <div className="flex items-center space-x-3.5 pt-2">
            <button
              type="button"
              onClick={() => { setShowPoModal(false); resetPoForm(); }}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={submitting}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/10 cursor-pointer transition-all disabled:opacity-60"
            >
              {submitting ? 'Creating...' : 'Create Purchase Order'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600" />
            Inventory &amp; Stock Tracking
          </h2>
          <p className="text-xs text-slate-500 mt-1">Stock levels, purchase orders, and movement history — linked to quotation-to-invoice sales.</p>
        </div>
        <button
          onClick={() => setShowPoModal(true)}
          className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md shadow-blue-500/10 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* Low stock banner */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50/60 border border-amber-200/50 rounded-2xl p-4.5 flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <p className="font-bold">{lowStockProducts.length} product(s) at or below low-stock threshold:</p>
            <p className="mt-1">{lowStockProducts.map(p => `${p.series} ${p.model} (${p.stock ?? 0})`).join(', ')}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl p-1.5 shadow-sm w-fit">
        {[
          { id: 'stock', label: 'Stock Overview', icon: Boxes },
          { id: 'orders', label: 'Purchase Orders', icon: Truck },
          { id: 'ledger', label: 'Stock Ledger', icon: ListOrdered }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              tab === t.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Stock Overview */}
      {tab === 'stock' && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3 font-extrabold">Product</th>
                  <th className="px-5 py-3 font-extrabold">Type</th>
                  <th className="px-5 py-3 font-extrabold">Current Stock</th>
                  <th className="px-5 py-3 font-extrabold">Low Stock At</th>
                  <th className="px-5 py-3 font-extrabold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {manageProducts.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-slate-400 font-semibold">No products in catalog.</td></tr>
                )}
                {manageProducts.map(p => {
                  const threshold = p.lowStockThreshold ?? LOW_STOCK_DEFAULT;
                  const isLow = Number(p.stock ?? 0) <= threshold;
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3.5 text-slate-800 font-bold">{p.series} {p.model}</td>
                      <td className="px-5 py-3.5 text-slate-600">{p.type || '--'}</td>
                      <td className="px-5 py-3.5 font-mono text-slate-700">{p.stock ?? 0}</td>
                      <td className="px-5 py-3.5 font-mono text-slate-400">{threshold}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isLow ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Purchase Orders */}
      {tab === 'orders' && (
        <div className="space-y-3">
          {purchaseOrders.length === 0 && (
            <p className="text-xs text-slate-400 font-semibold py-8 text-center bg-white border border-slate-100 rounded-2xl">
              No purchase orders yet.
            </p>
          )}
          {purchaseOrders.map(po => (
            <div key={po.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] font-bold text-blue-500 bg-blue-50/50 px-1.5 py-0.5 rounded border border-blue-100">{po.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${PO_STATUS_STYLES[po.status] || PO_STATUS_STYLES.Draft}`}>
                      {po.status}
                    </span>
                  </div>
                  <p className="font-bold text-xs text-slate-800 mt-1.5">{po.supplierName}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {po.items.length} item(s) · Ordered {po.orderDate} {po.expectedDate ? `· Expected ${po.expectedDate}` : ''} {po.receivedDate ? `· Received ${po.receivedDate}` : ''}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {po.items.map(it => `${it.productName || it.model} ×${it.quantity}`).join(', ')}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-sm text-slate-800">{money(po.totalAmount)}</span>
                  {po.status === 'Draft' && (
                    <button
                      onClick={() => handleStatusChange(po, 'Ordered')}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-[10px] rounded-lg border border-blue-200 cursor-pointer transition-all"
                    >
                      Mark Ordered
                    </button>
                  )}
                  {po.status === 'Ordered' && (
                    <button
                      onClick={() => handleStatusChange(po, 'Received')}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold text-[10px] rounded-lg border border-emerald-200 cursor-pointer transition-all"
                    >
                      Mark Received
                    </button>
                  )}
                  {(po.status === 'Draft' || po.status === 'Ordered') && (
                    <button
                      onClick={() => handleStatusChange(po, 'Cancelled')}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[10px] rounded-lg border border-red-200 cursor-pointer transition-all"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stock Ledger */}
      {tab === 'ledger' && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-3 font-extrabold">Product</th>
                  <th className="px-5 py-3 font-extrabold">Type</th>
                  <th className="px-5 py-3 font-extrabold">Qty Change</th>
                  <th className="px-5 py-3 font-extrabold">Balance After</th>
                  <th className="px-5 py-3 font-extrabold">Reference</th>
                  <th className="px-5 py-3 font-extrabold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {stockMovements.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">No stock movements recorded yet.</td></tr>
                )}
                {stockMovements.map(m => {
                  const style = MOVEMENT_STYLES[m.type] || MOVEMENT_STYLES.Adjustment;
                  const Icon = style.icon;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3.5 text-slate-800 font-bold">{m.productName || m.model || '--'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`flex items-center gap-1.5 font-bold ${style.className}`}>
                          <Icon className="w-3.5 h-3.5" /> {m.type}
                        </span>
                      </td>
                      <td className={`px-5 py-3.5 font-mono font-bold ${m.quantity < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-600">{m.balanceAfter ?? '--'}</td>
                      <td className="px-5 py-3.5 text-slate-500">{m.reference || '--'}</td>
                      <td className="px-5 py-3.5 text-slate-400">{new Date(m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
