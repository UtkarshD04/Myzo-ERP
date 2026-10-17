import { verifyToken } from '../services/tokenService.js';
import { findEmployeeById } from '../models/employeeModel.js';
import { isAccountActive } from '../services/accountStatus.js';

// Verifies the bearer token and attaches the decoded, server-trusted
// identity to req.user. Every controller must read role/id from here —
// never from a client-supplied header, which anyone can forge.
//
// The token alone isn't enough: it stays cryptographically valid for hours,
// so the employee is re-read on every request. A deactivated or deleted
// account is cut off immediately (401 → the app signs the user out), and
// role/super-admin flags always reflect the database, not a stale token.
export async function authenticate(req) {
  const header = req.headers['authorization'] || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    const error = new Error('Authentication required. Please log in.');
    error.statusCode = 401;
    throw error;
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    const error = new Error('Your session has expired or is invalid. Please log in again.');
    error.statusCode = 401;
    throw error;
  }

  const employee = await findEmployeeById(decoded.id);
  if (!employee) {
    const error = new Error('Your session is no longer valid. Please log in again.');
    error.statusCode = 401;
    throw error;
  }
  if (!isAccountActive(employee)) {
    const error = new Error('This account has been deactivated. Contact an Admin for access.');
    error.statusCode = 401;
    error.code = 'ACCOUNT_DEACTIVATED';
    throw error;
  }

  req.user = {
    ...decoded,
    role: employee.role || decoded.role,
    isSuperAdmin: employee.isSuperAdmin === true
  };
}

export function requireRole(req, ...allowedRoles) {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    const error = new Error('Access denied. You do not have permission to perform this action.');
    error.statusCode = 403;
    throw error;
  }
}

// For resources owned by whoever created them (quotations, invoices): lets
// the owner (matched by server-trusted req.user.id) manage their own record,
// or an elevated role manage anyone's.
export function requireOwnerOrRole(req, ownerId, ...allowedRoles) {
  if (req.user && (req.user.id === ownerId || allowedRoles.includes(req.user.role))) return;
  const error = new Error('Access denied. You do not have permission to perform this action.');
  error.statusCode = 403;
  throw error;
}
