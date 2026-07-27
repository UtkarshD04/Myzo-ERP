import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  author: String,
  text: String,
  date: String
}, { _id: false });

const candidateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, sparse: true },
  name: { type: String, required: true },
  email: String,
  phone: String,
  position: String,
  department: String,
  source: String,
  resumeLink: String,
  stage: { type: String, default: 'Applied' },
  notes: [noteSchema],
  interviewDate: String,
  interviewer: String,
  offerSalary: Number,
  rejectionReason: String,
  addedBy: String,
  hiredAt: { type: Date, default: null }
}, { timestamps: true });

export const Candidate = mongoose.model('Candidate', candidateSchema);

export async function findAllCandidates() {
  return Candidate.find({}).sort({ createdAt: -1 }).lean();
}

export async function createCandidateRecord(record) {
  return Candidate.create(record);
}

export async function updateCandidateById(id, updates) {
  await Candidate.findOneAndUpdate({ id }, updates);
  return findAllCandidates();
}
