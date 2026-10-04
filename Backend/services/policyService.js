import {
  createPolicyAcknowledgement,
  findAllPolicyAcknowledgements,
  findPolicyAcknowledgement,
  filterPolicyAcknowledgementsForViewer
} from '../models/policyAcknowledgementModel.js';
import { buildId } from './timeService.js';

// Server-side source of truth for which policies can be acknowledged and
// their current version. Must stay in step with Frontend/src/config/policies.js
// (which holds the display copy and PDF paths) — bump the version in both
// when a revised PDF is published so employees are asked to re-acknowledge.
export const POLICIES = {
  'code-of-conduct': { title: 'Code of Conduct', version: '1.0' },
  'hr-policy': { title: 'HR Policy Overview', version: '1.0' }
};

export async function acknowledgePolicy(policyId, user) {
  const policy = POLICIES[policyId];
  if (!policy) {
    const error = new Error('Policy not found.');
    error.statusCode = 404;
    throw error;
  }

  const existing = await findPolicyAcknowledgement(policyId, policy.version, user.id);
  if (!existing) {
    try {
      await createPolicyAcknowledgement({
        id: buildId('ACK') + Math.random().toString(36).slice(2, 6).toUpperCase(),
        policyId,
        policyVersion: policy.version,
        employeeId: user.id,
        employeeName: user.name,
        acknowledgedAt: new Date()
      });
    } catch (err) {
      // A double-click can race two inserts past the findOne above; the
      // unique index keeps just one, which is exactly the desired outcome.
      if (err.code !== 11000) throw err;
    }
  }

  const policyAcknowledgements = filterPolicyAcknowledgementsForViewer(await findAllPolicyAcknowledgements(), user);
  return { policyAcknowledgements };
}
