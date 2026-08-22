import http from 'http';
import config from './config/index';
import { createApp } from './app';
import { bootstrapAdmin } from './config/bootstrap';
import { setupSocketServer } from './sockets';

const startServer = async (): Promise<void> => {
  const app = createApp();
  const server = http.createServer(app);

  setupSocketServer(server);

  server.listen(config.port, () => {
    console.log(`[server] ${config.projectName} API listening on port ${config.port} (${config.nodeEnv})`);
    setTimeout(async () => {
      try {
        await bootstrapAdmin();
      } catch (err) {
        console.error('[server] Bootstrap error:', err);
      }
    }, 1000);
  });

  process.on('unhandledRejection', (err: Error) => {
    console.error('[server] Unhandled rejection:', err.message);
    server.close(() => process.exit(1));
  });
};

startServer();


