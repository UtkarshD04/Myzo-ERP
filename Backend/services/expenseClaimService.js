import {
  ExpenseClaim,
  createExpenseClaimRecord,
  updateExpenseClaimById,
  findAllExpenseClaims
} from '../models/expenseClaimModel.js';
import { Employee } from '../models/employeeModel.js';
import { addNotification } from '../models/notificationModel.js';
import { buildId } from './timeService.js';

const APPROVER_ROLES = ['Manager', 'HR', 'Admin'];
const REIMBURSER_ROLES = ['HR', 'Admin'];

export async function createExpenseClaim({ employeeId, category, amount, expenseDate, description, receiptImage } = {}) {
  if (!employeeId || !category || !expenseDate) {
    const error = new Error('category and expenseDate are required.');
    error.statusCode = 400;
    throw error;
  }
  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    const error = new Error('amount must be a positive number.');
    error.statusCode = 400;
    throw error;
  }

  const emp = await Employee.findOne({ id: employeeId }).lean();

  await createExpenseClaimRecord({
    id: buildId('EXP'),
    employeeId,
    employeeName: emp?.name || null,
    department: emp?.department || null,
    category,
    amount: numericAmount,
    expenseDate,
    description: description || '',
    receiptImage: receiptImage || '',
    status: 'Pending'
  });

  const notifications = await addNotification({
    id: buildId('NOT'),
    title: 'Expense Claim Submitted',
    message: `${emp?.name || employeeId} filed a ${category} expense claim of Rs. ${numericAmount.toLocaleString('en-IN')}, awaiting approval.`,
    time: 'Just now',
    read: false,
    category: 'Expense'
  });

  const expenseClaims = await findAllExpenseClaims();
  return { notifications, expenseClaims };
}

export async function updateExpenseClaimStatus(id, { status, reviewComments, reviewerName } = {}, requesterRole, requesterId) {
  const claim = await ExpenseClaim.findOne({ id }).lean();
  if (!claim) {
    const error = new Error('Expense claim not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!['Approved', 'Rejected', 'Reimbursed', 'Cancelled'].includes(status)) {
    const error = new Error('Status must be Approved, Rejected, Reimbursed or Cancelled.');
    error.statusCode = 400;
    throw error;
  }

  if (status === 'Cancelled') {
    if (requesterId !== claim.employeeId) {
      const error = new Error('Only the requester can cancel their own expense claim.');
      error.statusCode = 403;
      throw error;
    }
    if (claim.status !== 'Pending') {
      const error = new Error('Only a pending claim can be cancelled.');
      error.statusCode = 409;
      throw error;
    }
  } else if (status === 'Reimbursed') {
    if (!REIMBURSER_ROLES.includes(requesterRole)) {
      const error = new Error('Access denied. Only HR or Admin can mark a claim as reimbursed.');
      error.statusCode = 403;
      throw error;
    }
    if (claim.status !== 'Approved') {
      const error = new Error('Only an approved claim can be marked as reimbursed.');
      error.statusCode = 409;
      throw error;
    }
  } else {
    if (!APPROVER_ROLES.includes(requesterRole)) {
      const error = new Error('Access denied. Only Manager, HR or Admin can approve/reject expense claims.');
      error.statusCode = 403;
      throw error;
    }
    if (claim.status !== 'Pending') {
      const error = new Error('This expense claim has already been reviewed.');
      error.statusCode = 409;
      throw error;
    }
  }

  const expenseClaims = await updateExpenseClaimById(id, {
    status,
    reviewComments: reviewComments || null,
    reviewedBy: status === 'Cancelled' ? claim.employeeName : (reviewerName || requesterRole),
    reviewerRole: status === 'Cancelled' ? null : requesterRole,
    reviewedAt: new Date()
  });

  const notifications = await addNotification({
    id: buildId('NOT'),
    title: `Expense Claim ${status}`,
    message: `${claim.employeeName || claim.employeeId}'s ${claim.category} claim (Rs. ${Number(claim.amount).toLocaleString('en-IN')}) was ${status.toLowerCase()}.`,
    time: 'Just now',
    read: false,
    category: 'Expense'
  });

  return { notifications, expenseClaims };
}
