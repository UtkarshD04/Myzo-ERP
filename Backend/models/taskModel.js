import { readDb, updateDb } from '../db/fileDb.js';

export async function findAllTasks() {
  const db = await readDb();
  return db.tasks;
}

export async function createTask(task) {
  return updateDb((db) => ({
    ...db,
    tasks: [task, ...db.tasks]
  }));
}
