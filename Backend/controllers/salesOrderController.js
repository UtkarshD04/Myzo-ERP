import { createSalesOrder, findAllSalesOrders, findSalesOrderById, updateSalesOrder } from '../models/salesOrderModel.js';
import { findQuotationById, updateQuotation } from '../models/quotationModel.js';
import { findProductById, adjustProductReservedStock, reserveProductStock, findAllProducts, findAllProductsForManagement } from '../models/productModel.js';
import { createStockMovement } from '../models/stockMovementModel.js';
import { addNotification } from '../models/notificationModel.js';
import { buildId, getTodayDate } from '../services/timeService.js';
import { requireOwnerOrRole } from '../middleware/auth.js';

// Same ownership tier as quotations/invoices: the order's own salesperson,
// or a Manager/Admin stepping in on their behalf.
const SALES_ORDER_OVERRIDE_ROLES = ['Admin', 'Manager'];

// Shared shape for Reservation/Release stock-ledger rows. balanceAfter is
// always the raw physical `stock` (matching Sale/Purchase/Adjustment rows in
// the same collection — see stockMovementModel.js), never the derived
// "available" figure, so every row in the ledger means the same thing; the
// available count after this change is called out in the note instead.
async function recordReservationMovement({ productId, productName, model, type, quantity, updated, referenceId, note, createdBy }) {
  const available = (Number(updated.stock) || 0) - (Number(updated.reservedStock) || 0);
  await createStockMovement({
    id: buildId('STK'),
    productId,
    productName: productName || `${updated.series || ''} ${updated.model || ''}`.trim(),
    model: model || updated.model,
    type,
    quantity,
    balanceAfter: updated.stock,
    reference: referenceId,
    note: `${note} (${available} available)`,
    createdBy: createdBy || null
  });
}

export async function getSalesOrders(req, res) {
  const salesOrders = await findAllSalesOrders();
  res.json({ salesOrders });
}

export async function addSalesOrderFromQuotation(req, res) {
  const { quotationId } = req.params;

  const quotation = await findQuotationById(quotationId);
  if (!quotation) {
    const error = new Error('Quotation not found.');
    error.statusCode = 404;
    throw error;
  }

  if (quotation.status !== 'Accepted') {
    const error = new Error('Only an accepted quotation can be turned into a Sales Order.');
    error.statusCode = 400;
    throw error;
  }

  if (quotation.salesOrderId) {
    const error = new Error(`This quote was already converted to sales order ${quotation.salesOrderId}.`);
    error.statusCode = 409;
    throw error;
  }

  requireOwnerOrRole(req, quotation.salesperson, ...SALES_ORDER_OVERRIDE_ROLES);

  // Only items linked to a catalog product participate in stock tracking —
  // free-text/custom line items (no productId) skip reservation entirely.
  // Two line items referencing the same product must be reserved together
  // (aggregated), not checked independently against the same starting
  // "available" figure — otherwise each could individually pass a check
  // that their combined quantity would fail.
  const quantityByProductId = new Map();
  for (const item of quotation.items || []) {
    if (!item.productId) continue;
    quantityByProductId.set(item.productId, (quantityByProductId.get(item.productId) || 0) + (Number(item.quantity) || 0));
  }

  const id = buildId('SO');

  // Reserve each product atomically (reserveProductStock's $expr guard means
  // a concurrent reservation against the same product can never oversell
  // past what's available). If any product can't be reserved, this has no
  // multi-document transaction to roll back automatically, so it compensates
  // by releasing whatever it did manage to reserve before reporting the error.
  const shortages = [];
  const reserved = [];
  for (const [productId, quantity] of quantityByProductId) {
    const updated = await reserveProductStock(productId, quantity);
    if (!updated) {
      const product = await findProductById(productId);
      const item = (quotation.items || []).find(it => it.productId === productId);
      const label = item?.productName || item?.model || productId;
      if (!product) {
        shortages.push(`${label} (product not found)`);
      } else {
        const available = (Number(product.stock) || 0) - (Number(product.reservedStock) || 0);
        shortages.push(`${label} (need ${quantity}, have ${available})`);
      }
      continue;
    }
    reserved.push({ productId, quantity, updated });
  }

  if (shortages.length > 0) {
    for (const r of reserved) {
      await adjustProductReservedStock(r.productId, -r.quantity);
    }
    const error = new Error(`Insufficient stock to confirm order: ${shortages.join('; ')}`);
    error.statusCode = 409;
    throw error;
  }

  const { _id, id: quoteId, createdAt, updatedAt, __v, status, validUntil, invoiceId, salesOrderId, ...rest } = quotation;

  const salesOrder = {
    ...rest,
    id,
    sourceQuotationId: quoteId,
    orderDate: getTodayDate(),
    status: 'Confirmed',
    confirmedAt: new Date()
  };

  const salesOrders = await createSalesOrder(salesOrder);
  const quotations = await updateQuotation(quoteId, { salesOrderId: id });

  for (const r of reserved) {
    const item = (quotation.items || []).find(it => it.productId === r.productId);
    await recordReservationMovement({
      productId: r.productId,
      productName: item?.productName,
      model: item?.model,
      type: 'Reservation',
      quantity: -r.quantity,
      updated: r.updated,
      referenceId: id,
      note: `Reserved for Sales Order ${id}`,
      createdBy: quotation.salespersonName
    });
  }

  await addNotification({
    id: buildId('NOT'),
    title: 'Sales Order Confirmed',
    message: `Sales order ${id} confirmed for ${quotation.customerName} — stock reserved.`,
    time: 'Just now',
    read: false,
    category: 'Inventory'
  });

  const products = await findAllProducts();
  const manageProducts = await findAllProductsForManagement();

  res.status(201).json({ salesOrders, quotations, salesOrder, products, manageProducts });
}

