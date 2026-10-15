import mongoose from 'mongoose';

// Company-managed holidays (added by Admins). Calendarific's national
// holidays are fetched live and never stored here — see holidayService.
const holidaySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, sparse: true },
  name: { type: String, required: true },
  date: { type: String, required: true },
  type: { type: String, default: 'Company' },
  department: { type: String, default: null },
  description: { type: String, default: '' }
}, { timestamps: true });

export const Holiday = mongoose.model('Holiday', holidaySchema);

export async function findAllHolidays() {
  return Holiday.find({}).sort({ date: 1 }).lean();
}

export async function countHolidays() {
  return Holiday.countDocuments({});
}

export async function insertHolidays(holidays) {
  return Holiday.insertMany(holidays);
}

export async function createHoliday(holiday) {
  return Holiday.create(holiday);
}

export async function deleteHolidayById(id) {
  return Holiday.findOneAndDelete({ id }).lean();
}
