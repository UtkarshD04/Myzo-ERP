import {
  findAllAfterSalesServices,
  updateAfterSalesServiceStatus,
  AFTER_SALES_STATUSES
} from '../models/afterSalesServiceModel.js';

export async function getAfterSalesServices(req, res) {
  const afterSalesServices = await findAllAfterSalesServices();
  res.json({ afterSalesServices });
}

export async function modifyAfterSalesServiceStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!AFTER_SALES_STATUSES.includes(status)) {
    const error = new Error(`status must be one of: ${AFTER_SALES_STATUSES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const afterSalesService = await updateAfterSalesServiceStatus(id, status);
  if (!afterSalesService) {
    const error = new Error('After-sales service request not found.');
    error.statusCode = 404;
    throw error;
  }

  const afterSalesServices = await findAllAfterSalesServices();
  res.json({ afterSalesService, afterSalesServices });
}
