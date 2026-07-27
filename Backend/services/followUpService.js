import { findQuotationsDueForFollowUp, updateQuotation } from '../models/quotationModel.js';
import { addNotification } from '../models/notificationModel.js';
import { buildId } from './timeService.js';

const FOLLOW_UP_DAYS = Number(process.env.QUOTATION_FOLLOWUP_DAYS) || 3;

// Surfaces an in-app reminder for quotations that have sat in "Sent" without
// a customer response for FOLLOW_UP_DAYS, and keeps nudging every interval
// after that until the status moves on.
export async function checkPendingQuotationFollowUps() {
  const due = await findQuotationsDueForFollowUp(FOLLOW_UP_DAYS);

  for (const quotation of due) {
    await updateQuotation(quotation.id, {
      lastFollowUpAt: new Date(),
      followUpCount: (quotation.followUpCount || 0) + 1
    });

    await addNotification({
      id: buildId('NOT'),
      title: 'Quotation Follow-up Due',
      message: `Quotation ${quotation.id} for ${quotation.customerName} has been pending in "Sent" status for ${FOLLOW_UP_DAYS}+ days. Consider following up.`,
      time: 'Just now',
      read: false,
      category: 'Quotation'
    });
  }

  return due.length;
}
