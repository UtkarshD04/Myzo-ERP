import mongoose from 'mongoose';

// One record per (employee, policy, version): an employee signs the
// acknowledgment once per published version, so a policy revision (bumping
// its version in services/policyService.js) asks everyone to re-affirm,
// matching the Code of Conduct's own "re-affirm following material updates".
const policyAcknowledgementSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, sparse: true },
  policyId: { type: String, required: true },
  policyVersion: { type: String, required: true },
  employeeId: { type: String, required: true },
  employeeName: String,
  acknowledgedAt: { type: Date, default: Date.now }
}, { timestamps: true });

policyAcknowledgementSchema.index({ policyId: 1, policyVersion: 1, employeeId: 1 }, { unique: true });

export const PolicyAcknowledgement = mongoose.model(
  'PolicyAcknowledgement',
  policyAcknowledgementSchema,
  'policy_acknowledgements'
);

export async function findAllPolicyAcknowledgements() {
  return PolicyAcknowledgement.find({}).sort({ acknowledgedAt: -1 }).lean();
}

export async function findPolicyAcknowledgement(policyId, policyVersion, employeeId) {
  return PolicyAcknowledgement.findOne({ policyId, policyVersion, employeeId }).lean();
}

export async function createPolicyAcknowledgement(record) {
  return PolicyAcknowledgement.create(record);
}

// Admin/HR track who has signed company-wide; everyone else only ever needs
// (and only ever sees) their own acknowledgments.
export function filterPolicyAcknowledgementsForViewer(acknowledgements, viewer) {
  if (viewer.role === 'Admin' || viewer.role === 'HR') return acknowledgements;
  return acknowledgements.filter(a => a.employeeId === viewer.id);
}
