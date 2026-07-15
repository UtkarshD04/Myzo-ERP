import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  photo: String,
  department: String,
  designation: String,
  post: String,
  joiningDate: String,
  officialEmail: { type: String, required: true, unique: true, lowercase: true },
  phone: String,
  reportsTo: String,
  reportsToDesignation: String,
  directReportingEmployees: [String],
  employmentStatus: String,
  role: String,
  salary: Number,
  password: { type: String, default: 'password123' }
}, { timestamps: true });

export const Employee = mongoose.model('Employee', employeeSchema);
