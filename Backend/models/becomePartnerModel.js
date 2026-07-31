import mongoose from 'mongoose';

// Matches the lowercase status convention of the website's other lead-capture
// forms (productenquiries/aftersalesservices).
export const BECOME_PARTNER_STATUSES = ['new', 'contacted', 'approved', 'rejected'];

// `becomepartners` belongs to the company's other live app (the public
// website's "become a partner" form) — same shared-collection rule as
// productModel.js: no schema declared, raw collection ops only. Empty at the
// time this was written, so fields beyond status/createdAt are read as-is
// (whatever the website's form actually submits) rather than assumed.
const becomePartners = () => mongoose.connection.db.collection('becomepartners');

export async function findAllBecomePartners() {
  return becomePartners().find({}).sort({ createdAt: -1 }).toArray();
}

export async function updateBecomePartnerStatus(id, status) {
  if (!mongoose.isValidObjectId(id)) return null;
  const _id = new mongoose.Types.ObjectId(id);
  await becomePartners().updateOne({ _id }, { $set: { status, updatedAt: new Date().toISOString() } });
  return becomePartners().findOne({ _id });
}
