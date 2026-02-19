import { Provider } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const RedisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: async (): Promise<RedisClientType> => {
    const url = process.env.REDIS_URL;

    if (!url) {
      // In local/dev environments without Redis, provide a safe no-op client
      // so the app can start without a running Redis instance.
      // Any method call will just resolve without doing anything.

      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          '[RedisProvider] REDIS_URL not set. Redis is disabled (using no-op client).',
        );
      }

      const noopHandler: ProxyHandler<RedisClientType> = {
        get() {
          return async () => undefined as unknown as never;
        },
      };

      const stubClient = new Proxy({} as RedisClientType, noopHandler);
      return stubClient;
    }

    const client: RedisClientType = createClient({
      url,
      // Treat Redis as optional: do not retry forever during bootstrap.
      // If Redis is down, fail fast so we can fall back to a no-op client.
      socket: {
        connectTimeout: Number(process.env.REDIS_CONNECT_TIMEOUT_MS || 1500),
        reconnectStrategy: () => new Error('Redis unavailable'),
      },
    }) as RedisClientType;

    // Keep a silent error listener at all times to prevent a late "error" event
    // from crashing the process when Redis is unavailable.
    client.on('error', () => {
      /* optional dependency; suppress noisy connection errors */
    });

    try {
      await client.connect();

      console.log(`[RedisProvider] Connected to Redis at ${url}`);
      return client;
    } catch (err) {
      // If Redis is misconfigured or unavailable, fall back to a no-op client
      // instead of crashing the entire application.

      const message = err instanceof Error ? err.message : String(err);
      console.warn(
        `[RedisProvider] Redis unavailable (${message}). Falling back to no-op client.`,
      );

      // Best-effort cleanup. Do not await disconnect here: depending on redis
      // client state, it can hang and block Nest bootstrap.
      try {
        client.removeAllListeners();
      } catch {
        // ignore
      }

      // After removing listeners, keep a silent error handler to avoid an
      // unhandled "error" event if the client emits late.
      try {
        client.on('error', () => {
          /* ignore */
        });
      } catch {
        // ignore
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (client as any).destroy?.();
      } catch {
        // ignore
      }

      try {
        void client.disconnect();
      } catch {
        // ignore
      }

      const noopHandler: ProxyHandler<RedisClientType> = {
        get() {
          return async () => undefined as unknown as never;
        },
      };

      const stubClient = new Proxy({} as RedisClientType, noopHandler);
      return stubClient;
    }
  },
};
