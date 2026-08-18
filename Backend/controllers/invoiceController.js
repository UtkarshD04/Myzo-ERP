import { createInvoice, findAllInvoices, findInvoiceById, updateInvoice } from '../models/invoiceModel.js';
import { findSalesOrderById, markSalesOrderInvoiced, findAllSalesOrders } from '../models/salesOrderModel.js';
import { fulfillReservedStock, findAllProducts, findAllProductsForManagement } from '../models/productModel.js';
import { createStockMovement } from '../models/stockMovementModel.js';
import { buildId, getTodayDate } from '../services/timeService.js';
import { requireOwnerOrRole } from '../middleware/auth.js';

// Same ownership tier as quotations: the invoice's own salesperson, or a
// Manager/Admin acting on their behalf.
const INVOICE_OVERRIDE_ROLES = ['Admin', 'Manager'];

function addDays(dateStr, days) {
  const base = dateStr ? new Date(dateStr) : new Date();
  base.setDate(base.getDate() + days);
  return base.toISOString().split('T')[0];
}

export async function getInvoices(req, res) {
  const invoices = await findAllInvoices();
  res.json({ invoices });
}

export async function convertSalesOrderToInvoice(req, res) {
  const { salesOrderId } = req.params;

  const salesOrder = await findSalesOrderById(salesOrderId);
  if (!salesOrder) {
    const error = new Error('Sales order not found.');
    error.statusCode = 404;
    throw error;
  }

  if (salesOrder.status !== 'Confirmed') {
    const error = new Error(`This sales order is already ${salesOrder.status.toLowerCase()} and cannot be invoiced.`);
    error.statusCode = 409;
    throw error;
  }

  requireOwnerOrRole(req, salesOrder.salesperson, ...INVOICE_OVERRIDE_ROLES);

  const { _id, id: soId, createdAt, updatedAt, __v, status, expectedDeliveryDate, invoiceId, confirmedAt, invoicedAt, cancelledAt, ...rest } = salesOrder;
  const invoiceDate = getTodayDate();
  const id = buildId('INV');

  // Atomically claim this sales order for invoicing *before* creating the
  // invoice or touching stock — the status match in the filter means only
  // one of two concurrent requests for the same order can win here. The
  // loser gets null back and is rejected with no side effects at all,
  // instead of both racing past the earlier status check above and each
  // creating an invoice + double-decrementing stock for one reservation.
  const claimed = await markSalesOrderInvoiced(soId, id);
  if (!claimed) {
    const error = new Error('This sales order was already invoiced or cancelled by another request.');
    error.statusCode = 409;
    throw error;
  }

  const invoice = {
    ...rest,
    id,
    sourceSalesOrderId: soId,
    invoiceDate,
    dueDate: addDays(invoiceDate, 15),
    status: 'Unpaid'
  };

  const invoices = await createInvoice(invoice);
  const salesOrders = await findAllSalesOrders();

  // Reservation is fulfilled here: stock and reservedStock drop together,
  // since the quantity was already held aside when the order was confirmed.
  for (const item of salesOrder.items || []) {
    if (!item.productId) continue;
    const quantity = Number(item.quantity) || 0;
    const updated = await fulfillReservedStock(item.productId, quantity);
    if (updated) {
      await createStockMovement({
        id: buildId('STK'),
        productId: item.productId,
        productName: item.productName || `${updated.series || ''} ${updated.model || ''}`.trim(),
        model: item.model || updated.model,
        type: 'Sale',
        quantity: -quantity,
        balanceAfter: updated.stock,
        reference: id,
        note: `Invoice ${id}`,
        createdBy: salesOrder.salespersonName || null
      });
    }
  }

  const products = await findAllProducts();
  const manageProducts = await findAllProductsForManagement();

  res.status(201).json({ invoices, salesOrders, invoice, products, manageProducts });
}

export async function modifyInvoice(req, res) {
  const { id } = req.params;

  const existing = await findInvoiceById(id);
  if (!existing) {
    const error = new Error('Invoice not found.');
    error.statusCode = 404;
    throw error;
  }
  requireOwnerOrRole(req, existing.salesperson, ...INVOICE_OVERRIDE_ROLES);

  const invoices = await updateInvoice(id, req.body);
  res.json({ invoices });
}
