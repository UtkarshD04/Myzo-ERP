import { createHoliday, deleteHolidayById } from '../models/holidayModel.js';
import { getAllHolidays } from '../services/holidayService.js';
import { buildId } from '../services/timeService.js';
import { requireRole } from '../middleware/auth.js';

const HOLIDAY_TYPES = ['National', 'Company', 'Department'];

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

export async function getHolidays(req, res) {
  res.json({ holidays: await getAllHolidays() });
}

// Super Admins hold role 'Admin' too, so this covers both.
export async function addHoliday(req, res) {
  requireRole(req, 'Admin');

  const name = String(req.body.name || '').trim();
  const date = String(req.body.date || '').trim();
  const type = HOLIDAY_TYPES.includes(req.body.type) ? req.body.type : 'Company';
  const department = type === 'Department' ? String(req.body.department || '').trim() : null;

  if (!name) throw badRequest('Holiday name is required.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
    throw badRequest('A valid holiday date is required.');
  }
  if (type === 'Department' && !department) throw badRequest('Department is required for a department holiday.');

  await createHoliday({
    id: buildId('HOL'),
    name,
    date,
    type,
    department,
    description: String(req.body.description || '').trim()
  });
  res.status(201).json({ holidays: await getAllHolidays() });
}

export async function removeHoliday(req, res) {
  requireRole(req, 'Admin');

  const deleted = await deleteHolidayById(req.params.id);
  if (!deleted) {
    const error = new Error('Holiday not found. National holidays from the live calendar cannot be deleted.');
    error.statusCode = 404;
    throw error;
  }
  res.json({ holidays: await getAllHolidays() });
}
