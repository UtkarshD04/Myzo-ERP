import { findAllStockMovements } from '../models/stockMovementModel.js';
import { requireRole } from '../middleware/auth.js';

export async function getStockMovements(req, res) {
  requireRole(req, 'Admin', 'Manager');
  const stockMovements = await findAllStockMovements();
  res.json({ stockMovements });
}
