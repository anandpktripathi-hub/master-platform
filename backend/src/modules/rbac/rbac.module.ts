import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tenant, TenantSchema } from '../../database/schemas/tenant.schema';
import {
  Permission,
  PermissionSchema,
} from '../../database/schemas/permission.schema';
import { Role, RoleSchema } from '../../database/schemas/role.schema';
import {
  UserTenant,
  UserTenantSchema,
} from '../../database/schemas/user-tenant.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';
import { RbacService } from './rbac.service';
import { RbacController } from './rbac.controller';
import { SeedService } from './seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema },
      { name: Role.name, schema: RoleSchema },
      { name: UserTenant.name, schema: UserTenantSchema },
      { name: User.name, schema: UserSchema },
      { name: Tenant.name, schema: TenantSchema },
    ]),
  ],
  providers: [RbacService, SeedService],
  controllers: [RbacController],
  exports: [RbacService],
})
export class RbacModule implements OnModuleInit {
  constructor(private seedService: SeedService) {}

  async onModuleInit() {
    // Seed default permissions and roles when module initializes
    await this.seedService.seed();
  }
}
