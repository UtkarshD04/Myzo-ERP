import {
  findAllCareerApplications,
  updateCareerApplicationStatus,
  CAREER_APPLICATION_STATUSES
} from '../models/careerApplicationModel.js';
import { requireRole } from '../middleware/auth.js';

// Unlike product enquiries / after-sales / become-partner, recruitment data
// is HR-only — gate both the list and the update, same as candidateController.
export async function getCareerApplications(req, res) {
  requireRole(req, 'Admin', 'HR');
  const careerApplications = await findAllCareerApplications();
  res.json({ careerApplications });
}

export async function modifyCareerApplicationStatus(req, res) {
  requireRole(req, 'Admin', 'HR');
  const { id } = req.params;
  const { status } = req.body;

  if (!CAREER_APPLICATION_STATUSES.includes(status)) {
    const error = new Error(`status must be one of: ${CAREER_APPLICATION_STATUSES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const careerApplication = await updateCareerApplicationStatus(id, status);
  if (!careerApplication) {
    const error = new Error('Career application not found.');
    error.statusCode = 404;
    throw error;
  }

  const careerApplications = await findAllCareerApplications();
  res.json({ careerApplication, careerApplications });
}
