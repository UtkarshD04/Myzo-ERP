import mongoose from 'mongoose';

const stockMovementSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, sparse: true },
  productId: { type: String, required: true },
  productName: String,
  model: String,
  type: { type: String, required: true }, // 'Sale' | 'Purchase' | 'Adjustment'
  quantity: { type: Number, required: true }, // signed: negative for sale, positive for purchase/increase
  balanceAfter: { type: Number, default: null },
  reference: { type: String, default: null }, // invoice id or purchase order id
  note: String,
  createdBy: String
}, { timestamps: true });

export const StockMovement = mongoose.model('StockMovement', stockMovementSchema, 'stockMovements');

export async function findAllStockMovements() {
  return StockMovement.find({}).sort({ createdAt: -1 }).limit(500).lean();
}

export async function createStockMovement(record) {
  return StockMovement.create(record);
}

// Same tier as products/purchase-orders (Admin/Manager).
export function filterStockMovementsForViewer(stockMovements, viewer) {
  return (viewer.role === 'Admin' || viewer.role === 'Manager') ? stockMovements : [];
}
