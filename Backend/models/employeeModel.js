import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  // sparse: this collection is shared with the company's other live app,
  // whose existing employee records use empId/email instead of id/officialEmail
  id: { type: String, required: true, unique: true, sparse: true },
  // mirrors id: the shared collection's other schema has its own unique,
  // non-sparse index on this field (see employeeController.addEmployee)
  empId: String,
  name: String,
  photo: String,
  department: String,
  designation: String,
  post: String,
  joiningDate: String,
  officialEmail: { type: String, required: true, unique: true, sparse: true, lowercase: true },
  // mirrors officialEmail: the shared collection's other schema has its own
  // unique, non-sparse index on this field (see employeeController.addEmployee)
  email: String,
  phone: String,
  reportsTo: String,
  reportsToDesignation: String,
  directReportingEmployees: [String],
  employmentStatus: String,
  role: String,
  bankName: String,
  accountNo: String,
  ifscCode: String,
  salary: Number,
  basicPercent: { type: Number, default: 50 },
  hraPercent: { type: Number, default: 40 },
  medicalAllowance: { type: Number, default: 2000 },
  pfPercent: { type: Number, default: 12 },
  password: { type: String, default: 'password123' }
}, { timestamps: true });

export { employeeSchema };
export const Employee = mongoose.model('Employee', employeeSchema);

export async function findAllEmployees() {
  return Employee.find({}, { password: 0 }).lean();
}

export async function createEmployee(data) {
  const employee = await Employee.create(data);
  const { password, ...safe } = employee.toObject();
  return safe;
}

function findByIdQuery(id) {
  // Match on id, or on the other app's empId, since this collection is shared
  // and the frontend only ever sees the normalized id (see bootstrapController).
  const query = { $or: [{ id }, { empId: id }] };
  if (mongoose.isValidObjectId(id)) {
    query.$or.push({ _id: id });
  }
  return query;
}

export async function updateEmployeeById(id, updates) {
  const employee = await Employee.findOneAndUpdate(findByIdQuery(id), updates, { new: true }).lean();
  if (!employee) return null;
  const { password, ...safe } = employee;
  return safe;
}

export async function deleteEmployeeById(id) {
  const employee = await Employee.findOneAndDelete(findByIdQuery(id)).lean();
  if (!employee) return null;
  const { password, ...safe } = employee;
  return safe;
}
