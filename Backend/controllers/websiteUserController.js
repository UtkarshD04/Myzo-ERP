import { findAllWebsiteUsers } from '../models/websiteUserModel.js';

export async function getWebsiteUsers(req, res) {
  const websiteUsers = await findAllWebsiteUsers();
  res.json({ websiteUsers });
}
