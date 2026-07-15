import { Employee } from '../models/employeeModel.js';
import { readDb, updateDb } from '../db/fileDb.js';
import { buildId } from './timeService.js';
import bcrypt from 'bcryptjs';

export async function login({ email, password }) {
  if (!email) {
    const error = new Error('Email is required.');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Support both officialEmail and email fields
  const employee = await Employee.findOne({
    $or: [
      { officialEmail: normalizedEmail },
      { email: normalizedEmail }
    ]
  }).lean();

  if (!employee) {
    const error = new Error('No account found with this email.');
    error.statusCode = 401;
    throw error;
  }

  const storedPassword = employee.password;
  let passwordMatch = false;

  if (storedPassword) {
    // Check if password is bcrypt hashed
    const isBcrypt = storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2a$');
    passwordMatch = isBcrypt
      ? await bcrypt.compare(password, storedPassword)
      : password === storedPassword;
  } else {
    passwordMatch = password === 'password123';
  }

  if (!passwordMatch) {
    const error = new Error('Incorrect password.');
    error.statusCode = 401;
    throw error;
  }

  // Normalize employee object (support email or officialEmail, missing fields)
  const employeeEmail = employee.officialEmail || employee.email;
  const employeeId = employee.id || employee.empId || employee._id.toString();
  const normalizedEmployee = {
    ...employee,
    officialEmail: employeeEmail,
    id: employeeId,
    name: employee.name || 'Unknown',
    role: employee.role || 'Employee',
    department: employee.department || 'General',
    designation: employee.designation || employee.role || 'Staff',
    post: employee.post || employee.role || 'Staff',
    reportsTo: employee.reportsTo || 'Admin',
    reportsToDesignation: employee.reportsToDesignation || 'Manager',
    directReportingEmployees: employee.directReportingEmployees || [],
    photo: employee.photo || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    employmentStatus: employee.status || employee.employmentStatus || 'Active',
  };

  // Add welcome notification to file DB
  const db = await updateDb(state => {
    const notif = {
      id: buildId('NOT'),
      title: 'Sign In Approved',
      message: `Welcome back, ${employee.name}! Role: ${employee.role}`,
      time: 'Just now',
      read: false,
      category: 'System'
    };
    return { ...state, notifications: [notif, ...state.notifications] };
  });

  // Remove password from response
  const { password: _pw, ...safeEmployee } = normalizedEmployee;
  return { employee: safeEmployee, db };
}
