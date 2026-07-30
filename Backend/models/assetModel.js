import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, sparse: true },
  assetTag: String,
  name: { type: String, required: true },
  category: { type: String, default: 'Other' },
  serialNumber: String,
  purchaseDate: String,
  purchaseCost: { type: Number, default: 0 },
  assignedTo: { type: String, default: null },
  assignedToName: { type: String, default: null },
  status: { type: String, default: 'In Storage' }, // In Use, In Storage, Under Repair, Retired
  condition: { type: String, default: 'Good' }, // Good, Fair, Damaged
  location: String,
  warrantyExpiry: String,
  notes: String
}, { timestamps: true });

export const Asset = mongoose.model('Asset', assetSchema);

export async function findAllAssets() {
  return Asset.find({}).sort({ createdAt: -1 }).lean();
}

export async function createAssetRecord(record) {
  return Asset.create(record);
}

export async function updateAssetById(id, updates) {
  await Asset.findOneAndUpdate({ id }, updates);
  return findAllAssets();
}

// Admin/HR (asset custodians) see the full directory; everyone else only
// sees the assets currently assigned to them.
export function filterAssetsForViewer(assets, viewer) {
  if (viewer.role === 'Admin' || viewer.role === 'HR') return assets;
  return assets.filter(a => a.assignedTo === viewer.id);
}
