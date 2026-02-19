import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import {
  Permission,
  PermissionDocument,
  ModuleName,
} from '../../database/schemas/permission.schema';
import { Role, RoleDocument } from '../../database/schemas/role.schema';
import { Tenant, TenantDocument } from '../../database/schemas/tenant.schema';

@Injectable()
export class SeedService {
  private logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Permission.name)
    private permissionModel: Model<PermissionDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
  ) {}

  private async waitForConnection(): Promise<void> {
    // Use the underlying Mongoose connection from the injected model
    const connection: Connection | undefined = this.permissionModel
      ? (this.permissionModel.db as Connection | undefined)
      : undefined;

    if (!connection) {
      this.logger.warn(
        'No Mongoose connection available for RBAC seeding; skipping wait.',
      );
      return;
    }

    // 1 = connected, 2 = connecting; 0/3 = disconnected/disconnecting
    if (connection.readyState === 1) {
      return;
    }

    this.logger.log(
      `Waiting for MongoDB connection before RBAC seeding (state: ${connection.readyState})...`,
    );

    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        this.logger.error(
          'Timed out waiting for MongoDB connection; RBAC seeding will be skipped for now.',
        );
        resolve();
      }, 10000);

      connection.once('connected', () => {
        clearTimeout(timeout);
        this.logger.log('MongoDB connection is ready for RBAC seeding.');
        resolve();
      });

      connection.once('error', (err) => {
        clearTimeout(timeout);
        this.logger.error(
          'Error while waiting for MongoDB connection; RBAC seeding will be skipped for now.',
          err as Error,
        );
        resolve();
      });
    });
  }

  async seedPermissions(): Promise<void> {
    const existingCount = await this.permissionModel.countDocuments();
    if (existingCount > 0) {
      this.logger.log('Permissions already seeded, skipping...');
      return;
    }

    const modules: ModuleName[] = [
      'User',
      'Role',
      'Client',
      'Product & service',
      'Constant unit',
      'Constant tax',
      'Constant category',
      'Account',
      'HRM',
      'Expense',
      'Invoice',
      'Department',
      'Designation',
      'Branch',
      'Document Type',
      'Zoom meeting',
      'Employee',
      'POS',
    ];

    const actions = ['manage', 'create', 'edit', 'delete', 'show'] as const;

    const permissions = [];
    for (const module of modules) {
      for (const action of actions) {
        permissions.push({
          module,
          action,
          description: `${action} permission for ${module} module`,
        });
      }
    }

    await this.permissionModel.insertMany(permissions);
    this.logger.log(`Seeded ${permissions.length} permissions`);
  }

  async seedDefaultRoles(): Promise<void> {
    // Get sample tenant (or use null for platform roles)
    const tenants = await this.tenantModel.find().limit(1).lean();
    const tenantId = tenants.length > 0 ? tenants[0]._id : null;

    // Check if roles already seeded
    const existingCount = await this.roleModel.countDocuments({
      tenantId: tenantId || { $exists: false },
    });
    if (existingCount > 0) {
      this.logger.log('Default roles already seeded, skipping...');
      return;
    }

    // Get all permissions grouped by module
    const allPermissions = await this.permissionModel.find().lean();

    // Helper to get permission IDs for specific modules/actions
    const getPermissionIds = (
      modules: string[],
      actions: string[],
    ): Types.ObjectId[] => {
      return allPermissions
        .filter((p) => modules.includes(p.module) && actions.includes(p.action))
        .map((p) => new Types.ObjectId(p._id as any));
    };

    const defaultRoles = [
      {
        name: 'Accountant',
        description:
          'Accountant role with account and invoice management permissions',
        isSystem: true,
        permissionIds: getPermissionIds(
          [
            'Account',
            'Invoice',
            'Expense',
            'Constant tax',
            'Constant unit',
            'Constant category',
          ],
          ['manage', 'create', 'edit', 'delete', 'show'],
        ),
      },
      {
        name: 'HR',
        description:
          'HR role with employee and department management permissions',
        isSystem: true,
        permissionIds: getPermissionIds(
          ['Employee', 'HRM', 'Department', 'Designation', 'Branch', 'User'],
          ['manage', 'create', 'edit', 'delete', 'show'],
        ),
      },
      {
        name: 'Employee',
        description: 'Employee role with limited permissions',
        isSystem: true,
        permissionIds: getPermissionIds(
          ['Employee', 'User', 'Document Type'],
          ['show'],
        ),
      },
      {
        name: 'Manager',
        description: 'Manager role with broader permissions',
        isSystem: true,
        permissionIds: getPermissionIds(
          [
            'User',
            'Employee',
            'Department',
            'Designation',
            'Product & service',
            'Account',
            'Invoice',
            'Expense',
          ],
          ['manage', 'create', 'edit', 'delete', 'show'],
        ),
      },
      {
        name: 'Tenant Admin',
        description:
          'Tenant administrator role with full access to all ERP modules (accounts, invoices, expenses, POS, HRM, projects, etc.)',
        isSystem: true,
        // Full access: attach all permissions that exist
        permissionIds: allPermissions.map(
          (p) => new Types.ObjectId(p._id as any),
        ),
      },
    ];

    const rolesToInsert = defaultRoles.map((role) => ({
      ...role,
      tenantId: tenantId || undefined,
      permissions: role.permissionIds,
    }));

    await this.roleModel.insertMany(rolesToInsert);
    this.logger.log(`Seeded ${defaultRoles.length} default roles`);
  }

  async seed(): Promise<void> {
    this.logger.log('Starting seed...');
    try {
      await this.waitForConnection();
      await this.seedPermissions();
      await this.seedDefaultRoles();
      this.logger.log('Seed completed successfully');
    } catch (error) {
      // If MongoDB is not yet fully connected or any other error occurs,
      // log it but do not rethrow. This prevents unhandled rejections
      // from crashing the entire application during startup.
      this.logger.error(
        'RBAC seed failed, continuing without seeded data',
        error as Error,
      );
    }
  }
}
