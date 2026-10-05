import { requireRole } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { sendOfferLetterEmail } from '../services/mailService.js';

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

  res.json({ message: `Offer letter sent to ${to.trim()}.` });
}
