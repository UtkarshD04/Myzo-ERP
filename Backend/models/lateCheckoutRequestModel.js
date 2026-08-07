import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  placeName: String
}, { _id: false });

// Office (non-Field) Employees who try to punch out past 6:30 PM can't just
// self-serve a reason anymore (see attendanceService.checkOut) — they need
// their reporting manager (employee.reportsTo) to approve before the actual
// checkout is recorded. This collection tracks that request lifecycle. Field
// Employees are exempt from this gate; see autoPunchOutOpenRecords instead.
const lateCheckoutRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, default: null },
  managerId: { type: String, default: null },
  date: { type: String, required: true },
  reason: { type: String, required: true },
  location: { type: locationSchema, default: null },
  status: { type: String, default: 'Pending' }, // Pending | Approved | Rejected
  requestedAt: { type: Date, default: Date.now },
  reviewedBy: { type: String, default: null },
  reviewedAt: { type: Date, default: null },
  reviewComments: { type: String, default: null }
}, { timestamps: true });

lateCheckoutRequestSchema.index({ employeeId: 1, date: 1 });

export const LateCheckoutRequest = mongoose.model(
  'LateCheckoutRequest',
  lateCheckoutRequestSchema,
  'latecheckoutrequests'
);

export async function findAllLateCheckoutRequests() {
  return LateCheckoutRequest.find({}).sort({ createdAt: -1 }).lean();
}

export async function createLateCheckoutRequestRecord(record) {
  return LateCheckoutRequest.create(record);
}

export async function updateLateCheckoutRequestById(id, updates) {
  await LateCheckoutRequest.findOneAndUpdate({ id }, updates);
  return findAllLateCheckoutRequests();
}

// Requester sees their own; their manager (reportsTo match) sees the ones
// routed to them; Admin/HR get full visibility for oversight.
export function filterLateCheckoutRequestsForViewer(requests, viewer) {
  if (['Admin', 'HR'].includes(viewer.role)) return requests;
  return requests.filter(r => r.employeeId === viewer.id || r.managerId === viewer.id);
}
