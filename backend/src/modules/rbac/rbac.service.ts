import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import {
  Permission,
  PermissionDocument,
} from '../../database/schemas/permission.schema';
import { Role, RoleDocument } from '../../database/schemas/role.schema';
import {
  UserTenant,
  UserTenantDocument,
} from '../../database/schemas/user-tenant.schema';
import { User, UserDocument } from '../../database/schemas/user.schema';
import {
  CreatePermissionDto,
  CreateRoleDto,
  UpdateRoleDto,
  CreateUserDto,
  UpdateUserDto,
  ResetPasswordDto,
  RoleDto,
  PermissionDto,
  UserTenantDto,
} from './dto/rbac.dto';

@Injectable()
export class RbacService {
  constructor(
    @InjectModel(Permission.name)
    private permissionModel: Model<PermissionDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(UserTenant.name)
    private userTenantModel: Model<UserTenantDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // ============= PERMISSION OPERATIONS =============

  async getAllPermissions(): Promise<PermissionDto[]> {
    const permissions = await this.permissionModel.find().lean().exec();
    return permissions.map((p) => this.mapPermissionToDto(p));
  }

  async getPermissionsByModule(module: string): Promise<PermissionDto[]> {
    const permissions = await this.permissionModel
      .find({ module })
      .lean()
      .exec();
    return permissions.map((p) => this.mapPermissionToDto(p));
  }

  async createPermission(dto: CreatePermissionDto): Promise<PermissionDto> {
    const existing = await this.permissionModel.findOne({
      action: dto.action,
      module: dto.module,
    });
    if (existing) {
      throw new BadRequestException(
        `Permission for action "${dto.action}" on module "${dto.module}" already exists`,
      );
    }
    const permission = await this.permissionModel.create(dto);
    return this.mapPermissionToDto(permission);
  }

  // ============= ROLE OPERATIONS =============

  async createRole(tenantId: string, dto: CreateRoleDto): Promise<RoleDto> {
    const existing = await this.roleModel.findOne({
      name: dto.name,
      tenantId: new Types.ObjectId(tenantId),
    });
    if (existing) {
      throw new BadRequestException(
        `Role "${dto.name}" already exists in this tenant`,
      );
    }

    // Validate permissions exist
    const permissionIds = dto.permissionIds.map((id) => new Types.ObjectId(id));
    const permissions = await this.permissionModel
      .find({ _id: { $in: permissionIds } })
      .lean()
      .exec();
    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('One or more permission IDs are invalid');
    }

    const role = await this.roleModel.create({
      name: dto.name,
      description: dto.description,
      tenantId: new Types.ObjectId(tenantId),
      permissions: permissionIds,
      isSystem: false,
    });

    return this.mapRoleToDto(role);
  }

