import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { Tenant, TenantSchema } from './schemas/tenant.schema';
import { User, UserSchema } from '@schemas/user.schema';
import { TenantDatabaseService } from '../../tenants/database/database.service';
import { TenantConnectionManager } from '../../tenants/database/tenant-connection.manager';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [TenantsService, TenantDatabaseService, TenantConnectionManager],
  controllers: [TenantsController],
  exports: [
    MongooseModule, // Export MongooseModule so Tenant model can be injected elsewhere
    TenantsService,
    TenantDatabaseService,
    TenantConnectionManager,
  ],
})
export class TenantsModule {}
