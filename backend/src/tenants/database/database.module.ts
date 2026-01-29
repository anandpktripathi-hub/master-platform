import { Module } from '@nestjs/common';
import { TenantDatabaseService } from './database.service';
import { TenantConnectionManager } from './tenant-connection.manager';

@Module({
  providers: [TenantDatabaseService, TenantConnectionManager],
  exports: [TenantDatabaseService],
})
export class DatabaseModule {}
