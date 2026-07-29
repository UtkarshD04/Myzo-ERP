import { findAllCandidates } from '../models/candidateModel.js';
import { createCandidate, updateCandidate } from '../services/recruitmentService.js';
import { requireRole } from '../middleware/auth.js';

export async function getCandidates(req, res) {
  requireRole(req, 'Admin', 'HR');
  const candidates = await findAllCandidates();
  res.json({ candidates });
}

export async function addCandidate(req, res) {
  const result = await createCandidate(req.body, req.user.role);
  res.status(201).json(result);
}

export async function modifyCandidate(req, res) {
  const result = await updateCandidate(req.params.id, req.body, req.user.role);
  res.json(result);
}
