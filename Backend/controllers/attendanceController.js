import { checkIn, checkOut } from '../services/attendanceService.js';

export async function checkInEmployee(req, res) {
  const db = await checkIn({ employeeId: req.body.employeeId, location: req.body.location });
  res.status(201).json(db);
}

export async function checkOutEmployee(req, res) {
  const db = await checkOut({ employeeId: req.body.employeeId, location: req.body.location });
  res.json(db);
}
