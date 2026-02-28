import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from '../../database/schemas/tenant.schema';
import { WorkspaceSharedModule } from '../../workspaces/workspace-shared.module';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }]),
    WorkspaceSharedModule,
  ],
  controllers: [TenantController],
  providers: [TenantService],
})
export class TenantModule {}
