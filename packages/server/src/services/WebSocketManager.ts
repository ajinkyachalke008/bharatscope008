import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { v4 as uuid } from 'uuid';
import { logger } from '../utils/logger';
import { config } from '../config';
import type { MockDataProvider } from './MockDataProvider';
import type { LiveDataProvider } from './LiveDataProvider';

interface ClientConnection {
  id: string;
  ws: WebSocket;
  alive: boolean;
  subscribedChannels: Set<string>;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, ClientConnection> = new Map();
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private dataTimer: NodeJS.Timeout | null = null;
  private dataProvider: MockDataProvider | LiveDataProvider;

  constructor(server: Server, dataProvider: MockDataProvider | LiveDataProvider) {
    this.dataProvider = dataProvider;
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws) => {
      if (this.clients.size >= config.ws.maxConnections) {
        ws.close(1013, 'Maximum connections reached');
        return;
      }

      const clientId = uuid();
      const client: ClientConnection = {
        id: clientId,
        ws,
        alive: true,
        subscribedChannels: new Set(['events', 'feeds', 'alerts', 'stats']),
      };

      this.clients.set(clientId, client);
      logger.info(`WebSocket client connected: ${clientId} (total: ${this.clients.size})`);

      // Broadcast updated count to all clients
      this.broadcastConnectionCount();

      this.sendToClient(client, {
        type: 'stats',
        payload: this.dataProvider.getStats(),
        timestamp: new Date().toISOString(),
      });

      ws.on('pong', () => {
        client.alive = true;
      });

      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          this.handleMessage(client, msg);
        } catch {
          /* ignore */
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        logger.info(`WebSocket client disconnected: ${clientId} (total: ${this.clients.size})`);
        this.broadcastConnectionCount();
      });

      ws.on('error', (err) => {
        logger.error(`WebSocket error for ${clientId}:`, err);
        this.clients.delete(clientId);
      });
    });

    this.startHeartbeat();
    this.setupEventListeners();
    this.startDataStream();
    logger.info('WebSocket server initialized');
  }

  private handleMessage(client: ClientConnection, msg: any): void {
    if (msg.type === 'subscribe' && msg.channel) {
      client.subscribedChannels.add(msg.channel);
    } else if (msg.type === 'unsubscribe' && msg.channel) {
      client.subscribedChannels.delete(msg.channel);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.clients.forEach((client, id) => {
        if (!client.alive) {
          client.ws.terminate();
          this.clients.delete(id);
          return;
        }
        client.alive = false;
        client.ws.ping();
      });
    }, config.ws.heartbeatInterval);
  }

  private setupEventListeners(): void {
    // If dataProvider is an EventEmitter (LiveDataProvider), listen for real-time events
    if (typeof (this.dataProvider as any).on === 'function') {
      const dp = this.dataProvider as LiveDataProvider;
      dp.on('newEvent', (event) => {
        this.broadcast('events', {
          type: 'event',
          payload: event,
          timestamp: new Date().toISOString(),
        });
      });
      dp.on('newFeed', (feed) => {
        this.broadcast('feeds', {
          type: 'feed',
          payload: feed,
          timestamp: new Date().toISOString(),
        });
      });
      dp.on('newAlert', (alert) => {
        this.broadcast('alerts', {
          type: 'alert',
          payload: alert,
          timestamp: new Date().toISOString(),
        });
      });
      dp.on('telemetryUpdate', (update) => {
        this.broadcast('telemetry', {
          type: 'telemetryUpdate',
          payload: update,
          timestamp: new Date().toISOString(),
        });
      });

      // Periodically broadcast stats to keep UI updated independently of events
      this.dataTimer = setInterval(() => {
        this.broadcast('stats', {
          type: 'stats',
          payload: this.dataProvider.getStats(),
          timestamp: new Date().toISOString(),
        });
      }, 5000);
    }
  }

  private startDataStream(): void {
    // If dataProvider is LiveDataProvider, we skip the fake intervals
    if (typeof (this.dataProvider as any).on === 'function') {
      return;
    }

    this.dataTimer = setInterval(() => {
      if (Math.random() > 0.4) {
        const event = this.dataProvider.generateNewEvent();
        this.broadcast('events', {
          type: 'event',
          payload: event,
          timestamp: new Date().toISOString(),
        });
      }

      const feed = this.dataProvider.generateNewFeed();
      if (feed) {
        this.broadcast('feeds', {
          type: 'feed',
          payload: feed,
          timestamp: new Date().toISOString(),
        });
      }

      const alert = this.dataProvider.generateNewAlert();
      if (alert) {
        this.broadcast('alerts', {
          type: 'alert',
          payload: alert,
          timestamp: new Date().toISOString(),
        });
      }

      this.broadcast('stats', {
        type: 'stats',
        payload: this.dataProvider.getStats(),
        timestamp: new Date().toISOString(),
      });
    }, 8000);
  }

  private broadcast(channel: string, message: object): void {
    const data = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.subscribedChannels.has(channel) && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    });
  }

  private sendToClient(client: ClientConnection, message: object): void {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  private broadcastConnectionCount(): void {
    const count = this.clients.size;
    const data = JSON.stringify({
      type: 'connection_count',
      payload: count,
      timestamp: new Date().toISOString(),
    });
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    });
  }

  getConnectionCount(): number {
    return this.clients.size;
  }

  shutdown(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.dataTimer) clearInterval(this.dataTimer);
    this.clients.forEach((client) => client.ws.close());
    this.wss.close();
  }
}