  async updateRole(
    tenantId: string,
    roleId: string,
    dto: UpdateRoleDto,
  ): Promise<RoleDto> {
    const role = await this.roleModel.findOne({
      _id: new Types.ObjectId(roleId),
      tenantId: new Types.ObjectId(tenantId),
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new ForbiddenException('Cannot modify system roles');
    }

    if (dto.name) {
      const existing = await this.roleModel.findOne({
        _id: { $ne: new Types.ObjectId(roleId) },
        name: dto.name,
        tenantId: new Types.ObjectId(tenantId),
      });
      if (existing) {
        throw new BadRequestException(
          `Role "${dto.name}" already exists in this tenant`,
        );
      }
      role.name = dto.name;
    }

    if (dto.description) {
      role.description = dto.description;
    }

    if (dto.permissionIds) {
      const permissionIds = dto.permissionIds.map(
        (id) => new Types.ObjectId(id),
      );
      const permissions = await this.permissionModel
        .find({ _id: { $in: permissionIds } })
        .lean()
        .exec();
      if (permissions.length !== permissionIds.length) {
        throw new BadRequestException('One or more permission IDs are invalid');
      }
      role.permissions = permissionIds;
    }

    await role.save();
    return this.mapRoleToDto(role);
  }

  async getRolesByTenant(tenantId: string): Promise<RoleDto[]> {
    const roles = await this.roleModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .populate('permissions')
      .lean()
      .exec();
    return roles.map((r) => this.mapRoleToDto(r));
  }

  async getRoleById(tenantId: string, roleId: string): Promise<RoleDto> {
    const role = await this.roleModel
      .findOne({
        _id: new Types.ObjectId(roleId),
        tenantId: new Types.ObjectId(tenantId),
      })
      .populate('permissions')
      .lean()
      .exec();
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return this.mapRoleToDto(role);
  }

  async deleteRole(tenantId: string, roleId: string): Promise<void> {
    const role = await this.roleModel.findOne({
      _id: new Types.ObjectId(roleId),
      tenantId: new Types.ObjectId(tenantId),
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new ForbiddenException('Cannot delete system roles');
    }

    // Check if any users have this role
    const usersWithRole = await this.userTenantModel.countDocuments({
      roleId: new Types.ObjectId(roleId),
      tenantId: new Types.ObjectId(tenantId),
    });
    if (usersWithRole > 0) {
      throw new BadRequestException(
        'Cannot delete role that has users assigned',
      );
    }

    await this.roleModel.deleteOne({ _id: new Types.ObjectId(roleId) });
  }

  // ============= USER TENANT OPERATIONS =============

  async createTenantUser(
    tenantId: string,
    dto: CreateUserDto,
  ): Promise<UserTenantDto> {
    // Validate role exists in tenant
    const role = await this.roleModel.findOne({
      _id: new Types.ObjectId(dto.roleId),
      tenantId: new Types.ObjectId(tenantId),
    });
    if (!role) {
      throw new BadRequestException('Role not found in this tenant');
    }

    // Check if user email already exists
    let user = await this.userModel.findOne({ email: dto.email });
    if (!user) {
      // Create new user
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      user = await this.userModel.create({
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        isActive: true,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      });
    }

    // Create user-tenant relationship
    const existing = await this.userTenantModel.findOne({
      userId: user._id,
      tenantId: new Types.ObjectId(tenantId),
    });
    if (existing) {
      throw new BadRequestException('User already exists in this tenant');
    }

    const userTenant = await this.userTenantModel.create({
      userId: user._id,
      tenantId: new Types.ObjectId(tenantId),
      roleId: new Types.ObjectId(dto.roleId),
      isLoginEnabled: dto.isLoginEnabled !== false,
    });

    return this.mapUserTenantToDto(userTenant);
  }

  async getTenantUsers(
    tenantId: string,
    page = 1,
    limit = 10,
  ): Promise<{
    data: (UserTenantDto & { user: any; role: any })[];
    total: number;
  }> {
    const skip = (page - 1) * limit;
    const [userTenants, total] = await Promise.all([
      this.userTenantModel
        .find({ tenantId: new Types.ObjectId(tenantId) })
        .populate('userId')
        .populate('roleId')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.userTenantModel
        .countDocuments({ tenantId: new Types.ObjectId(tenantId) })
        .exec(),
    ]);

    const data = userTenants.map((ut) => ({
      ...this.mapUserTenantToDto(ut),
      user: ut.userId,
      role: ut.roleId,
    }));

    return { data, total };
  }

  async updateTenantUser(
    tenantId: string,
    userTenantId: string,
    dto: UpdateUserDto,
  ): Promise<UserTenantDto> {
    const userTenant = await this.userTenantModel.findOne({
      _id: new Types.ObjectId(userTenantId),
      tenantId: new Types.ObjectId(tenantId),
    });
    if (!userTenant) {
      throw new NotFoundException('User not found in this tenant');
    }

    if (dto.roleId) {
      const role = await this.roleModel.findOne({
        _id: new Types.ObjectId(dto.roleId),
        tenantId: new Types.ObjectId(tenantId),
      });
      if (!role) {
        throw new BadRequestException('Role not found in this tenant');
      }
      userTenant.roleId = new Types.ObjectId(dto.roleId);
    }

    if (typeof dto.isLoginEnabled === 'boolean') {
      userTenant.isLoginEnabled = dto.isLoginEnabled;
    }

    // Update user profile if needed
    if (dto.name) {
      await this.userModel.updateOne(
        { _id: userTenant.userId },
        { name: dto.name },
      );
    }

    if (dto.dateOfBirth) {
      await this.userModel.updateOne(
        { _id: userTenant.userId },
        { dateOfBirth: new Date(dto.dateOfBirth) },
      );
    }

    await userTenant.save();
    return this.mapUserTenantToDto(userTenant);
  }

  async deleteTenantUser(
    tenantId: string,
    userTenantId: string,
  ): Promise<void> {
    const userTenant = await this.userTenantModel.findOne({
      _id: new Types.ObjectId(userTenantId),
      tenantId: new Types.ObjectId(tenantId),
    });
    if (!userTenant) {
      throw new NotFoundException('User not found in this tenant');
    }

    await this.userTenantModel.deleteOne({
      _id: new Types.ObjectId(userTenantId),
    });
  }

  async resetUserPassword(
    tenantId: string,
    userTenantId: string,
    dto: ResetPasswordDto,
  ): Promise<void> {
    const userTenant = await this.userTenantModel.findOne({
      _id: new Types.ObjectId(userTenantId),
      tenantId: new Types.ObjectId(tenantId),
    });
    if (!userTenant) {
      throw new NotFoundException('User not found in this tenant');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.userModel.updateOne(
      { _id: userTenant.userId },
      { password: hashedPassword },
    );
  }

  async toggleUserLogin(
    tenantId: string,
    userTenantId: string,
    enable: boolean,
  ): Promise<UserTenantDto> {
    const userTenant = await this.userTenantModel.findOne({
      _id: new Types.ObjectId(userTenantId),
      tenantId: new Types.ObjectId(tenantId),
    });
    if (!userTenant) {
      throw new NotFoundException('User not found in this tenant');
    }

    userTenant.isLoginEnabled = enable;
    await userTenant.save();
    return this.mapUserTenantToDto(userTenant);
  }

  // ============= HELPER METHODS =============

  private mapPermissionToDto(permission: Permission): PermissionDto {
    return {
      _id: String((permission as any)._id || ''),
      action: permission.action,
      module: permission.module,
      description: permission.description,
      fields: (permission as any).fields || undefined,
    };
  }

  /**
   * Check if a user/role has permission for a specific action/module/field
   * @param permissions Array of PermissionDto
   * @param module Module name
   * @param action Action name
   * @param field Optional field name (for field-level check)
   */
  public static hasPermissionForField(
    permissions: { module: string; action: string; fields?: string[] }[],
    module: string,
    action: string,
    field?: string
  ): boolean {
    const perm = permissions.find(
      (p) => p.module === module && p.action === action
    );
    if (!perm) return false;
    if (!field) return true;
    if (!perm.fields || perm.fields.length === 0) return false;
    return perm.fields.includes(field);
  }

  private mapRoleToDto(role: any): RoleDto {
    const permissions = Array.isArray(role.permissions)
      ? role.permissions.map((p: any) =>
          this.mapPermissionToDto(p as Permission),
        )
      : [];

    return {
      _id: String(role._id),
      name: role.name,
      description: role.description,
      tenantId: role.tenantId ? String(role.tenantId) : undefined,
      isSystem: role.isSystem,
      permissions,
      isActive: role.isActive,
      createdAt: role.createdAt ? new Date(role.createdAt) : new Date(),
      updatedAt: role.updatedAt ? new Date(role.updatedAt) : new Date(),
    };
  }

  private mapUserTenantToDto(userTenant: any): UserTenantDto {
    return {
      _id: String(userTenant._id),
      userId: String(userTenant.userId),
      tenantId: String(userTenant.tenantId),
      roleId: String(userTenant.roleId),
      isLoginEnabled: userTenant.isLoginEnabled,
      status: userTenant.status,
      lastLoginAt: userTenant.lastLoginAt
        ? new Date(userTenant.lastLoginAt)
        : undefined,
      createdAt: userTenant.createdAt
        ? new Date(userTenant.createdAt)
        : new Date(),
      updatedAt: userTenant.updatedAt
        ? new Date(userTenant.updatedAt)
        : new Date(),
    };
  }
}
