import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { env } from './config/env.js';

async function main() {
  await connectDatabase();
  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`[api] BlackTuf API listening on http://localhost:${env.port}`);
    console.log(`[api] Environment: ${env.nodeEnv}`);
  });

  const shutdown = async (signal) => {
    console.log(`\n[api] ${signal} received. Shutting down…`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((error) => {
  console.error('[api] Failed to start:', error);
  process.exit(1);
});
