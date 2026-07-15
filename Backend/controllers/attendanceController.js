import { checkIn, checkOut } from '../services/attendanceService.js';

export async function checkInEmployee(req, res) {
  const db = await checkIn(req.body);
  res.status(201).json(db);
}

export async function checkOutEmployee(req, res) {
  const db = await checkOut(req.body);
  res.json(db);
}
