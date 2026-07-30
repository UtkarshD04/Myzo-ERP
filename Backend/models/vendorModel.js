import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, sparse: true },
  name: { type: String, required: true },
  contactPerson: String,
  email: String,
  phone: String,
  address: String,
  category: { type: String, default: 'Other' },
  gstNumber: String,
  status: { type: String, default: 'Active' }, // Active, Inactive
  notes: String
}, { timestamps: true });

export const Vendor = mongoose.model('Vendor', vendorSchema);

export async function findAllVendors() {
  return Vendor.find({}).sort({ createdAt: -1 }).lean();
}

export async function createVendorRecord(record) {
  return Vendor.create(record);
}

export async function updateVendorById(id, updates) {
  await Vendor.findOneAndUpdate({ id }, updates);
  return findAllVendors();
}

// Same tier as Purchase Orders (purchaseOrderModel.filterPurchaseOrdersForViewer)
// — vendor pricing/contact terms are procurement-sensitive.
export function filterVendorsForViewer(vendors, viewer) {
  return (viewer.role === 'Admin' || viewer.role === 'Manager') ? vendors : [];
}
