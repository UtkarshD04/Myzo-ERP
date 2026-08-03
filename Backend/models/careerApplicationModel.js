import mongoose from 'mongoose';

// Matches the lowercase statuses the website already writes (see
// productEnquiryModel.js) rather than the ERP's own Title Case enums.
export const CAREER_APPLICATION_STATUSES = ['new', 'reviewing', 'shortlisted', 'rejected'];

// `careerapplications` belongs to the company's other live app (the public
// website's careers page) — same shared-collection rule as productModel.js:
// no schema declared, raw collection ops only.
const careerApplications = () => mongoose.connection.db.collection('careerapplications');

export async function findAllCareerApplications() {
  return careerApplications().find({}).sort({ createdAt: -1 }).toArray();
}

export async function updateCareerApplicationStatus(id, status) {
  if (!mongoose.isValidObjectId(id)) return null;
  const _id = new mongoose.Types.ObjectId(id);
  await careerApplications().updateOne({ _id }, { $set: { status, updatedAt: new Date().toISOString() } });
  return careerApplications().findOne({ _id });
}

// Recruitment data (who applied, contact details) is HR-only — same rule as
// candidateModel.js's filterCandidatesForViewer.
export function filterCareerApplicationsForViewer(applications, viewer) {
  return (viewer.role === 'Admin' || viewer.role === 'HR') ? applications : [];
}
