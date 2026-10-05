import mongoose from 'mongoose';

export const INTERVIEW_MODES = ['Online', 'Offline'];
export const INTERVIEW_RESULTS = ['Selected', 'Rejected', 'On Hold', 'Next Round', 'No Show'];

const interviewLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, sparse: true },
  date: { type: String, required: true }, // YYYY-MM-DD, the day the interview took place
  candidateName: { type: String, required: true },
  candidatePhone: String,
  mode: { type: String, enum: INTERVIEW_MODES, required: true },
  domain: { type: String, required: true }, // role/department the candidate was interviewed for
  result: { type: String, enum: INTERVIEW_RESULTS, required: true },
  notes: String,
  conductedBy: { type: String, required: true }, // employee id of the HR who logged it
  conductedByName: String
}, { timestamps: true });

export const InterviewLog = mongoose.model('InterviewLog', interviewLogSchema);

// month: 'YYYY-MM'. HR sees only their own entries; Admin sees everyone's.
export async function findInterviewLogs({ month, viewer, conductedBy }) {
  const query = {};
  if (month) query.date = { $regex: `^${month}-` };
  if (viewer.role === 'Admin') {
    if (conductedBy) query.conductedBy = conductedBy;
  } else {
    query.conductedBy = viewer.id;
  }
  return InterviewLog.find(query).sort({ date: -1, createdAt: -1 }).lean();
}
