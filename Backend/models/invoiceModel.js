import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  model: String,
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  lineTotal: { type: Number, default: 0 },
  // Mirrors quotationItemSchema.wattage — carried through on conversion so
  // the invoice PDF can keep showing Price/WP for solar-module line items.
  wattage: Number
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  sourceQuotationId: String,
  referenceNumber: String,
  invoiceDate: String,
  dueDate: String,
  customerName: { type: String, required: true },
  customerPhone: String,
  customerEmail: String,
  customerAddress: String,
  shippingAddress: String,
  salesperson: String,
  salespersonName: String,
  // Carried through from the source quotation's own salespersonEmail/Phone —
  // see quotationModel.js for why these aren't independently editable here.
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
  items: { type: [invoiceItemSchema], default: [] },
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
  status: { type: String, default: 'Unpaid' },
  customerNotes: String,
  termsAndConditions: String,
  createdBy: String,
  createdByName: String
}, { timestamps: true });

export const Invoice = mongoose.model('Invoice', invoiceSchema);

export async function findAllInvoices() {
  return Invoice.find({}).sort({ createdAt: -1 }).lean();
}

export async function findInvoiceById(id) {
  return Invoice.findOne({ id }).lean();
}

export async function createInvoice(invoice) {
  await Invoice.create(invoice);
  return findAllInvoices();
}

export async function updateInvoice(id, updates) {
  await Invoice.findOneAndUpdate({ id }, updates);
  return findAllInvoices();
}
