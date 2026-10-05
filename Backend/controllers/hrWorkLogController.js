import {
  HrWorkLog, HR_ACTIVITIES, INTERVIEW_MODES, INTERVIEW_RESULTS, findHrWorkLogs
} from '../models/hrWorkLogModel.js';
import { requireRole } from '../middleware/auth.js';
import { buildId } from '../services/timeService.js';

const LOG_ROLES = ['Admin', 'HR'];
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

const text = (v) => String(v ?? '').trim();

// Validates a complete entry (create, or an edit merged onto the stored
// record) and returns only the fields relevant to its activity type, so
// switching an entry's activity can't leave stale interview fields behind.
function buildEntry(input) {
  if (!DATE_RE.test(text(input.date))) throw badRequest('Date must be in YYYY-MM-DD format.');
  if (!HR_ACTIVITIES.includes(input.activity)) throw badRequest(`Activity must be one of: ${HR_ACTIVITIES.join(', ')}.`);

  const entry = { date: text(input.date), activity: input.activity };

  if (input.activity === 'Interview') {
    if (!text(input.candidateName)) throw badRequest('Candidate name is required for an interview.');
    if (!text(input.domain)) throw badRequest('Domain is required for an interview.');
    if (!INTERVIEW_MODES.includes(input.mode)) throw badRequest(`Mode must be one of: ${INTERVIEW_MODES.join(', ')}.`);
    if (!INTERVIEW_RESULTS.includes(input.result)) throw badRequest(`Result must be one of: ${INTERVIEW_RESULTS.join(', ')}.`);
    Object.assign(entry, {
      count: 1,
      candidateName: text(input.candidateName),
      candidatePhone: text(input.candidatePhone),
      domain: text(input.domain),
      mode: input.mode,
      result: input.result,
      description: text(input.description)
    });
  } else {
    const count = Number(input.count ?? 1);
    if (!Number.isInteger(count) || count < 1) throw badRequest('Count must be a whole number of at least 1.');
    if (!text(input.description)) throw badRequest('Please describe the work done.');
    Object.assign(entry, {
      count,
      description: text(input.description),
      candidateName: '', candidatePhone: '', domain: '', mode: '', result: ''
    });
  }
  return entry;
}

export async function getHrWorkLogs(req, res) {
  requireRole(req, ...LOG_ROLES);
  const params = new URL(req.url, 'http://localhost').searchParams;
  const month = params.get('month') || '';
  if (month && !MONTH_RE.test(month)) throw badRequest('Month must be in YYYY-MM format.');
  const logs = await findHrWorkLogs({ month, viewer: req.user, loggedBy: params.get('loggedBy') || '' });
  res.json({ logs });
}

export async function addHrWorkLog(req, res) {
  requireRole(req, ...LOG_ROLES);
  const log = await HrWorkLog.create({
    ...buildEntry(req.body),
    id: buildId('HRW'),
    loggedBy: req.user.id,
    loggedByName: req.user.name
  });
  res.status(201).json({ log });
}

// Loads a log and checks the caller may change it: its author, or an Admin.
async function loadOwnedLog(req) {
  requireRole(req, ...LOG_ROLES);
  const log = await HrWorkLog.findOne({ id: req.params.id });
  if (!log) {
    const error = new Error('Work entry not found.');
    error.statusCode = 404;
    throw error;
  }
  if (req.user.role !== 'Admin' && log.loggedBy !== req.user.id) {
    const error = new Error('Access denied. You can only change your own work entries.');
    error.statusCode = 403;
    throw error;
  }
  return log;
}

export async function modifyHrWorkLog(req, res) {
  const log = await loadOwnedLog(req);
  Object.assign(log, buildEntry({ ...log.toObject(), ...req.body }));
  await log.save();
  res.json({ log: log.toObject() });
}

export async function removeHrWorkLog(req, res) {
  const log = await loadOwnedLog(req);
  await log.deleteOne();
  res.json({ message: 'Work entry deleted.' });
}
