import { findAllOnboarding } from '../models/onboardingModel.js';
import { updateOnboardingRecord } from '../services/onboardingService.js';
import { requireRole } from '../middleware/auth.js';

export async function getOnboarding(req, res) {
  requireRole(req, 'Admin', 'HR');
  const onboarding = await findAllOnboarding();
  res.json({ onboarding });
}

export async function modifyOnboarding(req, res) {
  const result = await updateOnboardingRecord(req.params.id, req.body, req.user.role);
  res.json(result);
}
