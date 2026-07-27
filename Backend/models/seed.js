import 'dotenv/config';
import { connectDB } from '../db/mongodb.js';
import { Employee } from './employeeModel.js';

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@company.com';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';

// Additive only: this collection is shared with the company's existing
// live app, so existing employee records are never touched or dropped here.
async function seed() {
  await connectDB();

  const existing = await Employee.findOne({ officialEmail: ADMIN_EMAIL.toLowerCase() }).lean();
  if (existing) {
    console.log(`Admin account already exists for ${ADMIN_EMAIL} — nothing to do.`);
    process.exit(0);
  }

  await Employee.create({
    id: 'ADM001',
    name: 'Admin',
    department: 'Admin',
    designation: 'Administrator',
    post: 'Administrator',
    joiningDate: new Date().toISOString().split('T')[0],
    officialEmail: ADMIN_EMAIL,
    role: 'Admin',
    employmentStatus: 'Active',
    password: ADMIN_PASSWORD
  });

  console.log('Seeded one Admin account (no existing data was modified):');
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);
  console.log('Log in with these, then create every real employee from the Employee Directory screen.');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
