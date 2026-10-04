import { findAllPolicyAcknowledgements, filterPolicyAcknowledgementsForViewer } from '../models/policyAcknowledgementModel.js';
import { acknowledgePolicy } from '../services/policyService.js';

export async function getPolicyAcknowledgements(req, res) {
  const policyAcknowledgements = filterPolicyAcknowledgementsForViewer(await findAllPolicyAcknowledgements(), req.user);
  res.json({ policyAcknowledgements });
}

// Always acknowledges as the signed-in user (req.user from the session
// token) — never an employee id from the request body.
export async function addPolicyAcknowledgement(req, res) {
  const result = await acknowledgePolicy(req.params.policyId, req.user);
  res.status(201).json(result);
}
