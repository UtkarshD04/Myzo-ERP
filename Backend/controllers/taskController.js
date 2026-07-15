import { createTask, findAllTasks } from '../models/taskModel.js';
import { buildId } from '../services/timeService.js';

export async function getTasks(req, res) {
  const tasks = await findAllTasks();
  res.json({ tasks });
}

export async function addTask(req, res) {
  const task = {
    id: buildId('TSK'),
    comments: [],
    progress: 0,
    status: 'To Do',
    ...req.body
  };
  const db = await createTask(task);
  res.status(201).json(db);
}
