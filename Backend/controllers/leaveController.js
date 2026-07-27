import { findAllLeaves } from '../models/leaveModel.js';
import { createLeaveRequest, updateLeaveStatus } from '../services/leaveService.js';

export async function getLeaves(req, res) {
  const leaves = await findAllLeaves();
  res.json({ leaves });
}

export async function requestLeave(req, res) {
  const result = await createLeaveRequest(req.body);
  res.status(201).json(result);
}

export async function modifyLeaveStatus(req, res) {
  const result = await updateLeaveStatus(req.params.id, req.body, req.headers['x-user-role']);
  res.json(result);
}
