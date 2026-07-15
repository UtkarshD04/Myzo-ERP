import { checkInEmployee, checkOutEmployee } from '../controllers/attendanceController.js';
import { loginEmployee } from '../controllers/authController.js';
import { getBootstrapData } from '../controllers/bootstrapController.js';
import { deleteOne, markAllRead, markOneRead } from '../controllers/notificationController.js';
import { addReport, getReports } from '../controllers/reportController.js';
import { addTask, getTasks } from '../controllers/taskController.js';

export const routes = [
  { method: 'GET', path: '/api/bootstrap', handler: getBootstrapData },
  { method: 'POST', path: '/api/auth/login', handler: loginEmployee },
  { method: 'POST', path: '/api/attendance/check-in', handler: checkInEmployee },
  { method: 'POST', path: '/api/attendance/check-out', handler: checkOutEmployee },
  { method: 'PATCH', path: '/api/notifications/read-all', handler: markAllRead },
  { method: 'PATCH', path: '/api/notifications/:id/read', handler: markOneRead },
  { method: 'DELETE', path: '/api/notifications/:id', handler: deleteOne },
  { method: 'GET', path: '/api/tasks', handler: getTasks },
  { method: 'POST', path: '/api/tasks', handler: addTask },
  { method: 'GET', path: '/api/reports', handler: getReports },
  { method: 'POST', path: '/api/reports', handler: addReport }
];
