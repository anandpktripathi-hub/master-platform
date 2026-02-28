import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkspaceService } from './workspace.service';
import { WorkspaceGuard } from '../guards/workspace.guard';
import { User, UserSchema } from '../database/schemas/user.schema';
import { Tenant, TenantSchema } from '../database/schemas/tenant.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Tenant.name, schema: TenantSchema },
    ]),
  ],
  providers: [WorkspaceService, WorkspaceGuard],
  exports: [WorkspaceService, WorkspaceGuard],
})
export class WorkspaceSharedModule {}
