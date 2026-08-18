import mongoose from 'mongoose';

const salesOrderItemSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  model: String,
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  lineTotal: { type: Number, default: 0 },
  // Mirrors quotationItemSchema.wattage — carried through from the source
  // quotation so a solar-module line item still shows Price/WP downstream.
  wattage: Number
}, { _id: false });

const salesOrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  sourceQuotationId: String,
  orderDate: String,
  customerName: { type: String, required: true },
  customerPhone: String,
  customerEmail: String,
  customerAddress: String,
  shippingAddress: String,
  salesperson: String,
  salespersonName: String,
  salespersonEmail: String,
  salespersonPhone: String,
  subject: String,
  paymentTerm: String,
  deliveryPlan: String,
  brand: String,
  packingType: String,
  customerType: String,
  incoTerm: String,
  fiscalPosition: String,
  items: { type: [salesOrderItemSchema], default: [] },
  subtotal: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0 },
  discountTotal: { type: Number, default: 0 },
  gstMode: { type: String, default: 'split' },
  cgstRate: { type: Number, default: 0 },
  cgstAmount: { type: Number, default: 0 },
  sgstRate: { type: Number, default: 0 },
  sgstAmount: { type: Number, default: 0 },
  igstRate: { type: Number, default: 0 },
  igstAmount: { type: Number, default: 0 },
  taxType: { type: String, default: 'None' },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  adjustment: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  // 'Confirmed' (stock reserved) -> 'Invoiced' (stock fulfilled) | 'Cancelled' (reservation released)
  status: { type: String, default: 'Confirmed' },
  expectedDeliveryDate: String,
  invoiceId: String,
  customerNotes: String,
  termsAndConditions: String,
  createdBy: String,
  createdByName: String,
  confirmedAt: Date,
  invoicedAt: Date,
  cancelledAt: Date
}, { timestamps: true });

export const SalesOrder = mongoose.model('SalesOrder', salesOrderSchema);

export async function findAllSalesOrders() {
  return SalesOrder.find({}).sort({ createdAt: -1 }).lean();
}

export async function findSalesOrderById(id) {
  return SalesOrder.findOne({ id }).lean();
}

export async function createSalesOrder(salesOrder) {
  await SalesOrder.create(salesOrder);
  return findAllSalesOrders();
}

export async function updateSalesOrder(id, updates) {
  await SalesOrder.findOneAndUpdate({ id }, updates);
  return findAllSalesOrders();
}

// Atomically flips a Confirmed order to Invoiced — the status match in the
// filter means only one of two concurrent invoice-conversion requests for
// the same order can win this update; the loser gets null back and the
// caller turns that into a 409 before creating a duplicate invoice or
// double-decrementing stock.
export async function markSalesOrderInvoiced(id, invoiceId) {
  return SalesOrder.findOneAndUpdate(
    { id, status: 'Confirmed' },
    { $set: { invoiceId, status: 'Invoiced', invoicedAt: new Date() } },
    { new: true }
  ).lean();
}
