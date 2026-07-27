import {
  Candidate,
  createCandidateRecord,
  updateCandidateById,
  findAllCandidates
} from '../models/candidateModel.js';
import { createOnboardingRecord, findAllOnboarding } from '../models/onboardingModel.js';
import { addNotification } from '../models/notificationModel.js';
import { buildId } from './timeService.js';

const HR_ROLES = ['Admin', 'HR'];
const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

const DEFAULT_CHECKLIST = [
  'Offer Letter Signed',
  'Documents Collected',
  'Employee ID Created',
  'Email & System Access Setup',
  'Laptop / Assets Assigned',
  'Bank Details Collected',
  'Induction & Policy Briefing',
  'Workstation Setup'
];

function requireHR(role) {
  if (!HR_ROLES.includes(role)) {
    const error = new Error('Access denied. Only Admin or HR can manage recruitment.');
    error.statusCode = 403;
    throw error;
  }
}

export async function createCandidate(payload = {}, requesterRole) {
  requireHR(requesterRole);

  if (!payload.name || !payload.position) {
    const error = new Error('Candidate name and position are required.');
    error.statusCode = 400;
    throw error;
  }

  await createCandidateRecord({
    id: buildId('CAN'),
    name: payload.name,
    email: payload.email || '',
    phone: payload.phone || '',
    position: payload.position,
    department: payload.department || '',
    source: payload.source || '',
    resumeLink: payload.resumeLink || '',
    stage: 'Applied',
    notes: [],
    addedBy: payload.addedBy || requesterRole
  });

  const notifications = await addNotification({
    id: buildId('NOT'),
    title: 'New Candidate Added',
    message: `${payload.name} added to the recruitment pipeline for ${payload.position}.`,
    time: 'Just now',
    read: false,
    category: 'Recruitment'
  });

  const candidates = await findAllCandidates();
  return { notifications, candidates };
}

export async function updateCandidate(id, updates = {}, requesterRole) {
  requireHR(requesterRole);

  const candidate = await Candidate.findOne({ id }).lean();
  if (!candidate) {
    const error = new Error('Candidate not found.');
    error.statusCode = 404;
    throw error;
  }

  if (updates.stage && !STAGES.includes(updates.stage)) {
    const error = new Error(`Stage must be one of: ${STAGES.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const patch = {};
  ['stage', 'interviewDate', 'interviewer', 'offerSalary', 'rejectionReason'].forEach(key => {
    if (updates[key] !== undefined) patch[key] = updates[key];
  });

  if (updates.note) {
    patch.notes = [
      ...(candidate.notes || []),
      {
        author: updates.author || requesterRole,
        text: updates.note,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }
    ];
  }

  const movingToHired = patch.stage === 'Hired' && candidate.stage !== 'Hired';
  if (movingToHired) patch.hiredAt = new Date();

  await updateCandidateById(id, patch);

  let onboarding = await findAllOnboarding();
  if (movingToHired && !onboarding.some(o => o.candidateId === id)) {
    await createOnboardingRecord({
      id: buildId('ONB'),
      candidateId: id,
      candidateName: candidate.name,
      position: candidate.position,
      department: candidate.department,
      employeeId: null,
      startDate: updates.startDate || new Date().toISOString().split('T')[0],
      items: DEFAULT_CHECKLIST.map((label, i) => ({
        id: `ITM-${i + 1}`,
        label,
        done: false,
        completedBy: null,
        completedAt: null
      })),
      status: 'In Progress',
      createdBy: requesterRole
    });
    onboarding = await findAllOnboarding();
  }

  const notifications = await addNotification({
    id: buildId('NOT'),
    title: patch.stage ? `Candidate Moved to ${patch.stage}` : 'Candidate Updated',
    message: `${candidate.name}'s recruitment record was updated${patch.stage ? ` to "${patch.stage}"` : ''}.`,
    time: 'Just now',
    read: false,
    category: 'Recruitment'
  });

  const candidates = await findAllCandidates();
  return { notifications, candidates, onboarding };
}
