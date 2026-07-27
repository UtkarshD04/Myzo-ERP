import { createTask, findAllTasks, updateTask } from '../models/taskModel.js';
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
  const tasks = await createTask(task);
  res.status(201).json({ tasks });
}

export async function modifyTask(req, res) {
  const { id } = req.params;
  const tasks = await updateTask(id, req.body);
  res.json({ tasks });
}

