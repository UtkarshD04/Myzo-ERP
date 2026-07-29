import { verifyToken } from '../services/tokenService.js';

// Verifies the bearer token and attaches the decoded, server-trusted
// identity to req.user. Every controller must read role/id from here —
// never from a client-supplied header, which anyone can forge.
export function authenticate(req) {
  const header = req.headers['authorization'] || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    const error = new Error('Authentication required. Please log in.');
    error.statusCode = 401;
    throw error;
  }

  try {
    req.user = verifyToken(token);
  } catch {
    const error = new Error('Your session has expired or is invalid. Please log in again.');
    error.statusCode = 401;
    throw error;
  }
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
