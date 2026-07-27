import mongoose from 'mongoose';

// `products` belongs to the company's other live app, so — same rule as
// employeeModel.js — no Mongoose schema/model/index is declared here, only
// raw collection ops, and every write must satisfy that app's own unique
// index on `model` (see productController.js) to avoid colliding with it.
const products = () => mongoose.connection.db.collection('products');

export async function findAllProducts() {
  return products().find({ isPublished: true }).toArray();
}

// For the internal management screen (Admin/Sales Manager): every product,
// published or not, sorted newest first.
export async function findAllProductsForManagement() {
  return products().find({}).sort({ createdAt: -1 }).toArray();
}

export async function findProductById(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return products().findOne({ _id: new mongoose.Types.ObjectId(id) });
}

export async function createProduct(data) {
  const now = new Date().toISOString();
  const doc = { ...data, createdAt: now, updatedAt: now };
  const { insertedId } = await products().insertOne(doc);
  return products().findOne({ _id: insertedId });
}

export async function updateProductById(id, updates) {
  if (!mongoose.isValidObjectId(id)) return null;
  const _id = new mongoose.Types.ObjectId(id);
  await products().updateOne({ _id }, { $set: { ...updates, updatedAt: new Date().toISOString() } });
  return products().findOne({ _id });
}

// Signed delta: negative to deduct (sale), positive to restock (purchase order received).
export async function adjustProductStock(id, delta) {
  if (!mongoose.isValidObjectId(id)) return null;
  const _id = new mongoose.Types.ObjectId(id);
  await products().updateOne({ _id }, { $inc: { stock: delta }, $set: { updatedAt: new Date().toISOString() } });
  return products().findOne({ _id });
}

export async function deleteProductById(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  const _id = new mongoose.Types.ObjectId(id);
  const doc = await products().findOne({ _id });
  if (!doc) return null;
  await products().deleteOne({ _id });
  return doc;
}
