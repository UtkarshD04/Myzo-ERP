import mongoose from 'mongoose';

const poItemSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  model: String,
  quantity: { type: Number, default: 1 },
  unitCost: { type: Number, default: 0 },
  lineTotal: { type: Number, default: 0 }
}, { _id: false });

const purchaseOrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, sparse: true },
  supplierName: { type: String, required: true },
  supplierEmail: String,
  supplierPhone: String,
  items: { type: [poItemSchema], default: [] },
  totalAmount: { type: Number, default: 0 },
  status: { type: String, default: 'Draft' }, // Draft, Ordered, Received, Cancelled
  orderDate: String,
  expectedDate: String,
  receivedDate: { type: String, default: null },
  notes: String,
  createdBy: String,
  createdByName: String
}, { timestamps: true });

export const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema, 'purchaseOrders');

export async function findAllPurchaseOrders() {
  return PurchaseOrder.find({}).sort({ createdAt: -1 }).lean();
}

export async function createPurchaseOrderRecord(record) {
  return PurchaseOrder.create(record);
}

export async function updatePurchaseOrderById(id, updates) {
  await PurchaseOrder.findOneAndUpdate({ id }, updates);
  return findAllPurchaseOrders();
}
