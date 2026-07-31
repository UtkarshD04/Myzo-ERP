import {
  findAllBecomePartners,
  updateBecomePartnerStatus,
  BECOME_PARTNER_STATUSES
} from '../models/becomePartnerModel.js';

export async function getBecomePartners(req, res) {
  const becomePartners = await findAllBecomePartners();
  res.json({ becomePartners });
}

export async function modifyBecomePartnerStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!BECOME_PARTNER_STATUSES.includes(status)) {
    const error = new Error(`status must be one of: ${BECOME_PARTNER_STATUSES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const becomePartner = await updateBecomePartnerStatus(id, status);
  if (!becomePartner) {
    const error = new Error('Partner request not found.');
    error.statusCode = 404;
    throw error;
  }

  const becomePartners = await findAllBecomePartners();
  res.json({ becomePartner, becomePartners });
}
