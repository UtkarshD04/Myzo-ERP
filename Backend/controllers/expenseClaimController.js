import { findAllExpenseClaims, filterExpenseClaimsForViewer } from '../models/expenseClaimModel.js';
import { createExpenseClaim, updateExpenseClaimStatus } from '../services/expenseClaimService.js';

export async function getExpenseClaims(req, res) {
  const expenseClaims = filterExpenseClaimsForViewer(await findAllExpenseClaims(), req.user);
  res.json({ expenseClaims });
}

export async function addExpenseClaim(req, res) {
  const result = await createExpenseClaim({ ...req.body, employeeId: req.user.id });
  res.status(201).json({ ...result, expenseClaims: filterExpenseClaimsForViewer(result.expenseClaims, req.user) });
}

export async function modifyExpenseClaimStatus(req, res) {
  const result = await updateExpenseClaimStatus(req.params.id, req.body, req.user.role, req.user.id);
  res.json({ ...result, expenseClaims: filterExpenseClaimsForViewer(result.expenseClaims, req.user) });
}
