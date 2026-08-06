import mongoose from 'mongoose';

const quotationItemSchema = new mongoose.Schema({
  productId: String,
  productName: String,
  model: String,
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  lineTotal: { type: Number, default: 0 },
  // Watt-peak rating for the line item, if it's a solar module — lets the PDF
  // show a Price/WP column the way solar-distribution quotes usually do.
  // Left blank for products this doesn't apply to.
  wattage: Number
}, { _id: false });

const quotationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  referenceNumber: String,
  quoteDate: String,
  customerName: { type: String, required: true },
  customerPhone: String,
  customerEmail: String,
  customerAddress: String,
  shippingAddress: String,
  salesperson: String,
  salespersonName: String,
  // Set once at creation from the creating salesperson's own profile (mirrors
  // salesperson/salespersonName) so the quotation PDF's letterhead can show
  // "their" contact details rather than a single shared company inbox. Not
  // in QUOTATION_EDITABLE_FIELDS, so a later edit — including by a Manager/
  // Admin acting on the salesperson's behalf — can't overwrite it.
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
  items: { type: [quotationItemSchema], default: [] },
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
  status: { type: String, default: 'Draft' },
  validUntil: String,
  customerNotes: String,
  termsAndConditions: String,
  createdBy: String,
  createdByName: String,
  invoiceId: String,
  sentAt: Date,
  acceptedAt: Date,
  lastFollowUpAt: Date,
  followUpCount: { type: Number, default: 0 }
}, { timestamps: true });

export const Quotation = mongoose.model('Quotation', quotationSchema);

export async function findAllQuotations() {
  return Quotation.find({}).sort({ createdAt: -1 }).lean();
}

// A quotation is due for a follow-up once it has sat in "Sent" for `days`
// without a reminder having gone out more recently than that same window.
export async function findQuotationsDueForFollowUp(days) {
  const threshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return Quotation.find({
    status: 'Sent',
    sentAt: { $lte: threshold },
    $or: [
      { lastFollowUpAt: null },
      { lastFollowUpAt: { $lte: threshold } }
    ]
  }).lean();
}

export async function findQuotationById(id) {
  return Quotation.findOne({ id }).lean();
}

export async function createQuotation(quotation) {
  await Quotation.create(quotation);
  return findAllQuotations();
}

export async function updateQuotation(id, updates) {
  await Quotation.findOneAndUpdate({ id }, updates);
  return findAllQuotations();
}
