import { findAllLeaves, filterLeavesForViewer } from '../models/leaveModel.js';
import { createLeaveRequest, updateLeaveStatus } from '../services/leaveService.js';

export async function getLeaves(req, res) {
  const leaves = filterLeavesForViewer(await findAllLeaves(), req.user);
  res.json({ leaves });
}

export async function requestLeave(req, res) {
  const result = await createLeaveRequest(req.body);
  res.status(201).json({ ...result, leaves: filterLeavesForViewer(result.leaves, req.user) });
}

export async function modifyLeaveStatus(req, res) {
  const result = await updateLeaveStatus(req.params.id, req.body, req.user.role, req.user.id);
  res.json({ ...result, leaves: filterLeavesForViewer(result.leaves, req.user) });
}
