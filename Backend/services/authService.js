import crypto from 'node:crypto';
import { buildId } from './timeService.js';
import bcrypt from 'bcryptjs';
import { Employee } from '../models/employeeModel.js';
import { addNotification } from '../models/notificationModel.js';
import { signToken } from './tokenService.js';
import { sendPasswordResetEmail } from './mailService.js';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

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

  const status = employee.status || employee.employmentStatus;
  if (status && status !== 'Active') {
    const error = new Error('This account has been deactivated. Contact HR/Admin for access.');
    error.statusCode = 403;
    throw error;
  }

  const storedPassword = employee.password;

  // No hardcoded fallback here: this collection is shared with the company's
  // other app, so a record can legitimately reach this point with no
  // password field at all. Silently accepting a known literal for those
  // would be a standing authentication bypass for any such record —
  // instead, require HR/Admin to set a real password via modifyEmployee.
  if (!storedPassword) {
    const error = new Error('This account has no password set yet. Contact HR/Admin to set up access.');
    error.statusCode = 403;
    throw error;
  }

  const isBcrypt = storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2a$');
  const passwordMatch = isBcrypt
    ? await bcrypt.compare(password, storedPassword)
    : password === storedPassword;

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

  const notifications = await addNotification({
    id: buildId('NOT'),
    title: 'Sign In Approved',
    message: `Welcome back, ${employee.name}! Role: ${employee.role}`,
    time: 'Just now',
    read: false,
    category: 'System'
  });

  // Remove password/reset-token internals from response
  const { password: _pw, resetTokenHash: _rth, resetTokenExpiry: _rte, ...safeEmployee } = normalizedEmployee;
  const token = signToken(safeEmployee);
  return { employee: safeEmployee, notifications, token };
}

export async function requestPasswordReset(email) {
  if (!email) {
    const error = new Error('Email is required.');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const employee = await Employee.findOne({
    $or: [
      { officialEmail: normalizedEmail },
      { email: normalizedEmail }
    ]
  }).lean();

  // Never reveal whether the email exists — the controller always returns
  // the same generic message regardless of this function's outcome.
  if (!employee) return;

  const rawToken = crypto.randomBytes(32).toString('hex');
  await Employee.updateOne(
    { _id: employee._id },
    {
      resetTokenHash: hashResetToken(rawToken),
      resetTokenExpiry: new Date(Date.now() + RESET_TOKEN_TTL_MS)
    }
  );

  const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/?resetToken=${rawToken}`;
  const recipientEmail = employee.officialEmail || employee.email;
  await sendPasswordResetEmail({ ...employee, officialEmail: recipientEmail }, link);
}

export async function resetPassword(token, newPassword) {
  if (!token || !newPassword) {
    const error = new Error('Reset token and new password are required.');
    error.statusCode = 400;
    throw error;
  }
  if (newPassword.length < 6) {
    const error = new Error('Password must be at least 6 characters.');
    error.statusCode = 400;
    throw error;
  }

  const employee = await Employee.findOne({
    resetTokenHash: hashResetToken(token),
    resetTokenExpiry: { $gt: new Date() }
  }).lean();

  if (!employee) {
    const error = new Error('This reset link is invalid or has expired. Please request a new one.');
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await Employee.updateOne(
    { _id: employee._id },
    { password: hashedPassword, resetTokenHash: null, resetTokenExpiry: null }
  );
}
