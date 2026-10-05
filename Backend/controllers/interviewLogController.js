import { InterviewLog, INTERVIEW_MODES, INTERVIEW_RESULTS, findInterviewLogs } from '../models/interviewLogModel.js';
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

function parseQuery(url) {
  return new URL(url, 'http://localhost').searchParams;
}

function validate(body, { partial = false } = {}) {
  const fields = {};
  const required = ['date', 'candidateName', 'mode', 'domain', 'result'];
  if (!partial) {
    const missing = required.filter(f => !String(body[f] ?? '').trim());
    if (missing.length) throw badRequest(`Missing required field(s): ${missing.join(', ')}`);
  }
  if (body.date !== undefined) {
    if (!DATE_RE.test(body.date)) throw badRequest('Date must be in YYYY-MM-DD format.');
    fields.date = body.date;
  }
  if (body.mode !== undefined) {
    if (!INTERVIEW_MODES.includes(body.mode)) throw badRequest(`Mode must be one of: ${INTERVIEW_MODES.join(', ')}.`);
    fields.mode = body.mode;
  }
  if (body.result !== undefined) {
    if (!INTERVIEW_RESULTS.includes(body.result)) throw badRequest(`Result must be one of: ${INTERVIEW_RESULTS.join(', ')}.`);
    fields.result = body.result;
  }
  for (const f of ['candidateName', 'candidatePhone', 'domain', 'notes']) {
    if (body[f] !== undefined) fields[f] = String(body[f]).trim();
  }
  if (fields.candidateName === '' || fields.domain === '') throw badRequest('Candidate name and domain cannot be empty.');
  return fields;
}

export async function getInterviewLogs(req, res) {
  requireRole(req, ...LOG_ROLES);
  const params = parseQuery(req.url);
  const month = params.get('month') || '';
  if (month && !MONTH_RE.test(month)) throw badRequest('Month must be in YYYY-MM format.');
  const interviews = await findInterviewLogs({ month, viewer: req.user, conductedBy: params.get('conductedBy') || '' });
  res.json({ interviews });
}

export async function addInterviewLog(req, res) {
  requireRole(req, ...LOG_ROLES);
  const fields = validate(req.body);
  const interview = await InterviewLog.create({
    ...fields,
    id: buildId('INT'),
    conductedBy: req.user.id,
    conductedByName: req.user.name
  });
  res.status(201).json({ interview });
}

// Loads a log and checks the caller may change it: its author, or an Admin.
async function loadOwnedLog(req) {
  requireRole(req, ...LOG_ROLES);
  const log = await InterviewLog.findOne({ id: req.params.id });
  if (!log) {
    const error = new Error('Interview entry not found.');
    error.statusCode = 404;
    throw error;
  }
  if (req.user.role !== 'Admin' && log.conductedBy !== req.user.id) {
    const error = new Error('Access denied. You can only change your own interview entries.');
    error.statusCode = 403;
    throw error;
  }
  return log;
}

export async function modifyInterviewLog(req, res) {
  const log = await loadOwnedLog(req);
  Object.assign(log, validate(req.body, { partial: true }));
  await log.save();
  res.json({ interview: log.toObject() });
}

export async function removeInterviewLog(req, res) {
  const log = await loadOwnedLog(req);
  await log.deleteOne();
  res.json({ message: 'Interview entry deleted.' });
}
