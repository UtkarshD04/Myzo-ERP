import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error('JWT_SECRET is not set. Add it to Backend/.env before starting the server.');
}

const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';

// Payload carries only what authorization checks need — never trust a
// client-supplied role/id again, this is the one source of truth for both.
export function signToken(employee) {
  return jwt.sign(
    { id: employee.id, role: employee.role, name: employee.name, email: employee.officialEmail },
    SECRET,
    { expiresIn: EXPIRES_IN }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
