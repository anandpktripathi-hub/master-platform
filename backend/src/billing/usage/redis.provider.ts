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
      // eslint-disable-next-line no-console
      console.warn(
        '[RedisProvider] REDIS_URL not set. Using in-memory no-op Redis client. Set REDIS_URL to enable real Redis.',
      );

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
    }) as RedisClientType;

    try {
      await client.connect();
      // eslint-disable-next-line no-console
      console.log(`[RedisProvider] Connected to Redis at ${url}`);
      return client;
    } catch (err) {
      // If Redis is misconfigured or unavailable, fall back to a no-op client
      // instead of crashing the entire application.
      // eslint-disable-next-line no-console
      console.error(
        `[RedisProvider] Failed to connect to Redis at ${url}. Falling back to no-op client. Error:`,
        err,
      );

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
