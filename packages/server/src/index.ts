import http from 'http';
import { createApp } from './app';
import { WebSocketManager } from './services/WebSocketManager';
import { config } from './config';
import { logger } from './utils/logger';

function main() {
  const { app, dataProvider } = createApp();
  const server = http.createServer(app);

  const wsManager = new WebSocketManager(server, dataProvider);

  server.listen(config.port, () => {
    logger.info(`
╔══════════════════════════════════════════════════════════╗
║                   WORLD MONITOR SERVER                  ║
╠══════════════════════════════════════════════════════════╣
║  HTTP:      http://localhost:${config.port}                    ║
║  WebSocket: ws://localhost:${config.port}/ws                   ║
║  Mode:      ${config.nodeEnv.padEnd(43)}║
║  Data:      ${(config.useMockData ? 'Mock (simulated)' : 'Live APIs').padEnd(43)}║
╚══════════════════════════════════════════════════════════╝
    `);
  });

  const shutdown = () => {
    logger.info('Shutting down...');
    wsManager.shutdown();
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main();
