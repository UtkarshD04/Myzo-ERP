import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  placeName: String
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  name:       { type: String, default: null },
  role:       { type: String, default: null },
  department: { type: String, default: null },
  date: { type: String, required: true },
  checkIn: { type: String, default: null },
  checkInAt: { type: Date, default: null },
  checkInLocation: { type: locationSchema, default: null },
  checkOut: { type: String, default: null },
  checkOutAt: { type: Date, default: null },
  checkOutLocation: { type: locationSchema, default: null },
  workingHours: { type: Number, default: 0 },
  overtime: { type: Number, default: 0 },
  status: { type: String, default: 'Present' },
  lateMark: { type: Boolean, default: false }
}, { timestamps: true });

attendanceSchema.index({ employeeId: 1, date: 1 });

export const Attendance = mongoose.model('Attendance', attendanceSchema, 'attendance');

export async function findAttendanceHistory() {
  return Attendance.find({}).lean();
}

export async function createAttendanceRecord(record) {
  return Attendance.create(record);
}

export async function updateAttendanceRecord(employeeId, date, updater) {
  const record = await Attendance.findOne({ employeeId, date }).lean();
  const updated = updater(record);
  return Attendance.findOneAndUpdate({ employeeId, date }, updated, { returnDocument: 'after' }).lean();
}

// Attendance includes GPS check-in/out coordinates — Admin/HR/Manager get
// company-wide visibility (matches HRDashboard's "who's in today" widget),
// everyone else only ever needs their own (AttendanceView already only
// renders `myAttendance`, filtered client-side by employee.id).
export function filterAttendanceForViewer(records, viewer) {
  if (['Admin', 'HR', 'Manager'].includes(viewer.role)) return records;
  return records.filter(r => r.employeeId === viewer.id);
}
