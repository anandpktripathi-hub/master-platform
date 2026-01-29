import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantDatabaseService } from '../tenants/database/database.service';
import { TenantDatabaseModule } from '../tenants/database/database.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri:
          process.env.DATABASE_URL ||
          'mongodb://localhost:27017/master-platform',
      }),
    }),
    TenantDatabaseModule,
  ],
  providers: [TenantDatabaseService],
  exports: [MongooseModule, TenantDatabaseService],
})
export class DatabaseModule {}
