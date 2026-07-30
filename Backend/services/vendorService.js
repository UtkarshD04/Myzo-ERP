import {
  Vendor,
  createVendorRecord,
  updateVendorById,
  findAllVendors
} from '../models/vendorModel.js';
import { buildId } from './timeService.js';

const VENDOR_MANAGER_ROLES = ['Admin', 'Manager'];

function requireVendorManager(role) {
  if (!VENDOR_MANAGER_ROLES.includes(role)) {
    const error = new Error('Access denied. Only Admin or Manager can manage vendors.');
    error.statusCode = 403;
    throw error;
  }
}

export async function createVendor(payload = {}, requesterRole) {
  requireVendorManager(requesterRole);

  const { name } = payload;
  if (!name) {
    const error = new Error('Vendor name is required.');
    error.statusCode = 400;
    throw error;
  }

  await createVendorRecord({
    id: buildId('VEN'),
    name,
    contactPerson: payload.contactPerson || '',
    email: payload.email || '',
    phone: payload.phone || '',
    address: payload.address || '',
    category: payload.category || 'Other',
    gstNumber: payload.gstNumber || '',
    status: payload.status || 'Active',
    notes: payload.notes || ''
  });

  const vendors = await findAllVendors();
  return { vendors };
}

export async function updateVendor(id, updates = {}, requesterRole) {
  requireVendorManager(requesterRole);

  const vendor = await Vendor.findOne({ id }).lean();
  if (!vendor) {
    const error = new Error('Vendor not found.');
    error.statusCode = 404;
    throw error;
  }

  if (updates.status && !['Active', 'Inactive'].includes(updates.status)) {
    const error = new Error('Status must be Active or Inactive.');
    error.statusCode = 400;
    throw error;
  }

  const patch = {};
  for (const field of ['name', 'contactPerson', 'email', 'phone', 'address', 'category', 'gstNumber', 'status', 'notes']) {
    if (updates[field] !== undefined) patch[field] = updates[field];
  }

  const vendors = await updateVendorById(id, patch);
  return { vendors };
}
