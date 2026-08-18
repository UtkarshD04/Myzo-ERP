import {
  findAllProducts,
  findAllProductsForManagement,
  findProductById,
  createProduct,
  updateProductById,
  deleteProductById
} from '../models/productModel.js';
import { createStockMovement } from '../models/stockMovementModel.js';
import { buildId } from '../services/timeService.js';
import { requireRole } from '../middleware/auth.js';

// Catalog and stock mutations are reserved for the same tier that already
// controls Purchase Orders (see purchaseOrderService.INVENTORY_ROLES) —
// otherwise anyone could add products or hand-edit stock counts.
const PRODUCT_MUTATION_ROLES = ['Admin', 'Manager'];

export async function getProducts(req, res) {
  const products = await findAllProducts();
  res.json({ products });
}

export async function getManageProducts(req, res) {
  const products = await findAllProductsForManagement();
  res.json({ products });
}

export async function addProduct(req, res) {
  requireRole(req, ...PRODUCT_MUTATION_ROLES);

  const { series, model, stock } = req.body;

  if (!series || !model) {
    const error = new Error('Series and model are required.');
    error.statusCode = 400;
    throw error;
  }

  // `images` is the gallery shown on the website product page; `image` is
  // kept in sync as images[0] for older consumers that only read a single field.
  const images = Array.isArray(req.body.images)
    ? req.body.images.filter(Boolean)
    : (req.body.image ? [req.body.image] : []);

  try {
    const product = await createProduct({
      series,
      model,
      tagline: req.body.tagline || '',
      type: req.body.type || '',
      badge: req.body.badge || '',
      description: req.body.description || '',
      image: images[0] || null,
      images,
      color: req.body.color || '#2563eb',
      specs: Array.isArray(req.body.specs) ? req.body.specs : [],
      useCases: Array.isArray(req.body.useCases) ? req.body.useCases : [],
      stock: Number(stock) || 0,
      reservedStock: 0,
      discount: Number(req.body.discount) || 0,
      status: req.body.status || 'Active',
      isPublished: req.body.isPublished !== false
    });
    const products = await findAllProductsForManagement();
    res.status(201).json({ product, products });
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error('A product with this model name already exists.');
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
}

export async function modifyProduct(req, res) {
  requireRole(req, ...PRODUCT_MUTATION_ROLES);

  const { id } = req.params;
  const updates = { ...req.body };
  // reservedStock is only ever touched by the sanctioned reserve/release/
  // fulfill mutators (see productModel.js) — never by a routine product edit,
  // or a form that round-trips the full product object could silently
  // overwrite an open sales order's reservation.
  delete updates.reservedStock;
  if (updates.discount !== undefined) updates.discount = Number(updates.discount) || 0;
  if (Array.isArray(updates.images)) {
    updates.images = updates.images.filter(Boolean);
    updates.image = updates.images[0] || null;
  }

  let previousStock = null;
  if (updates.stock !== undefined) {
    const existing = await findProductById(id);
    previousStock = existing ? Number(existing.stock) || 0 : null;
    updates.stock = Number(updates.stock) || 0;

    const reserved = existing ? Number(existing.reservedStock) || 0 : 0;
    if (updates.stock < reserved) {
      const error = new Error(`Cannot set stock below the ${reserved} unit(s) already reserved for open sales orders.`);
      error.statusCode = 400;
      throw error;
    }
  }

  try {
    const product = await updateProductById(id, updates);
    if (!product) {
      const error = new Error('Product not found.');
      error.statusCode = 404;
      throw error;
    }

    if (previousStock !== null) {
      const delta = (Number(product.stock) || 0) - previousStock;
      if (delta !== 0) {
        await createStockMovement({
          id: buildId('STK'),
          productId: id,
          productName: `${product.series || ''} ${product.model || ''}`.trim(),
          model: product.model,
          type: 'Adjustment',
          quantity: delta,
          balanceAfter: product.stock,
          reference: null,
          note: 'Manual stock adjustment',
          createdBy: req.user.role || null
        });
      }
    }

    const products = await findAllProductsForManagement();
    res.json({ product, products });
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error('A product with this model name already exists.');
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
}

export async function removeProduct(req, res) {
  requireRole(req, ...PRODUCT_MUTATION_ROLES);

  const { id } = req.params;
  const product = await deleteProductById(id);
  if (!product) {
    const error = new Error('Product not found.');
    error.statusCode = 404;
    throw error;
  }
  const products = await findAllProductsForManagement();
  res.json({ id, products });
}
