import bcrypt from 'bcryptjs';
import { findAllEmployees, createEmployee, updateEmployeeById, deleteEmployeeById } from '../models/employeeModel.js';
import { buildId } from '../services/timeService.js';

const REQUIRED_FIELDS = ['name', 'officialEmail', 'department', 'designation', 'role'];

export async function getEmployees(req, res) {
  const employees = await findAllEmployees();
  res.json({ employees });
}

export async function addEmployee(req, res) {
  const missing = REQUIRED_FIELDS.filter(field => !req.body[field]);
  if (missing.length) {
    const error = new Error(`Missing required field(s): ${missing.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const password = await bcrypt.hash(req.body.password || 'password123', 10);
  const normalizedEmail = req.body.officialEmail.trim().toLowerCase();

  const newId = buildId('EMP');

  try {
    const employee = await createEmployee({
      ...req.body,
      id: newId,
      officialEmail: normalizedEmail,
      // Also set `email`/`empId`: this collection is shared with the company's
      // other app, whose own unique indexes are on those fields (non-sparse) —
      // leaving them unset would make every new hire collide on a null value.
      email: normalizedEmail,
      empId: newId,
      employmentStatus: req.body.employmentStatus || 'Active',
      password
    });
    res.status(201).json({ employee });
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error('An employee with this email already exists.');
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
}

export async function modifyEmployee(req, res) {
  const { id } = req.params;
  const updates = { ...req.body };

  // Only Admin or HR is authorized to change protected fields (identity + compensation)
  const PROTECTED_FIELDS = [
    'name', 'officialEmail', 'password', 'salary', 'basicPercent', 'hraPercent', 'medicalAllowance', 'pfPercent', 'commissionPercent',
    'bankName', 'accountNo', 'ifscCode', 'pan', 'esiNo', 'pfNo', 'uanNo', 'location', 'fatherName', 'fatherDob', 'motherName', 'motherDob'
  ];
  const hasProtectedChanges = PROTECTED_FIELDS.some(field => updates[field] !== undefined);
  if (hasProtectedChanges) {
    const requesterRole = req.user.role;
    if (requesterRole !== 'Admin' && requesterRole !== 'HR') {
      const error = new Error('Access denied. Only Admins can modify these protected fields.');
      error.statusCode = 403;
      throw error;
    }
  }

  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
  }

  if (updates.officialEmail) {
    updates.officialEmail = updates.officialEmail.trim().toLowerCase();
    updates.email = updates.officialEmail;
  }

  const employee = await updateEmployeeById(id, updates);
  if (!employee) {
    const error = new Error('Employee not found.');
    error.statusCode = 404;
    throw error;
  }

  res.json({ employee });
}

export async function removeEmployee(req, res) {
  const { id } = req.params;
  const employee = await deleteEmployeeById(id);
  if (!employee) {
    const error = new Error('Employee not found.');
    error.statusCode = 404;
    throw error;
  }

  res.json({ id });
}
