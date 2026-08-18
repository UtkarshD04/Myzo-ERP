import { getOrCreateCompanyBank, updateCompanyBank } from '../models/companyBankModel.js';

// Same tier as payroll itself (payrollController.requireAdminOrHR) — this
// config feeds directly into the payroll-to-bank flow.
function requireAdminOrHR(req) {
  const role = req.user.role;
  if (role !== 'Admin' && role !== 'HR') {
    const error = new Error('Access denied. Only Admins or HR can manage the company bank account.');
    error.statusCode = 403;
    throw error;
  }
}

export async function getCompanyBankSettings(req, res) {
  requireAdminOrHR(req);
  const companyBank = await getOrCreateCompanyBank();
  res.json({ companyBank });
}

const COMPANY_BANK_EDITABLE_FIELDS = [
  'accountHolderName', 'bankName', 'branch', 'accountNumber', 'ifscCode',
  'bankManagerName', 'bankManagerEmail', 'bankManagerPhone',
  'chequeLeafImage', 'chequeFieldPositions'
];

export async function updateCompanyBankSettings(req, res) {
  requireAdminOrHR(req);

  const updates = {};
  for (const field of COMPANY_BANK_EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const companyBank = await updateCompanyBank(updates);
  res.json({ companyBank });
}
