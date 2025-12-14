import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { Tenant, TenantSchema } from './schemas/tenant.schema';
import { User, UserSchema } from '../../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [TenantsService],
  controllers: [TenantsController],
  exports: [
    MongooseModule, // Export MongooseModule so Tenant model can be injected elsewhere
    TenantsService,
  ],
})
export class TenantsModule {}
