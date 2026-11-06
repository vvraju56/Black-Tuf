import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from './env.js';

// Some networks run a DNS resolver that refuses SRV queries, which breaks
// `mongodb+srv://` connection strings. Set DNS_SERVERS (comma-separated) to
// resolve through public resolvers instead. Leave unset on normal networks.
if (process.env.DNS_SERVERS) {
  const servers = process.env.DNS_SERVERS.split(',')
    .map((server) => server.trim())
    .filter(Boolean);
  if (servers.length > 0) dns.setServers(servers);
}

export async function connectDatabase() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 15000,
    maxPoolSize: 10,
  });
  console.log(`[db] Connected to MongoDB (${mongoose.connection.name})`);
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
