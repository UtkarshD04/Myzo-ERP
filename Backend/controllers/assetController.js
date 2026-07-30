import { findAllAssets, filterAssetsForViewer } from '../models/assetModel.js';
import { createAsset, updateAsset } from '../services/assetService.js';

export async function getAssets(req, res) {
  const assets = filterAssetsForViewer(await findAllAssets(), req.user);
  res.json({ assets });
}

export async function addAsset(req, res) {
  const result = await createAsset(req.body, req.user.role);
  res.status(201).json(result);
}

export async function modifyAsset(req, res) {
  const result = await updateAsset(req.params.id, req.body, req.user.role);
  res.json(result);
}
