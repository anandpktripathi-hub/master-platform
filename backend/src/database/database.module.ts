import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri:
          process.env.DATABASE_URI ||
          process.env.DATABASE_URL ||
          'mongodb://127.0.0.1:27017/smetasc-saas',
        // Make startup deterministic across environments.
        // In production we still retry, but finitely and with explicit timeouts.
        retryAttempts: Number(
          process.env.MONGO_RETRY_ATTEMPTS ||
            (process.env.NODE_ENV === 'production' ? 5 : 1),
        ),
        retryDelay: Number(
          process.env.MONGO_RETRY_DELAY_MS ||
            (process.env.NODE_ENV === 'production' ? 1000 : 500),
        ),
        serverSelectionTimeoutMS: Number(
          process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 5000,
        ),
        connectTimeoutMS: Number(process.env.MONGO_CONNECT_TIMEOUT_MS || 5000),
        connectionFactory: (connection) => {
          console.log(
            `[DatabaseModule] Mongoose connecting to: ${connection.host}:${connection.port}/${connection.name}`,
          );
          connection.on('connected', () => {
            console.log('[DatabaseModule] MongoDB connected');
          });
          connection.on('error', (err: unknown) => {
            console.error('[DatabaseModule] MongoDB error:', err);
          });
          return connection;
        },
      }),
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
