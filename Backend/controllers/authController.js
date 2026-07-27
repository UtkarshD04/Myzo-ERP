import { login } from '../services/authService.js';

export async function loginEmployee(req, res) {
  const { employee, notifications } = await login(req.body);
  res.json({ employee, notifications });
}
