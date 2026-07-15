import { login } from '../services/authService.js';

export async function loginEmployee(req, res) {
  const { employee, db } = await login(req.body);
  res.json({ employee, ...db });
}
