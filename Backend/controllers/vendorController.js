import { findAllVendors } from '../models/vendorModel.js';
import { createVendor, updateVendor } from '../services/vendorService.js';
import { requireRole } from '../middleware/auth.js';

export async function getVendors(req, res) {
  requireRole(req, 'Admin', 'Manager');
  const vendors = await findAllVendors();
  res.json({ vendors });
}

export async function addVendor(req, res) {
  const result = await createVendor(req.body, req.user.role);
  res.status(201).json(result);
}

export async function modifyVendor(req, res) {
  const result = await updateVendor(req.params.id, req.body, req.user.role);
  res.json(result);
}
