import {
  Leave,
  createLeaveRecord,
  updateLeaveById,
  findAllLeaves
} from '../models/leaveModel.js';
import { Employee } from '../models/employeeModel.js';
import { addNotification } from '../models/notificationModel.js';
import { buildId } from './timeService.js';
import { sendLeaveStatusEmail } from './mailService.js';

const ESCALATED_ROLES = ['Manager', 'HR'];

function requiredApproverRole(leave) {
  return ESCALATED_ROLES.includes(leave.employeeRole) ? 'Admin' : 'HR';
}

function countLeaveDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let days = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0) days++; // exclude Sundays
  }
  return days;
}

export async function createLeaveRequest({ employeeId, leaveType, startDate, endDate, reason } = {}) {
  if (!employeeId || !startDate || !endDate) {
    const error = new Error('employeeId, startDate and endDate are required.');
    error.statusCode = 400;
    throw error;
  }
  if (new Date(endDate) < new Date(startDate)) {
    const error = new Error('End date cannot be before start date.');
    error.statusCode = 400;
    throw error;
  }

  const overlapping = await Leave.findOne({
    employeeId,
    status: { $in: ['Pending', 'Approved'] },
    startDate: { $lte: endDate },
    endDate: { $gte: startDate }
  }).lean();
  if (overlapping) {
    const error = new Error('You already have a leave request overlapping these dates.');
    error.statusCode = 409;
    throw error;
  }

  const emp = await Employee.findOne({ id: employeeId }).lean();
  const days = countLeaveDays(startDate, endDate);

  await createLeaveRecord({
    id: buildId('LVE'),
    employeeId,
    employeeName: emp?.name || null,
    employeeRole: emp?.role || null,
    department: emp?.department || null,
    designation: emp?.designation || null,
    leaveType: leaveType || 'Casual',
    startDate,
    endDate,
    days,
    reason: reason || '',
    status: 'Pending'
  });

  const notifications = await addNotification({
    id: buildId('NOT'),
    title: 'Leave Request Submitted',
    message: `${emp?.name || employeeId} applied for ${days} day(s) of ${leaveType || 'Casual'} leave, awaiting approval.`,
    time: 'Just now',
    read: false,
    category: 'Leave'
  });

  const leaves = await findAllLeaves();
  return { notifications, leaves };
}

export async function updateLeaveStatus(id, { status, reviewComments, reviewerName } = {}, requesterRole, requesterId) {
  const leave = await Leave.findOne({ id }).lean();
  if (!leave) {
    const error = new Error('Leave request not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!['Approved', 'Rejected', 'Cancelled'].includes(status)) {
    const error = new Error('Status must be Approved, Rejected or Cancelled.');
    error.statusCode = 400;
    throw error;
  }

  if (leave.status !== 'Pending') {
    const error = new Error('This leave request has already been reviewed.');
    error.statusCode = 409;
    throw error;
  }

  if (status === 'Cancelled') {
    // requesterId comes from the verified JWT (req.user.id), never from the
    // request body — otherwise any employee could cancel anyone's leave by
    // just passing that employee's id.
    if (requesterId !== leave.employeeId) {
      const error = new Error('Only the requester can cancel their own leave request.');
      error.statusCode = 403;
      throw error;
    }
  } else {
    const required = requiredApproverRole(leave);
    if (requesterRole !== required) {
      const error = new Error(`Access denied. Only ${required} can approve/reject this leave request.`);
      error.statusCode = 403;
      throw error;
    }
  }

  const leaves = await updateLeaveById(id, {
    status,
    reviewComments: reviewComments || null,
    reviewedBy: status === 'Cancelled' ? leave.employeeName : (reviewerName || requesterRole),
    reviewerRole: status === 'Cancelled' ? null : requesterRole,
    reviewedAt: new Date()
  });

  const notifications = await addNotification({
    id: buildId('NOT'),
    title: `Leave Request ${status}`,
    message: `${leave.employeeName || leave.employeeId}'s ${leave.leaveType} leave (${leave.startDate} to ${leave.endDate}) was ${status.toLowerCase()}.`,
    time: 'Just now',
    read: false,
    category: 'Leave'
  });

  if (status !== 'Cancelled') {
    const emp = await Employee.findOne({ id: leave.employeeId }).lean();
    const recipientEmail = emp?.officialEmail || emp?.email;
    if (recipientEmail) {
      // Best-effort: SMTP may be unconfigured, never let that break the approval flow.
      sendLeaveStatusEmail({ ...leave, status, reviewComments }, { ...emp, officialEmail: recipientEmail }).catch(() => {});
    }
  }

  return { notifications, leaves };
}
