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
  pan: String,
  esiNo: String,
  pfNo: String,
  uanNo: String,
  location: String,
  fatherName: String,
  fatherDob: String,
  motherName: String,
  motherDob: String,
  salary: Number,
  basicPercent: { type: Number, default: 50 },
  hraPercent: { type: Number, default: 40 },
  medicalAllowance: { type: Number, default: 2000 },
  pfPercent: { type: Number, default: 12 },
  // % of the total value of quotations this employee closed (status
  // "Accepted") in a given month, paid out as sales commission via payroll.
  commissionPercent: { type: Number, default: 0 },
  // No default: a hardcoded default here would be stored in plaintext (this
  // schema has no hashing hook), reintroducing the same known-password gap
  // authService.login guards against. Every real creation path (see
  // employeeController.addEmployee) sets an explicit bcrypt-hashed value.
  password: String,
  // Set only while a forgot-password reset link is outstanding; cleared on
  // use or replaced by a fresh request. The raw token is never stored —
  // only its sha256 hash (see authService.requestPasswordReset) — so a DB
  // leak alone can't be used to reset anyone's password.
  resetTokenHash: { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null }
}, { timestamps: true });

export { employeeSchema };
export const Employee = mongoose.model('Employee', employeeSchema);

// Excluded from every read path alongside password: a token hash has no
// legitimate reason to ever reach the frontend/localStorage.
const PUBLIC_PROJECTION = { password: 0, resetTokenHash: 0, resetTokenExpiry: 0 };

// Compensation and personal-document fields: only Admin/HR (or the employee
// viewing their own record) should ever see these for OTHER employees.
export const SENSITIVE_EMPLOYEE_FIELDS = [
  'bankName', 'accountNo', 'ifscCode', 'pan', 'esiNo', 'pfNo', 'uanNo',
  'fatherName', 'fatherDob', 'motherName', 'motherDob',
  'salary', 'basicPercent', 'hraPercent', 'medicalAllowance', 'pfPercent', 'commissionPercent'
];

export function stripSensitiveEmployeeFields(employee) {
  const safe = { ...employee };
  for (const field of SENSITIVE_EMPLOYEE_FIELDS) delete safe[field];
  return safe;
}

// Returns `employee` as `viewer` is allowed to see it: full record for
// Admin/HR or for the viewer's own profile, sensitive fields stripped otherwise.
export function sanitizeEmployeeForViewer(employee, viewer) {
  const isPrivileged = viewer.role === 'Admin' || viewer.role === 'HR';
  const isSelf = employee.id === viewer.id || employee.officialEmail === viewer.email;
  return (isPrivileged || isSelf) ? employee : stripSensitiveEmployeeFields(employee);
}

export async function findAllEmployees() {
  return Employee.find({}, PUBLIC_PROJECTION).lean();
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

export async function findEmployeeById(id) {
  return Employee.findOne(findByIdQuery(id)).lean();
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
