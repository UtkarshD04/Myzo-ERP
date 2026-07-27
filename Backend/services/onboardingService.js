import { Onboarding, updateOnboardingById } from '../models/onboardingModel.js';
import { addNotification } from '../models/notificationModel.js';
import { buildId } from './timeService.js';

const HR_ROLES = ['Admin', 'HR'];

function requireHR(role) {
  if (!HR_ROLES.includes(role)) {
    const error = new Error('Access denied. Only Admin or HR can manage onboarding.');
    error.statusCode = 403;
    throw error;
  }
}

export async function updateOnboardingRecord(id, updates = {}, requesterRole) {
  requireHR(requesterRole);

  const record = await Onboarding.findOne({ id }).lean();
  if (!record) {
    const error = new Error('Onboarding record not found.');
    error.statusCode = 404;
    throw error;
  }

  const patch = {};

  if (updates.itemId) {
    const items = (record.items || []).map(item => item.id === updates.itemId
      ? {
          ...item,
          done: !!updates.done,
          completedBy: updates.done ? (updates.completedBy || requesterRole) : null,
          completedAt: updates.done ? new Date() : null
        }
      : item
    );
    patch.items = items;
    patch.status = items.length > 0 && items.every(i => i.done) ? 'Completed' : 'In Progress';
  }

  if (updates.employeeId !== undefined) patch.employeeId = updates.employeeId;
  if (updates.startDate) patch.startDate = updates.startDate;

  const onboarding = await updateOnboardingById(id, patch);

  const notifications = await addNotification({
    id: buildId('NOT'),
    title: patch.status === 'Completed' ? 'Onboarding Completed' : 'Onboarding Checklist Updated',
    message: `${record.candidateName}'s onboarding checklist was updated.`,
    time: 'Just now',
    read: false,
    category: 'Recruitment'
  });

  return { notifications, onboarding };
}
