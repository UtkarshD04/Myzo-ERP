import mongoose from 'mongoose';

const checklistItemSchema = new mongoose.Schema({
  id: String,
  label: String,
  done: { type: Boolean, default: false },
  completedBy: { type: String, default: null },
  completedAt: { type: Date, default: null }
}, { _id: false });

const onboardingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, sparse: true },
  candidateId: { type: String, required: true },
  candidateName: String,
  position: String,
  department: String,
  employeeId: { type: String, default: null },
  startDate: String,
  items: [checklistItemSchema],
  status: { type: String, default: 'In Progress' },
  createdBy: String
}, { timestamps: true });

export const Onboarding = mongoose.model('Onboarding', onboardingSchema, 'onboarding');

export async function findAllOnboarding() {
  return Onboarding.find({}).sort({ createdAt: -1 }).lean();
}

export async function createOnboardingRecord(record) {
  return Onboarding.create(record);
}

export async function updateOnboardingById(id, updates) {
  await Onboarding.findOneAndUpdate({ id }, updates);
  return findAllOnboarding();
}
