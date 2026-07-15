import {
  INITIAL_ATTENDANCE_HISTORY,
  INITIAL_EMPLOYEES,
  INITIAL_HOLIDAYS,
  INITIAL_KPIS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REPORTS,
  INITIAL_TASKS
} from '../../Frontend/src/data.js';

export function getInitialState() {
  return {
    employees: INITIAL_EMPLOYEES,
    tasks: INITIAL_TASKS,
    holidays: INITIAL_HOLIDAYS,
    notifications: INITIAL_NOTIFICATIONS,
    attendance: INITIAL_ATTENDANCE_HISTORY,
    reports: INITIAL_REPORTS,
    kpis: INITIAL_KPIS
  };
}
