import mongoose from 'mongoose';

export const LEAD_STATUSES = ['New', 'Contacted', 'Negotiation', 'Won', 'Lost'];

// A quotation moving through its own lifecycle should nudge the linked
// customer's pipeline stage forward without any extra manual step.
const QUOTATION_STATUS_TO_LEAD_STAGE = {
  Sent: 'Negotiation',
  Accepted: 'Won',
  Rejected: 'Lost'
};

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  company: { type: String, default: '' },
  address: { type: String, default: '' },
  leadStatus: { type: String, enum: LEAD_STATUSES, default: 'New' },
  isBlocked: { type: Boolean, default: false }
}, { timestamps: true });

export const Customer = mongoose.model('Customer', customerSchema, 'customers');

export async function findAllCustomers() {
  return Customer.find({}).sort({ createdAt: -1 }).lean();
}

export async function createCustomer({ name, email, phone, company, address, leadStatus }) {
  await Customer.create({ name, email, phone, company, address, leadStatus });
  return findAllCustomers();
}

export async function updateCustomerById(id, updates) {
  if (!mongoose.isValidObjectId(id)) return null;
  const customer = await Customer.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();
  if (!customer) return null;
  return findAllCustomers();
}

export async function deleteCustomerById(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  const customer = await Customer.findByIdAndDelete(id).lean();
  if (!customer) return null;
  return findAllCustomers();
}

// Best-effort: a quotation's customer may not exist as a saved Customer record
// (quotations accept free-typed customer details), so a no-match is not an error.
export async function syncLeadStageForQuotationStatus(email, quotationStatus) {
  if (!email) return;
  const targetStage = QUOTATION_STATUS_TO_LEAD_STAGE[quotationStatus];
  if (!targetStage) return;

  if (targetStage === 'Negotiation') {
    // Only auto-advance a fresh lead — never downgrade a deal already Won/Lost/further along.
    await Customer.updateOne(
      { email: email.toLowerCase(), leadStatus: { $in: ['New', 'Contacted'] } },
      { leadStatus: targetStage }
    );
  } else {
    await Customer.updateOne({ email: email.toLowerCase() }, { leadStatus: targetStage });
  }
}
