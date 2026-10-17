import Redis from 'ioredis';
import { EventEmitter } from 'events';
import { config } from '../config/env.js';

class DistributedPubSub {
  private pubClient: Redis | null = null;
  private subClient: Redis | null = null;
  private fallbackEmitter = new EventEmitter();
  public isConnected = false;

  constructor() {
    this.init();
  }

  private init(): void {
    try {
      this.pubClient = new Redis(config.REDIS_URL, {
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // Don't crash in offline local dev
        enableOfflineQueue: false,
      });

      this.pubClient.on('connect', () => {
        console.log('[Redis] Publisher connected to ' + config.REDIS_URL);
        this.isConnected = true;
      });

      this.pubClient.on('error', (err) => {
        if (!this.isConnected) {
          // Gracefully fallback to in-memory event bus
          // console.warn('[Redis] Connection unavailable, using local memory bus');
        }
      });

      this.subClient = this.pubClient.duplicate();
      this.subClient.on('error', () => {});
    } catch (e) {
      console.warn('[Redis] Operating in standalone memory mode');
    }
  }

  public async publish(channel: string, message: unknown): Promise<void> {
    const payload = typeof message === 'string' ? message : JSON.stringify(message);
    if (this.isConnected && this.pubClient) {
      try {
        await this.pubClient.publish(channel, payload);
        return;
      } catch {
        // Fallback
      }
    }
    this.fallbackEmitter.emit(channel, payload);
  }

  public subscribe(channel: string, handler: (message: string) => void): void {
    if (this.isConnected && this.subClient) {
      try {
        this.subClient.subscribe(channel);
        this.subClient.on('message', (ch, msg) => {
          if (ch === channel) handler(msg);
        });
      } catch {
        // Fallback
      }
    }
    this.fallbackEmitter.on(channel, handler);
  }
}

export const pubsub = new DistributedPubSub();
