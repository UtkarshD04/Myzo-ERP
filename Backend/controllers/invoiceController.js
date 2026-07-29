import { createInvoice, findAllInvoices, findInvoiceById, updateInvoice } from '../models/invoiceModel.js';
import { findQuotationById, updateQuotation } from '../models/quotationModel.js';
import { findProductById, adjustProductStock, findAllProducts, findAllProductsForManagement } from '../models/productModel.js';
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

export async function convertQuotationToInvoice(req, res) {
  const { quotationId } = req.params;

  const quotation = await findQuotationById(quotationId);
  if (!quotation) {
    const error = new Error('Quotation not found.');
    error.statusCode = 404;
    throw error;
  }

  if (quotation.invoiceId) {
    const error = new Error(`This quote was already converted to invoice ${quotation.invoiceId}.`);
    error.statusCode = 409;
    throw error;
  }

  requireOwnerOrRole(req, quotation.salesperson, ...INVOICE_OVERRIDE_ROLES);

  // Only items linked to a catalog product participate in stock tracking —
  // free-text/custom line items (no productId) skip validation entirely.
  const shortages = [];
  for (const item of quotation.items || []) {
    if (!item.productId) continue;
    const product = await findProductById(item.productId);
    const available = product ? Number(product.stock) || 0 : 0;
    if (product && available < (Number(item.quantity) || 0)) {
      shortages.push(`${item.productName || item.model} (need ${item.quantity}, have ${available})`);
    }
  }
  if (shortages.length > 0) {
    const error = new Error(`Insufficient stock to invoice: ${shortages.join('; ')}`);
    error.statusCode = 409;
    throw error;
  }

  const { _id, id: quoteId, createdAt, updatedAt, __v, status, validUntil, invoiceId, ...rest } = quotation;
  const invoiceDate = getTodayDate();
  const id = buildId('INV');

  const invoice = {
    ...rest,
    id,
    sourceQuotationId: quoteId,
    invoiceDate,
    dueDate: addDays(invoiceDate, 15),
    status: 'Unpaid'
  };

  const invoices = await createInvoice(invoice);
  const quotations = await updateQuotation(quoteId, { invoiceId: id });

  for (const item of quotation.items || []) {
    if (!item.productId) continue;
    const quantity = Number(item.quantity) || 0;
    const updated = await adjustProductStock(item.productId, -quantity);
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
        createdBy: quotation.salespersonName || null
      });
    }
  }

  const products = await findAllProducts();
  const manageProducts = await findAllProductsForManagement();

  res.status(201).json({ invoices, quotations, invoice, products, manageProducts });
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
