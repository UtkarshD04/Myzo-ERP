import { createQuotation, findAllQuotations, findQuotationById, updateQuotation } from '../models/quotationModel.js';
import { syncLeadStageForQuotationStatus } from '../models/customerModel.js';
import { buildId } from '../services/timeService.js';
import { sendQuotationEmail, sendQuotationFollowUpEmail } from '../services/mailService.js';
import { addNotification } from '../models/notificationModel.js';
import { requireOwnerOrRole } from '../middleware/auth.js';

// A quotation belongs to the salesperson who created it; only they (or a
// Manager/Admin stepping in on their behalf) may edit or convert it.
const QUOTATION_OVERRIDE_ROLES = ['Admin', 'Manager'];

function computeTotals({ items = [], discountPercent = 0, gstMode = 'split', cgstRate = 0, sgstRate = 0, igstRate = 0, taxType = 'None', taxRate = 0, adjustment = 0 }) {
  const computedItems = items.map(item => {
    // There is no server-side price catalog to check these against (the
    // `products` collection belongs to another app and carries no price
    // field — unit prices are legitimately negotiated per quote). The one
    // invariant we CAN enforce is that a line can't go negative and inflate
    // the total, e.g. via a negative discount or negative quantity/price.
    const quantity = Math.max(Number(item.quantity) || 0, 0);
    const unitPrice = Math.max(Number(item.unitPrice) || 0, 0);
    const discount = Math.max(Number(item.discount) || 0, 0);
    const lineTotal = Math.max(quantity * unitPrice - discount, 0);
    return { ...item, quantity, unitPrice, discount, lineTotal };
  });

  const subtotal = computedItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const lineDiscountTotal = computedItems.reduce((sum, item) => sum + item.discount, 0);
  const afterLineDiscount = computedItems.reduce((sum, item) => sum + item.lineTotal, 0);

  const overallDiscountAmount = afterLineDiscount * (Number(discountPercent) || 0) / 100;
  const afterOverallDiscount = afterLineDiscount - overallDiscountAmount;

  // CGST+SGST (intra-state) and IGST (inter-state) are mutually exclusive.
  const isIGST = gstMode === 'igst';
  const cgstAmount = isIGST ? 0 : afterOverallDiscount * (Number(cgstRate) || 0) / 100;
  const sgstAmount = isIGST ? 0 : afterOverallDiscount * (Number(sgstRate) || 0) / 100;
  const igstAmount = isIGST ? afterOverallDiscount * (Number(igstRate) || 0) / 100 : 0;

  // TCS is collected on top of the sale amount.
  const rawTax = afterOverallDiscount * (Number(taxRate) || 0) / 100;
  const taxAmount = taxType === 'TCS' ? rawTax : 0;

  const totalAmount = afterOverallDiscount + cgstAmount + sgstAmount + igstAmount + taxAmount + (Number(adjustment) || 0);

  return {
    items: computedItems,
    subtotal,
    discountPercent: Number(discountPercent) || 0,
    discountTotal: lineDiscountTotal + overallDiscountAmount,
    gstMode: isIGST ? 'igst' : 'split',
    cgstRate: isIGST ? 0 : Number(cgstRate) || 0,
    cgstAmount,
    sgstRate: isIGST ? 0 : Number(sgstRate) || 0,
    sgstAmount,
    igstRate: isIGST ? Number(igstRate) || 0 : 0,
    igstAmount,
    taxType,
    taxRate: Number(taxRate) || 0,
    taxAmount,
    adjustment: Number(adjustment) || 0,
    totalAmount
  };
}

export async function getQuotations(req, res) {
  const quotations = await findAllQuotations();
  res.json({ quotations });
}

