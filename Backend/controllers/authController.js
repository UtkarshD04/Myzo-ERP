import { login, requestPasswordReset, resetPassword } from '../services/authService.js';

export async function loginEmployee(req, res) {
  const { employee, notifications, token } = await login(req.body);
  res.json({ employee, notifications, token });
}

export async function forgotPassword(req, res) {
  await requestPasswordReset(req.body.email);
  res.json({ message: 'If that email exists, a reset link has been sent.' });
}

export async function resetPasswordWithToken(req, res) {
  await resetPassword(req.body.token, req.body.newPassword);
  res.json({ message: 'Password updated. You can now log in.' });
}
