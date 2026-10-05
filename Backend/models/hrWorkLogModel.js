import mongoose from 'mongoose';

export const HR_ACTIVITIES = ['Interview', 'Resume Screening', 'Phone Screening', 'Onboarding', 'Offer / Documentation', 'Other'];
export const INTERVIEW_MODES = ['Online', 'Offline'];
export const INTERVIEW_RESULTS = ['Selected', 'Rejected', 'On Hold', 'Next Round', 'No Show'];

// One row per piece of daily HR work. Interview rows carry the extra
// candidate/mode/domain/result fields; every other activity is a short
// description plus how many were done (count).
const hrWorkLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, sparse: true },
  date: { type: String, required: true }, // YYYY-MM-DD, the day the work was done
  activity: { type: String, enum: HR_ACTIVITIES, required: true },
  count: { type: Number, default: 1, min: 1 },
  description: String,
  candidateName: String,
  candidatePhone: String,
  mode: { type: String, enum: [...INTERVIEW_MODES, ''] },
  domain: String, // role/department the candidate was interviewed for
  result: { type: String, enum: [...INTERVIEW_RESULTS, ''] },
  loggedBy: { type: String, required: true }, // employee id of the HR who logged it
  loggedByName: String
}, { timestamps: true });

export const HrWorkLog = mongoose.model('HrWorkLog', hrWorkLogSchema);

// month: 'YYYY-MM'. HR sees only their own entries; Admin sees everyone's.
export async function findHrWorkLogs({ month, viewer, loggedBy }) {
  const query = {};
  if (month) query.date = { $regex: `^${month}-` };
  if (viewer.role === 'Admin') {
    if (loggedBy) query.loggedBy = loggedBy;
  } else {
    query.loggedBy = viewer.id;
  }
  return HrWorkLog.find(query).sort({ date: -1, createdAt: -1 }).lean();
}
