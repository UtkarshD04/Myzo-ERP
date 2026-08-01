import { generatePayrollForMonth } from '../controllers/payrollController.js';

const AUTO_GENERATE_DAY = 5; // run once full attendance for the prior month is in

let lastAutoGenDateKey = null;

function previousMonthString(date) {
  const prev = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
}

// Auto-generates every active employee's salary slip for the previous month
// on the 5th of each month, so HR doesn't have to remember to click
// "Generate Payroll". Slips land with approved: false — they only reach the
// employee's Payslips & Docs page once HR/Admin approves them from the
// employee's profile in the directory.
export async function runMonthlyPayrollAutoGeneration() {
  const now = new Date();
  if (now.getDate() !== AUTO_GENERATE_DAY) return;

  const dateKey = now.toISOString().split('T')[0];
  if (lastAutoGenDateKey === dateKey) return; // already ran today
  lastAutoGenDateKey = dateKey;

  const month = previousMonthString(now);
  await generatePayrollForMonth(month, {
    generatedBy: 'system-auto',
    generatedByName: 'Auto (Monthly Payroll)'
  });
}
