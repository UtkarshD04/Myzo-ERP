import mongoose from 'mongoose';

export const OFFER_LETTER_TYPES = ['Full Time', 'Internship', 'NDA'];
export const OFFER_LETTER_ACTIONS = ['Downloaded', 'Emailed'];

// One row each time an offer letter (or NDA) is generated — downloaded by HR
// or emailed to the candidate — so there is a company-wide history of who got
// what and who issued it. The PDF itself is not stored.
const offerLetterSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, sparse: true },
  type: { type: String, enum: OFFER_LETTER_TYPES, required: true },
  action: { type: String, enum: OFFER_LETTER_ACTIONS, required: true },
  candidateName: { type: String, required: true },
  candidateEmail: String, // recipient, for emailed letters
  position: String,
  generatedBy: { type: String, required: true }, // employee id of the HR/Admin
  generatedByName: String
}, { timestamps: true });

export const OfferLetter = mongoose.model('OfferLetter', offerLetterSchema);

export async function createOfferLetterRecord(record) {
  return OfferLetter.create(record);
}

export async function findOfferLetterHistory({ limit = 500 } = {}) {
  return OfferLetter.find({}).sort({ createdAt: -1 }).limit(limit).lean();
}
