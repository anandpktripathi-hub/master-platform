import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RuntimeRole } from '../schemas/runtime-role.schema';
import { Permission } from '../enums/permission.enum';
import { Role } from '../enums/role.enum';
import { ROLE_PERMISSIONS } from '../constants/role-permissions.map';

/**
 * Service for managing runtime roles and permissions.
 * Can be extended to store role/permission assignments in DB for dynamic RBAC.
 */
@Injectable()
export class RolePermissionService {
  constructor(
    @InjectModel('RuntimeRole') private runtimeRoleModel: Model<RuntimeRole>,
  ) {}

  /**
   * Get permissions for a role.
   * First checks runtime DB, then falls back to static map.
   */
  async getPermissionsForRole(role: Role | string): Promise<Permission[]> {
    if (String(role) === String(Role.PLATFORM_SUPER_ADMIN)) {
      return Object.values(Permission) as Permission[];
    }

    // Try to fetch from runtime DB
    try {
      const runtimeRole = await this.runtimeRoleModel
        .findOne({ name: role, isActive: true })
        .exec();
      if (runtimeRole) {
        return runtimeRole.permissions;
      }
    } catch (error: unknown) {
      // Fall through to static map
    }

    // Fall back to static role-permissions map
    return ROLE_PERMISSIONS[role as Role] || [];
  }

  /**
   * Create or update a runtime role
   */
  async upsertRole(
    name: string,
    permissions: Permission[],
    description?: string,
  ): Promise<RuntimeRole> {
    return this.runtimeRoleModel
      .findOneAndUpdate(
        { name },
        { name, permissions, description, isActive: true },
        { upsert: true, new: true },
      )
      .exec();
  }

  /**
   * Get all runtime roles
   */
  async getAllRoles(): Promise<RuntimeRole[]> {
    return this.runtimeRoleModel.find({ isActive: true }).exec();
  }

  /**
   * Deactivate a runtime role
   */
  async deactivateRole(name: string): Promise<void> {
    await this.runtimeRoleModel.updateOne({ name }, { isActive: false }).exec();
  }

  /**
   * Check if a user with given role has a specific permission
   */
  async hasPermission(
    role: Role | string,
    permission: Permission,
  ): Promise<boolean> {
    const permissions = await this.getPermissionsForRole(role);
    return permissions.includes(permission);
  }

  /**
   * Check if a user with given role has any of the specified permissions
   */
  async hasAnyPermission(
    role: Role | string,
    permissions: Permission[],
  ): Promise<boolean> {
    const userPermissions = await this.getPermissionsForRole(role);
    return permissions.some((p) => userPermissions.includes(p));
  }

  /**
   * Check if a user with given role has all of the specified permissions
   */
  async hasAllPermissions(role: Role | string, permissions: Permission[]): Promise<boolean> {
    const rolePermissions = await this.getPermissionsForRole(role);
    return permissions.every((p) => rolePermissions.includes(p));
  }
}
