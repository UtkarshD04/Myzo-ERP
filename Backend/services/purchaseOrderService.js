import {
  PurchaseOrder,
  createPurchaseOrderRecord,
  updatePurchaseOrderById,
  findAllPurchaseOrders
} from '../models/purchaseOrderModel.js';
import { adjustProductStock, findAllProducts, findAllProductsForManagement } from '../models/productModel.js';
import { createStockMovement } from '../models/stockMovementModel.js';
import { addNotification } from '../models/notificationModel.js';
import { buildId } from './timeService.js';

const INVENTORY_ROLES = ['Admin', 'Manager'];
const STATUSES = ['Draft', 'Ordered', 'Received', 'Cancelled'];

function requireInventoryManager(role) {
  if (!INVENTORY_ROLES.includes(role)) {
    const error = new Error('Access denied. Only Admin or Manager can manage purchase orders.');
    error.statusCode = 403;
    throw error;
  }
}

function computeTotal(items) {
  return items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitCost) || 0), 0);
}

export async function createPurchaseOrder(payload = {}, requesterRole) {
  requireInventoryManager(requesterRole);

  const { supplierName, items } = payload;
  if (!supplierName || !Array.isArray(items) || items.length === 0) {
    const error = new Error('Supplier name and at least one line item are required.');
    error.statusCode = 400;
    throw error;
  }

  const computedItems = items.map(it => ({
    productId: it.productId || '',
    productName: it.productName || '',
    model: it.model || '',
    quantity: Number(it.quantity) || 0,
    unitCost: Number(it.unitCost) || 0,
    lineTotal: (Number(it.quantity) || 0) * (Number(it.unitCost) || 0)
  }));

  await createPurchaseOrderRecord({
    id: buildId('PO'),
    supplierName,
    supplierEmail: payload.supplierEmail || '',
    supplierPhone: payload.supplierPhone || '',
    items: computedItems,
    totalAmount: computeTotal(computedItems),
    status: 'Draft',
    orderDate: payload.orderDate || new Date().toISOString().split('T')[0],
    expectedDate: payload.expectedDate || '',
    notes: payload.notes || '',
    createdBy: requesterRole,
    createdByName: payload.createdByName || ''
  });

  const purchaseOrders = await findAllPurchaseOrders();
  return { purchaseOrders };
}

export async function updatePurchaseOrder(id, updates = {}, requesterRole) {
  requireInventoryManager(requesterRole);

  const po = await PurchaseOrder.findOne({ id }).lean();
  if (!po) {
    const error = new Error('Purchase order not found.');
    error.statusCode = 404;
    throw error;
  }

  if (po.status === 'Received' || po.status === 'Cancelled') {
    const error = new Error(`This purchase order is already ${po.status.toLowerCase()} and cannot be modified.`);
    error.statusCode = 409;
    throw error;
  }

  const patch = {};
  if (updates.status) {
    if (!STATUSES.includes(updates.status)) {
      const error = new Error(`Status must be one of: ${STATUSES.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }
    patch.status = updates.status;
  }
  if (updates.expectedDate) patch.expectedDate = updates.expectedDate;
  if (updates.notes !== undefined) patch.notes = updates.notes;

  const receiving = patch.status === 'Received';
  if (receiving) patch.receivedDate = new Date().toISOString().split('T')[0];

  const purchaseOrders = await updatePurchaseOrderById(id, patch);

  if (receiving) {
    for (const item of po.items || []) {
      if (!item.productId) continue;
      const quantity = Number(item.quantity) || 0;
      const updated = await adjustProductStock(item.productId, quantity);
      if (updated) {
        await createStockMovement({
          id: buildId('STK'),
          productId: item.productId,
          productName: item.productName || `${updated.series || ''} ${updated.model || ''}`.trim(),
          model: item.model || updated.model,
          type: 'Purchase',
          quantity,
          balanceAfter: updated.stock,
          reference: id,
          note: `Received from PO ${id} (${po.supplierName})`,
          createdBy: requesterRole
        });
      }
    }
  }

  const notifications = await addNotification({
    id: buildId('NOT'),
    title: receiving ? 'Purchase Order Received' : `Purchase Order ${patch.status || 'Updated'}`,
    message: `PO ${id} from ${po.supplierName} was ${receiving ? 'received — stock updated' : (patch.status || 'updated').toLowerCase()}.`,
    time: 'Just now',
    read: false,
    category: 'Inventory'
  });

  const result = { notifications, purchaseOrders };
  if (receiving) {
    result.products = await findAllProducts();
    result.manageProducts = await findAllProductsForManagement();
  }
  return result;
}
