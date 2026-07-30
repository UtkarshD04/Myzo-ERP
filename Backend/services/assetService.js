import {
  Asset,
  createAssetRecord,
  updateAssetById,
  findAllAssets
} from '../models/assetModel.js';
import { Employee } from '../models/employeeModel.js';
import { addNotification } from '../models/notificationModel.js';
import { buildId } from './timeService.js';

const ASSET_MANAGER_ROLES = ['Admin', 'HR'];
const STATUSES = ['In Use', 'In Storage', 'Under Repair', 'Retired'];
const CONDITIONS = ['Good', 'Fair', 'Damaged'];

function requireAssetManager(role) {
  if (!ASSET_MANAGER_ROLES.includes(role)) {
    const error = new Error('Access denied. Only Admin or HR can manage assets.');
    error.statusCode = 403;
    throw error;
  }
}

export async function createAsset(payload = {}, requesterRole) {
  requireAssetManager(requesterRole);

  const { name } = payload;
  if (!name) {
    const error = new Error('Asset name is required.');
    error.statusCode = 400;
    throw error;
  }

  let assignedToName = null;
  if (payload.assignedTo) {
    const emp = await Employee.findOne({ id: payload.assignedTo }).lean();
    assignedToName = emp?.name || null;
  }

  await createAssetRecord({
    id: buildId('AST'),
    assetTag: payload.assetTag || '',
    name,
    category: payload.category || 'Other',
    serialNumber: payload.serialNumber || '',
    purchaseDate: payload.purchaseDate || '',
    purchaseCost: Number(payload.purchaseCost) || 0,
    assignedTo: payload.assignedTo || null,
    assignedToName,
    status: payload.assignedTo ? 'In Use' : 'In Storage',
    condition: payload.condition || 'Good',
    location: payload.location || '',
    warrantyExpiry: payload.warrantyExpiry || '',
    notes: payload.notes || ''
  });

  const notifications = await addNotification({
    id: buildId('NOT'),
    title: 'Asset Added',
    message: `${name} was added to the asset register${assignedToName ? `, assigned to ${assignedToName}` : ''}.`,
    time: 'Just now',
    read: false,
    category: 'Assets'
  });

  const assets = await findAllAssets();
  return { notifications, assets };
}

export async function updateAsset(id, updates = {}, requesterRole) {
  requireAssetManager(requesterRole);

  const asset = await Asset.findOne({ id }).lean();
  if (!asset) {
    const error = new Error('Asset not found.');
    error.statusCode = 404;
    throw error;
  }

  const patch = {};
  if (updates.name !== undefined) patch.name = updates.name;
  if (updates.category !== undefined) patch.category = updates.category;
  if (updates.serialNumber !== undefined) patch.serialNumber = updates.serialNumber;
  if (updates.purchaseDate !== undefined) patch.purchaseDate = updates.purchaseDate;
  if (updates.purchaseCost !== undefined) patch.purchaseCost = Number(updates.purchaseCost) || 0;
  if (updates.location !== undefined) patch.location = updates.location;
  if (updates.warrantyExpiry !== undefined) patch.warrantyExpiry = updates.warrantyExpiry;
  if (updates.notes !== undefined) patch.notes = updates.notes;

  if (updates.condition !== undefined) {
    if (!CONDITIONS.includes(updates.condition)) {
      const error = new Error(`Condition must be one of: ${CONDITIONS.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }
    patch.condition = updates.condition;
  }

  if (updates.status !== undefined) {
    if (!STATUSES.includes(updates.status)) {
      const error = new Error(`Status must be one of: ${STATUSES.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }
    patch.status = updates.status;
  }

  let reassigned = false;
  if (updates.assignedTo !== undefined) {
    reassigned = updates.assignedTo !== asset.assignedTo;
    patch.assignedTo = updates.assignedTo || null;
    if (patch.assignedTo) {
      const emp = await Employee.findOne({ id: patch.assignedTo }).lean();
      patch.assignedToName = emp?.name || null;
      if (updates.status === undefined && asset.status !== 'Retired' && asset.status !== 'Under Repair') {
        patch.status = 'In Use';
      }
    } else {
      patch.assignedToName = null;
      if (updates.status === undefined && asset.status !== 'Retired' && asset.status !== 'Under Repair') {
        patch.status = 'In Storage';
      }
    }
  }

  const assets = await updateAssetById(id, patch);

  if (reassigned || patch.status) {
    const notifications = await addNotification({
      id: buildId('NOT'),
      title: 'Asset Updated',
      message: `${asset.name} was ${reassigned ? (patch.assignedToName ? `reassigned to ${patch.assignedToName}` : 'unassigned') : `marked ${patch.status}`}.`,
      time: 'Just now',
      read: false,
      category: 'Assets'
    });
    return { notifications, assets };
  }

  return { assets };
}
