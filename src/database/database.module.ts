import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantDatabaseService } from '../tenants/database/database.service';
import { TenantDatabaseModule } from '../tenants/database/database.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => {
        const uri =
          process.env.DATABASE_URL ||
          'mongodb://localhost:27017/master-platform';

        // In dev/test we want `npm run start:dev` to come up even if Mongo
        // isn't running. In production, DB should be required.
        const mongoOptional =
          process.env.NODE_ENV !== 'production' &&
          String(process.env.MONGO_REQUIRED || '').toLowerCase() !== 'true';

        return {
          uri,

          // When a connection is attempted, fail fast rather than hanging.
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 5000,
          socketTimeoutMS: 5000,

          // Prevent dev server from crashing on initial connection failure.
          // NOTE: @nestjs/mongoose creates the connection immediately when
          // `uri` is provided; `lazyConnection` only avoids awaiting it.
          lazyConnection: mongoOptional,
          retryAttempts: mongoOptional ? 0 : 5,
          retryDelay: 1500,

          connectionFactory: (connection: any) => {
            if (!mongoOptional) return connection;

            // Consume initial connection promise rejection so Node doesn't
            // treat it as an unhandled rejection and crash.
            try {
              connection
                .asPromise()
                .catch((err: any) => {
                  const message = err?.message || String(err);
                  // eslint-disable-next-line no-console
                  console.warn(
                    `[DatabaseModule] MongoDB unavailable (${message}). Continuing without DB connection.`,
                  );
                });
            } catch {}

            try {
              connection.on('error', (err: any) => {
                const message = err?.message || String(err);
                // eslint-disable-next-line no-console
                console.warn(`[DatabaseModule] MongoDB error: ${message}`);
              });
            } catch {}

            return connection;
          },
        };
      },
    }),
    TenantDatabaseModule,
  ],
  providers: [TenantDatabaseService],
  exports: [MongooseModule, TenantDatabaseService],
})
export class DatabaseModule {}
