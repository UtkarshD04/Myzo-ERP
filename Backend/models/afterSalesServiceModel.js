import mongoose from 'mongoose';

// Matches the lowercase statuses the website already writes (see the
// 'in-progress' sample value) rather than the ERP's own Title Case enums.
export const AFTER_SALES_STATUSES = ['new', 'in-progress', 'resolved', 'closed'];

// `aftersalesservices` belongs to the company's other live app (the public
// website's service-request form) — same shared-collection rule as
// productModel.js: no schema declared, raw collection ops only.
const afterSalesServices = () => mongoose.connection.db.collection('aftersalesservices');

export async function findAllAfterSalesServices() {
  return afterSalesServices().find({}).sort({ createdAt: -1 }).toArray();
}

export async function updateAfterSalesServiceStatus(id, status) {
  if (!mongoose.isValidObjectId(id)) return null;
  const _id = new mongoose.Types.ObjectId(id);
  await afterSalesServices().updateOne({ _id }, { $set: { status, updatedAt: new Date().toISOString() } });
  return afterSalesServices().findOne({ _id });
}
