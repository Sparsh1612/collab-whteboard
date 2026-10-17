import Redis from 'ioredis';
import { EventEmitter } from 'events';
import { config } from '../config/env.js';

class DistributedPubSub {
  private pubClient: Redis | null = null;
  private subClient: Redis | null = null;
  private fallbackEmitter = new EventEmitter();
  private handlers = new Map<string, Set<(message: string) => void>>();
  public isConnected = false;

  constructor() {
    this.init();
  }

  private init(): void {
    try {
      this.pubClient = new Redis(config.REDIS_URL);
      this.subClient = new Redis(config.REDIS_URL);

      this.pubClient.on('connect', () => {
        console.log('[Redis] Publisher connected to ' + config.REDIS_URL);
        this.isConnected = true;
      });

      this.subClient.on('connect', () => {
        console.log('[Redis] Subscriber connected to ' + config.REDIS_URL);
      });

      this.subClient.on('message', (channel: string, message: string) => {
        const channelHandlers = this.handlers.get(channel);
        if (channelHandlers) {
          for (const handler of channelHandlers) {
            try {
              handler(message);
            } catch (err) {
              console.error('[Redis] Handler error on channel ' + channel, err);
            }
          }
        }
      });

      this.pubClient.on('error', () => {});
      this.subClient.on('error', () => {});
    } catch (e) {
      console.warn('[Redis] Operating in fallback memory mode');
    }
  }

  public async publish(channel: string, message: unknown): Promise<void> {
    const payload = typeof message === 'string' ? message : JSON.stringify(message);

    if (this.pubClient && this.isConnected) {
      try {
        await this.pubClient.publish(channel, payload);
        return;
      } catch (err) {
        // Fallback to local in-memory emitter if publish fails
      }
    }
    this.fallbackEmitter.emit(channel, payload);
  }

  public subscribe(channel: string, handler: (message: string) => void): void {
    let channelHandlers = this.handlers.get(channel);
    if (!channelHandlers) {
      channelHandlers = new Set();
      this.handlers.set(channel, channelHandlers);
      if (this.subClient) {
        this.subClient.subscribe(channel).catch(() => {});
      }
    }
    channelHandlers.add(handler);
    this.fallbackEmitter.on(channel, handler);
  }
}

export const pubsub = new DistributedPubSub();
