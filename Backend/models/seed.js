import { connectDB } from '../db/mongodb.js';
import { Employee } from './employeeModel.js';
import { INITIAL_EMPLOYEES } from '../../Frontend/src/data.js';

async function seed() {
  await connectDB();
  await Employee.collection.drop().catch(() => {});
  const docs = INITIAL_EMPLOYEES.map(e => ({ ...e, password: 'password123' }));
  await Employee.insertMany(docs);
  console.log(`Seeded ${docs.length} employees into MongoDB.`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
