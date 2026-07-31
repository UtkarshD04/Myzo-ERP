import bcrypt from 'bcryptjs';
import { findAllEmployees, findEmployeeById, createEmployee, updateEmployeeById, deleteEmployeeById, sanitizeEmployeeForViewer } from '../models/employeeModel.js';
import { buildId } from '../services/timeService.js';

const REQUIRED_FIELDS = ['name', 'officialEmail', 'department', 'designation', 'role', 'password'];

export async function getEmployees(req, res) {
  const employees = await findAllEmployees();
  res.json({ employees: employees.map(e => sanitizeEmployeeForViewer(e, req.user)) });
}

export async function addEmployee(req, res) {
  const requesterRole = req.user.role;
  if (requesterRole !== 'Admin' && requesterRole !== 'HR') {
    const error = new Error('Access denied. Only Admins or HR can add employees.');
    error.statusCode = 403;
    throw error;
  }

  // isSuperAdmin is bootstrap-only (set by models/seed.js) — never settable
  // through this endpoint, even by an Admin, so it can't be self-granted.
  delete req.body.isSuperAdmin;

  // Only the one designated Super Admin (not just any Admin) may create
  // another Admin account — mirrors modifyEmployee's grant-Admin guard.
  if (req.body.role === 'Admin' && !req.user.isSuperAdmin) {
    const error = new Error('Access denied. Only the Super Admin can create another Admin account.');
    error.statusCode = 403;
    throw error;
  }

  const missing = REQUIRED_FIELDS.filter(field => !req.body[field]);
  if (missing.length) {
    const error = new Error(`Missing required field(s): ${missing.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  if (req.body.password.length < 6) {
    const error = new Error('Password must be at least 6 characters.');
    error.statusCode = 400;
    throw error;
  }

  const password = await bcrypt.hash(req.body.password, 10);
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

// The only field a non-privileged employee may ever change, and only on their
// own record (see ProfileView's photo uploader). Everything else — org
// structure (reportsTo, department, designation...), identity, and
// compensation — requires Admin/HR, on ANY record including your own,
// otherwise an employee could e.g. rewrite their own/a colleague's `reportsTo`
// to fake a manager relationship and gain report-approval rights over them.
const SELF_SERVICE_FIELDS = ['photo'];

export async function modifyEmployee(req, res) {
  const { id } = req.params;
  const updates = { ...req.body };
  const requesterRole = req.user.role;
  const isPrivileged = requesterRole === 'Admin' || requesterRole === 'HR';
  const isSelf = req.user.id === id;

  // isSuperAdmin is bootstrap-only (set by models/seed.js) — never editable
  // through this endpoint, so no one (not even the Super Admin) can grant or
  // strip it via the API.
  delete updates.isSuperAdmin;

  if (!isPrivileged) {
    const onlySelfServiceFields = Object.keys(updates).every(field => SELF_SERVICE_FIELDS.includes(field));
    if (!isSelf || !onlySelfServiceFields) {
      const error = new Error('Access denied. You can only update your own photo — ask an Admin or HR for any other change.');
      error.statusCode = 403;
      throw error;
    }
  }

  // The Super Admin's own record — status, role, salary, everything — can
  // only ever be changed by the Super Admin themself. Not even another Admin
  // or HR may edit or deactivate it; this is what makes the "one indestructible
  // Admin" guarantee hold, not just the delete-block in removeEmployee.
  const existing = await findEmployeeById(id);
  if (existing?.isSuperAdmin && !isSelf) {
    const error = new Error('Access denied. Only the Super Admin can edit their own profile.');
    error.statusCode = 403;
    throw error;
  }

  // Granting the Admin role is reserved for the one designated Super Admin —
  // not just any Admin — since that's the whole point of having a single
  // account whose power can't be casually handed out. Compared against the
  // record's current role (not just the submitted value) so everyone else
  // can still freely edit an existing Admin's other fields without being
  // blocked by an unchanged role:'Admin' the edit form resubmits alongside them.
  if (updates.role === 'Admin' && !req.user.isSuperAdmin) {
    if (existing?.role !== 'Admin') {
      const error = new Error('Access denied. Only the Super Admin can grant the Admin role.');
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
  const requesterRole = req.user.role;
  if (requesterRole !== 'Admin' && requesterRole !== 'HR') {
    const error = new Error('Access denied. Only Admins or HR can delete employees.');
    error.statusCode = 403;
    throw error;
  }

  const { id } = req.params;

  const existing = await findEmployeeById(id);
  if (existing?.isSuperAdmin) {
    const error = new Error('The Super Admin account cannot be deleted.');
    error.statusCode = 403;
    throw error;
  }

  const employee = await deleteEmployeeById(id);
  if (!employee) {
    const error = new Error('Employee not found.');
    error.statusCode = 404;
    throw error;
  }

  res.json({ id });
}