export async function addQuotation(req, res) {
  // salesperson/createdBy are stripped out of bodyRest here and re-applied
  // below from req.user — commission is paid out against `salesperson`
  // (see payrollController.js), so it must never be client-supplied, same
  // as employeeId in attendanceController.js / assignedBy in taskController.js.
  const { customerName, items, sendToCustomer, salesperson, salespersonName, createdBy, createdByName, ...bodyRest } = req.body;

  if (!customerName || !Array.isArray(items) || items.length === 0) {
    const error = new Error('Customer name and at least one product line item are required.');
    error.statusCode = 400;
    throw error;
  }

  if (sendToCustomer && !bodyRest.customerEmail) {
    const error = new Error('Customer email is required to send this quotation.');
    error.statusCode = 400;
    throw error;
  }

  const totals = computeTotals(req.body);
  const id = bodyRest.id || buildId('QUO');
  const draftQuotation = {
    ...bodyRest,
    customerName,
    items,
    id,
    ...totals,
    salesperson: req.user.id,
    salespersonName: req.user.name,
    createdBy: req.user.id,
    createdByName: req.user.name
  };

  let emailError = null;
  if (sendToCustomer) {
    try {
      await sendQuotationEmail(draftQuotation);
    } catch (err) {
      emailError = err.message;
    }
  }

  try {
    const status = sendToCustomer && !emailError ? 'Sent' : 'Draft';
    const quotation = { ...draftQuotation, status, sentAt: status === 'Sent' ? new Date() : null };
    const quotations = await createQuotation(quotation);
    await syncLeadStageForQuotationStatus(quotation.customerEmail, quotation.status);
    res.status(201).json({ quotations, emailSent: sendToCustomer && !emailError, emailError });
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error('A quotation with this number already exists.');
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
}

// Client-editable fields only. Ownership (salesperson/createdBy) and every
// computed total (subtotal, taxes, totalAmount, ...) are deliberately left
// off this list — they're either server-assigned at creation or derived by
// computeTotals() below, never taken verbatim from the request body, since
// totalAmount feeds straight into commission payout (payrollController.js).
const QUOTATION_EDITABLE_FIELDS = [
  'referenceNumber', 'quoteDate', 'customerName', 'customerPhone', 'customerEmail',
  'customerAddress', 'subject', 'items', 'discountPercent', 'gstMode', 'cgstRate',
  'sgstRate', 'igstRate', 'taxType', 'taxRate', 'adjustment', 'status', 'validUntil',
  'customerNotes', 'termsAndConditions'
];

export async function modifyQuotation(req, res) {
  const { id } = req.params;

  const existing = await findQuotationById(id);
  if (!existing) {
    const error = new Error('Quotation not found.');
    error.statusCode = 404;
    throw error;
  }
  requireOwnerOrRole(req, existing.salesperson, ...QUOTATION_OVERRIDE_ROLES);

  const updates = {};
  for (const field of QUOTATION_EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  if (Array.isArray(updates.items)) {
    Object.assign(updates, computeTotals(updates));
  }

  if (updates.status === 'Sent') {
    // A (re-)send restarts the follow-up clock, whether this is the first
    // send or a re-send after edits.
    updates.sentAt = new Date();
    updates.lastFollowUpAt = null;
    updates.followUpCount = 0;
  }

  if (updates.status === 'Accepted') {
    // Marks when the deal closed, so payroll can attribute commission to the
    // month the sale actually landed in rather than when it was first quoted.
    updates.acceptedAt = new Date();
  }

  const quotations = await updateQuotation(id, updates);

  if (updates.status) {
    const updated = quotations.find(q => q.id === id);
    if (updated) {
      await syncLeadStageForQuotationStatus(updated.customerEmail, updates.status);
    }
  }

  res.json({ quotations });
}

export async function sendQuotationFollowUp(req, res) {
  const { id } = req.params;
  const quotation = await findQuotationById(id);

  if (!quotation) {
    const error = new Error('Quotation not found.');
    error.statusCode = 404;
    throw error;
  }

  if (quotation.status !== 'Sent') {
    const error = new Error('Only quotations in "Sent" status can be followed up on.');
    error.statusCode = 400;
    throw error;
  }

  let emailError = null;
  if (quotation.customerEmail) {
    try {
      await sendQuotationFollowUpEmail(quotation);
    } catch (err) {
      emailError = err.message;
    }
  }

  const quotations = await updateQuotation(id, {
    lastFollowUpAt: new Date(),
    followUpCount: (quotation.followUpCount || 0) + 1
  });

  const notifications = await addNotification({
    id: buildId('NOT'),
    title: 'Quotation Follow-up Sent',
    message: `Follow-up sent to ${quotation.customerName} for quotation ${quotation.id}.`,
    time: 'Just now',
    read: false,
    category: 'Quotation'
  });

  res.json({ quotations, notifications, emailSent: !!quotation.customerEmail && !emailError, emailError });
}
