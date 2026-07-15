import { readDb } from '../db/fileDb.js';
import { Employee } from '../models/employeeModel.js';

export async function getBootstrapData(req, res) {
  const db = await readDb();
  const rawEmployees = await Employee.find({}, { password: 0 }).lean();

  // Normalize so frontend always gets officialEmail and id fields
  const employees = rawEmployees.map(e => ({
    ...e,
    id: e.id || e.empId || e._id.toString(),
    officialEmail: e.officialEmail || e.email,
  }));

  res.json({ ...db, employees });
}
