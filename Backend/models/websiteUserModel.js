import mongoose from 'mongoose';

// `users` belongs to the company's other live app (public website visitor
// accounts) — same rule as employeeModel.js/productModel.js: no schema/model
// declared here, only raw read-only collection ops, so we never collide with
// that app's own schema/indexes.
const users = () => mongoose.connection.db.collection('users');

export async function findAllWebsiteUsers() {
  return users().find({}, { projection: { password: 0 } }).sort({ createdAt: -1 }).toArray();
}
