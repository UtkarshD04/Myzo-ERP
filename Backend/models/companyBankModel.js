import mongoose from 'mongoose';

// Singleton settings document — there is only ever one row in this
// collection (the company's own payroll disbursement account + the bank
// manager contact it gets sent to), so no `id`/key field is needed, just
// query with an empty filter.
const companyBankSchema = new mongoose.Schema({
  accountHolderName: { type: String, default: '' },
  bankName: { type: String, default: '' },
  branch: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  ifscCode: { type: String, default: '' },
  // Advances by one every time a cheque is actually sent (see
  // consumeChequeNumber) — never edited directly by updateCompanyBank.
  nextChequeNumber: { type: Number, default: 100001 },
  bankManagerName: { type: String, default: '' },
  bankManagerEmail: { type: String, default: '' },
  bankManagerPhone: { type: String, default: '' },

  // Optional real cheque-leaf scan (base64 data URL, same "no file-storage
  // backend, store on the document" convention as product images — see
  // ProductsManagementView.jsx). When set, buildChequePdf draws this image as
  // the page background instead of its hand-drawn fallback layout.
  chequeLeafImage: { type: String, default: '' },
  // Percentages (0-1) of the image's width/height, calibrated by clicking on
  // the image in Settings — resolution-independent so they map onto the PDF
  // page regardless of the leaf's actual scan size.
  chequeFieldPositions: {
    date: { x: Number, y: Number },
    payee: { x: Number, y: Number },
    amountWords: { x: Number, y: Number },
    amountFigure: { x: Number, y: Number }
  }
}, { timestamps: true });

export const CompanyBank = mongoose.model('CompanyBank', companyBankSchema, 'companyBank');

export async function getOrCreateCompanyBank() {
  const existing = await CompanyBank.findOne({}).lean();
  if (existing) return existing;
  const created = await CompanyBank.create({});
  return created.toObject();
}

export async function updateCompanyBank(updates) {
  return CompanyBank.findOneAndUpdate({}, updates, { upsert: true, new: true, setDefaultsOnInsert: true }).lean();
}

// Atomic compare-and-increment: only advances the counter if `expectedNumber`
// is still the current one, so two concurrent "Send to Bank" clicks can't
// both claim the same cheque number. Returns the pre-update doc (the number
// that was just consumed) on success, or null if someone else already
// consumed it — the caller turns that into a 409 asking the client to retry.
export async function consumeChequeNumber(expectedNumber) {
  return CompanyBank.findOneAndUpdate(
    { nextChequeNumber: expectedNumber },
    { $inc: { nextChequeNumber: 1 } },
    { new: false }
  ).lean();
}