const SALES_ORDER_EDITABLE_FIELDS = ['expectedDeliveryDate', 'customerNotes', 'termsAndConditions', 'status'];

export async function modifySalesOrder(req, res) {
  const { id } = req.params;

  const existing = await findSalesOrderById(id);
  if (!existing) {
    const error = new Error('Sales order not found.');
    error.statusCode = 404;
    throw error;
  }
  requireOwnerOrRole(req, existing.salesperson, ...SALES_ORDER_OVERRIDE_ROLES);

  const updates = {};
  for (const field of SALES_ORDER_EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  // The only status transition this endpoint allows is a cancellation —
  // 'Invoiced' is set exclusively by invoiceController.convertSalesOrderToInvoice.
  // Checked with !== undefined (not a truthy check) so an explicit falsy
  // value like an empty string doesn't slip past validation.
  if (updates.status !== undefined && updates.status !== 'Cancelled') {
    const error = new Error("Status can only be set to 'Cancelled' here.");
    error.statusCode = 400;
    throw error;
  }

  const cancelling = updates.status === 'Cancelled';
  if (cancelling) {
    if (existing.status !== 'Confirmed') {
      const error = new Error(`This sales order is already ${existing.status.toLowerCase()} and cannot be cancelled.`);
      error.statusCode = 409;
      throw error;
    }
    updates.cancelledAt = new Date();
  }

  const salesOrders = await updateSalesOrder(id, updates);

  if (!cancelling) {
    res.json({ salesOrders });
    return;
  }

  for (const item of existing.items || []) {
    if (!item.productId) continue;
    const quantity = Number(item.quantity) || 0;
    const updated = await adjustProductReservedStock(item.productId, -quantity);
    if (updated) {
      await recordReservationMovement({
        productId: item.productId,
        productName: item.productName,
        model: item.model,
        type: 'Release',
        quantity,
        updated,
        referenceId: id,
        note: `Released from cancelled Sales Order ${id}`,
        createdBy: req.user.name
      });
    }
  }

  const products = await findAllProducts();
  const manageProducts = await findAllProductsForManagement();

  res.json({ salesOrders, products, manageProducts });
}
