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
    // Seed default permissions and roles when module initializes.
    // If seeding fails (e.g. transient DB connectivity), log but do not crash the app.
    // Important: do not block application startup on seeding.
    // If Mongo is slow/unavailable, awaiting this can prevent `app.listen()` and keep the
    // container unhealthy even though the rest of the app could serve requests.
    this.seedService.seed().catch((error) => {
      console.error(
        '[RbacModule] RBAC seeding failed, continuing without seeded roles/permissions:',
        error,
      );
    });
  }
}
