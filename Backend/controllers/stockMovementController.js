import { findAllStockMovements } from '../models/stockMovementModel.js';

export async function getStockMovements(req, res) {
  const stockMovements = await findAllStockMovements();
  res.json({ stockMovements });
}
