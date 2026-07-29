import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  author: String,
  text: String,
  date: String
}, { _id: false });

const taskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, sparse: true },
  title: String,
  description: String,
  priority: { type: String, default: 'Medium' },
  dueDate: String,
  progress: { type: Number, default: 0 },
  status: { type: String, default: 'To Do' },
  comments: { type: [commentSchema], default: [] },
  type: { type: String, default: 'Today' },
  assignedTo: String,
  assignedBy: String
}, { timestamps: true });

export const Task = mongoose.model('Task', taskSchema);

export async function findAllTasks() {
  return Task.find({}).sort({ createdAt: -1 }).lean();
}

export async function findTaskById(id) {
  return Task.findOne({ id }).lean();
}

export async function createTask(task) {
  await Task.create(task);
  return findAllTasks();
}

export async function updateTask(taskId, updates) {
  await Task.findOneAndUpdate({ id: taskId }, updates);
  return findAllTasks();
}

// Mirrors TasksView's client-side visibleTasks filter: senior roles see
// everything, everyone else sees only tasks they're assigned to or assigned.
export function filterTasksForViewer(tasks, viewer) {
  if (['Manager', 'Admin', 'HR'].includes(viewer.role)) return tasks;
  return tasks.filter(t => t.assignedTo === viewer.id || t.assignedBy === viewer.id);
}
