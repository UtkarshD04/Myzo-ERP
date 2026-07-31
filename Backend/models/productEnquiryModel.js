import mongoose from 'mongoose';

// The website already writes 'new' / 'in-progress'-style lowercase statuses
// (see aftersalesservices) — matching that convention here instead of the
// ERP's own Title Case (see customerModel.LEAD_STATUSES) keeps values
// consistent for whichever app writes last.
export const PRODUCT_ENQUIRY_STATUSES = ['new', 'contacted', 'converted', 'closed'];

// `productenquiries` belongs to the company's other live app (the public
// website's product enquiry form) — same shared-collection rule as
// productModel.js: no schema declared, raw collection ops only.
const productEnquiries = () => mongoose.connection.db.collection('productenquiries');

export async function findAllProductEnquiries() {
  return productEnquiries().find({}).sort({ createdAt: -1 }).toArray();
}

export async function updateProductEnquiryStatus(id, status) {
  if (!mongoose.isValidObjectId(id)) return null;
  const _id = new mongoose.Types.ObjectId(id);
  await productEnquiries().updateOne({ _id }, { $set: { status, updatedAt: new Date().toISOString() } });
  return productEnquiries().findOne({ _id });
}
