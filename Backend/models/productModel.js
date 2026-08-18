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

// Signed delta on the reservation counter: positive when a Sales Order
// confirms (holds stock aside), negative when it's cancelled (releases it
// back). `stock` itself is untouched — available = stock - reservedStock.
// Only ever call this with a negative delta (release) — reserving forward
// must go through reserveProductStock below, which guards against
// overselling; this one has no such guard.
export async function adjustProductReservedStock(id, delta) {
  if (!mongoose.isValidObjectId(id)) return null;
  const _id = new mongoose.Types.ObjectId(id);
  await products().updateOne({ _id }, { $inc: { reservedStock: delta }, $set: { updatedAt: new Date().toISOString() } });
  return products().findOne({ _id });
}

// Atomically reserves `quantity` units against a product's *available*
// stock (stock - reservedStock) — the check and the increment happen as a
// single database operation via $expr, so two concurrent reservations
// against the same product can never both succeed past what's available.
// Returns the updated doc on success, or null if the product doesn't exist
// or doesn't have enough available stock — callers treat null as "insufficient".
export async function reserveProductStock(id, quantity) {
  if (!mongoose.isValidObjectId(id)) return null;
  const _id = new mongoose.Types.ObjectId(id);
  return products().findOneAndUpdate(
    { _id, $expr: { $lte: [{ $add: [{ $ifNull: ['$reservedStock', 0] }, quantity] }, '$stock'] } },
    { $inc: { reservedStock: quantity }, $set: { updatedAt: new Date().toISOString() } },
    { returnDocument: 'after' }
  );
}

// Fulfillment step (Sales Order -> Invoice): the reserved quantity actually
// leaves the warehouse, so `stock` and `reservedStock` drop together in one
// atomic update rather than two separate adjustments.
export async function fulfillReservedStock(id, quantity) {
  if (!mongoose.isValidObjectId(id)) return null;
  const _id = new mongoose.Types.ObjectId(id);
  await products().updateOne({ _id }, { $inc: { stock: -quantity, reservedStock: -quantity }, $set: { updatedAt: new Date().toISOString() } });
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
