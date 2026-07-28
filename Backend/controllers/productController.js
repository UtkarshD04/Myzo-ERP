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

export async function getProducts(req, res) {
  const products = await findAllProducts();
  res.json({ products });
}

export async function getManageProducts(req, res) {
  const products = await findAllProductsForManagement();
  res.json({ products });
}

export async function addProduct(req, res) {
  const { series, model, stock } = req.body;

  if (!series || !model) {
    const error = new Error('Series and model are required.');
    error.statusCode = 400;
    throw error;
  }

  try {
    const product = await createProduct({
      series,
      model,
      tagline: req.body.tagline || '',
      type: req.body.type || '',
      badge: req.body.badge || '',
      description: req.body.description || '',
      image: req.body.image || null,
      color: req.body.color || '#2563eb',
      specs: Array.isArray(req.body.specs) ? req.body.specs : [],
      useCases: Array.isArray(req.body.useCases) ? req.body.useCases : [],
      stock: Number(stock) || 0,
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
  const { id } = req.params;
  const updates = { ...req.body };
  if (updates.discount !== undefined) updates.discount = Number(updates.discount) || 0;

  let previousStock = null;
  if (updates.stock !== undefined) {
    const existing = await findProductById(id);
    previousStock = existing ? Number(existing.stock) || 0 : null;
    updates.stock = Number(updates.stock) || 0;
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
