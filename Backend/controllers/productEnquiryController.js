import {
  findAllProductEnquiries,
  updateProductEnquiryStatus,
  PRODUCT_ENQUIRY_STATUSES
} from '../models/productEnquiryModel.js';

export async function getProductEnquiries(req, res) {
  const productEnquiries = await findAllProductEnquiries();
  res.json({ productEnquiries });
}

export async function modifyProductEnquiryStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!PRODUCT_ENQUIRY_STATUSES.includes(status)) {
    const error = new Error(`status must be one of: ${PRODUCT_ENQUIRY_STATUSES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const productEnquiry = await updateProductEnquiryStatus(id, status);
  if (!productEnquiry) {
    const error = new Error('Product enquiry not found.');
    error.statusCode = 404;
    throw error;
  }

  const productEnquiries = await findAllProductEnquiries();
  res.json({ productEnquiry, productEnquiries });
}
