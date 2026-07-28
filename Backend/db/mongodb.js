import dns from 'node:dns';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/myzo-erp';

// Some Windows/VPN/antivirus setups block the raw UDP:53 SRV/TXT lookups
// Node's own resolver needs, even though the OS resolver (nslookup) handles
// them fine — that breaks mongodb+srv:// host discovery with ECONNREFUSED.
// Trying public resolvers first sidesteps that without any OS-level change.
if (MONGO_URI.startsWith('mongodb+srv://')) {
  dns.setServers(['8.8.8.8', '1.1.1.1', ...dns.getServers()]);
}

export async function connectDB() {
  await mongoose.connect(MONGO_URI);
  // Redact credentials before logging — the URI carries the DB password.
  console.log(`MongoDB connected: ${MONGO_URI.replace(/\/\/.*@/, '//<credentials>@')}`);
}

export default mongoose;
