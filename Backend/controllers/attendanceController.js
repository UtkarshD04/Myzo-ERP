import { checkIn, checkOut } from '../services/attendanceService.js';
import { filterAttendanceForViewer } from '../models/attendanceModel.js';

export async function checkInEmployee(req, res) {
  // employeeId comes from the verified JWT, never the body — otherwise any
  // employee could check another employee in/out by passing their id.
  const result = await checkIn({ employeeId: req.user.id, location: req.body.location });
  res.status(201).json({ ...result, attendance: filterAttendanceForViewer(result.attendance, req.user) });
}

export async function checkOutEmployee(req, res) {
  const result = await checkOut({ employeeId: req.user.id, location: req.body.location });
  res.json({ ...result, attendance: filterAttendanceForViewer(result.attendance, req.user) });
}
