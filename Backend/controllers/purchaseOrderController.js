import { findAllPurchaseOrders } from '../models/purchaseOrderModel.js';
import { createPurchaseOrder, updatePurchaseOrder } from '../services/purchaseOrderService.js';

export async function getPurchaseOrders(req, res) {
  const purchaseOrders = await findAllPurchaseOrders();
  res.json({ purchaseOrders });
}

export async function addPurchaseOrder(req, res) {
  const result = await createPurchaseOrder(req.body, req.user.role);
  res.status(201).json(result);
}

export async function modifyPurchaseOrder(req, res) {
  const result = await updatePurchaseOrder(req.params.id, req.body, req.user.role);
  res.json(result);
}
