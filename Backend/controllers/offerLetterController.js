import { requireRole } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { sendOfferLetterEmail } from '../services/mailService.js';
import {
  OFFER_LETTER_TYPES, OFFER_LETTER_ACTIONS, createOfferLetterRecord, findOfferLetterHistory
} from '../models/offerLetterModel.js';
import { buildId } from '../services/timeService.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PDF_BASE64_CHARS = 1_800_000; // ~1.3 MB PDF; the request body is capped at 2 MB anyway

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

// Emails a generated offer letter PDF to the candidate from the HR mailbox.
// Admin/HR only — otherwise any employee could use the company's HR address to
// send arbitrary attachments to arbitrary recipients.
export async function sendOfferLetter(req, res) {
  requireRole(req, 'Admin', 'HR');
  rateLimit(`offer-letter:${req.user.id}`, { max: 30, windowMs: 60 * 60 * 1000 });

  const { to, candidateName, position, isInternship, fileName, pdfBase64 } = req.body;

  if (typeof to !== 'string' || !EMAIL_RE.test(to.trim())) throw badRequest("A valid candidate email address is required.");
  if (!String(candidateName || '').trim()) throw badRequest('Candidate name is required.');
  if (typeof pdfBase64 !== 'string' || !pdfBase64.startsWith('JVBERi0')) throw badRequest('A PDF attachment is required.');
  if (pdfBase64.length > MAX_PDF_BASE64_CHARS) throw badRequest('The PDF is too large to email.');

  await sendOfferLetterEmail({
    to: to.trim(),
    candidateName: String(candidateName).trim(),
    position: String(position || '').trim(),
    isInternship: isInternship === true,
    fileName: String(fileName || 'Offer-Letter.pdf').replace(/[^\w.\- ]+/g, '_').slice(0, 100),
    pdfBase64
  });

  // The mail is already out at this point — a failure to write the history
  // row must not turn a delivered email into an error for the user.
  await createOfferLetterRecord({
    id: buildId('OFL'),
    type: isInternship === true ? 'Internship' : 'Full Time',
    action: 'Emailed',
    candidateName: String(candidateName).trim(),
    candidateEmail: to.trim(),
    position: String(position || '').trim(),
    generatedBy: req.user.id,
    generatedByName: req.user.name
  }).catch(err => console.error('Offer letter history write failed:', err.message));

  res.json({ message: `Offer letter sent to ${to.trim()}.` });
}

// Records a download (emails are recorded by sendOfferLetter itself, so the
// client can't fabricate an "Emailed" row).
export async function recordOfferLetterDownload(req, res) {
  requireRole(req, 'Admin', 'HR');
  const { type, candidateName, candidateEmail, position } = req.body;
  if (!OFFER_LETTER_TYPES.includes(type)) throw badRequest(`Type must be one of: ${OFFER_LETTER_TYPES.join(', ')}.`);
  if (!String(candidateName || '').trim()) throw badRequest('Candidate name is required.');

  const record = await createOfferLetterRecord({
    id: buildId('OFL'),
    type,
    action: OFFER_LETTER_ACTIONS[0],
    candidateName: String(candidateName).trim(),
    candidateEmail: String(candidateEmail || '').trim(),
    position: String(position || '').trim(),
    generatedBy: req.user.id,
    generatedByName: req.user.name
  });
  res.status(201).json({ record });
}

export async function getOfferLetterHistory(req, res) {
  requireRole(req, 'Admin', 'HR');
  res.json({ history: await findOfferLetterHistory() });
}
