import { createCustomer, deleteCustomerById, findAllCustomers, updateCustomerById, LEAD_STATUSES } from '../models/customerModel.js';

export async function getCustomers(req, res) {
  const customers = await findAllCustomers();
  res.json({ customers });
}

export async function addCustomer(req, res) {
  const { name, email, phone, company, address, leadStatus } = req.body;

  if (!name || !email) {
    const error = new Error('Customer name and email are required.');
    error.statusCode = 400;
    throw error;
  }

  if (leadStatus && !LEAD_STATUSES.includes(leadStatus)) {
    const error = new Error(`leadStatus must be one of: ${LEAD_STATUSES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  try {
    const customers = await createCustomer({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || '').trim(),
      company: (company || '').trim(),
      address: (address || '').trim(),
      leadStatus: leadStatus || 'New'
    });
    res.status(201).json({ customers });
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error('A customer with this email already exists.');
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
}

export async function modifyCustomer(req, res) {
  const { id } = req.params;
  const { name, email, phone, company, address, leadStatus, isBlocked } = req.body;

  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (email !== undefined) updates.email = email.trim().toLowerCase();
  if (phone !== undefined) updates.phone = phone.trim();
  if (company !== undefined) updates.company = company.trim();
  if (address !== undefined) updates.address = address.trim();
  if (leadStatus !== undefined) {
    if (!LEAD_STATUSES.includes(leadStatus)) {
      const error = new Error(`leadStatus must be one of: ${LEAD_STATUSES.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }
    updates.leadStatus = leadStatus;
  }
  if (isBlocked !== undefined) {
    if (typeof isBlocked !== 'boolean') {
      const error = new Error('isBlocked must be a boolean.');
      error.statusCode = 400;
      throw error;
    }
    updates.isBlocked = isBlocked;
  }

  if (Object.keys(updates).length === 0) {
    const error = new Error('No valid fields provided to update.');
    error.statusCode = 400;
    throw error;
  }

  try {
    const customers = await updateCustomerById(id, updates);
    if (!customers) {
      const error = new Error('Customer not found.');
      error.statusCode = 404;
      throw error;
    }
    res.json({ customers });
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error('A customer with this email already exists.');
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
}

export async function removeCustomer(req, res) {
  const { id } = req.params;
  const customers = await deleteCustomerById(id);
  if (!customers) {
    const error = new Error('Customer not found.');
    error.statusCode = 404;
    throw error;
  }
  res.json({ customers });
}
