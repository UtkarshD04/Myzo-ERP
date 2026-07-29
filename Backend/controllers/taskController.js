import { createTask, findAllTasks, findTaskById, updateTask, filterTasksForViewer } from '../models/taskModel.js';
import { buildId } from '../services/timeService.js';
import { requireRole } from '../middleware/auth.js';

const TASK_SENIOR_ROLES = ['Manager', 'Admin', 'HR'];

export async function getTasks(req, res) {
  const tasks = filterTasksForViewer(await findAllTasks(), req.user);
  res.json({ tasks });
}

export async function addTask(req, res) {
  requireRole(req, ...TASK_SENIOR_ROLES);

  const { title, description, priority, dueDate, type, assignedTo } = req.body;
  const task = {
    id: buildId('TSK'),
    title,
    description,
    priority,
    dueDate,
    type,
    assignedTo: assignedTo || req.user.id,
    // assignedBy is the server-trusted creator, never taken from the body.
    assignedBy: req.user.id,
    comments: [],
    progress: 0,
    status: 'To Do'
  };
  const tasks = await createTask(task);
  res.status(201).json({ tasks: filterTasksForViewer(tasks, req.user) });
}

export async function modifyTask(req, res) {
  const { id } = req.params;
  const existing = await findTaskById(id);
  if (!existing) {
    const error = new Error('Task not found.');
    error.statusCode = 404;
    throw error;
  }

  const isParticipant = req.user.id === existing.assignedTo || req.user.id === existing.assignedBy;
  const isSenior = TASK_SENIOR_ROLES.includes(req.user.role);
  if (!isParticipant && !isSenior) {
    const error = new Error('Access denied. You do not have permission to modify this task.');
    error.statusCode = 403;
    throw error;
  }

  const tasks = await updateTask(id, req.body);
  res.json({ tasks: filterTasksForViewer(tasks, req.user) });
}

